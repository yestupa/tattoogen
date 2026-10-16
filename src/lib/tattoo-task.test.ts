import { describe, expect, it } from 'vitest';

import { defaultComposerSettings } from './agent-settings';
import {
  buildTaskAttachments,
  buildTattooTaskPrompt,
  drawTattooFontLines,
  fontPreviewLines,
  hasTattooGapShape,
  measureTattooFontLines,
  personalizeTattooIdeas,
  preflightTattooTaskTurn,
  saveTattooTaskTurn,
  taskAttachmentNameMaxLength,
  taskAttachmentUrlMaxLength,
  validateTattooTask,
  type TattooTaskInput,
} from './tattoo-task';

const input: TattooTaskInput = {
  kind: 'idea',
  text: '',
  theme: 'A swallow and my grandmother’s handwriting',
  meaning: 'A safe return home',
  mood: 'Quiet, hopeful',
  placement: 'Left inner forearm',
  style: 'Fine line with open space',
  size: '8 cm tall',
  notes: 'Keep the handwriting unchanged',
  coverMode: 'cover-up',
};

describe('task-specific required inputs', () => {
  it('requires exact lettering without discarding intentional whitespace', () => {
    expect(() =>
      validateTattooTask({ ...input, kind: 'font', text: '  ' }, {})
    ).toThrow('exact-text-required');
    expect(() =>
      validateTattooTask(
        { ...input, kind: 'font', text: '  A & B\n永远  ' },
        {}
      )
    ).not.toThrow();
  });

  it.each(['image', 'coverup'] as const)(
    'requires a decoded source for %s',
    (kind) => {
      expect(() => validateTattooTask({ ...input, kind }, {})).toThrow(
        'source-required'
      );
      expect(() =>
        validateTattooTask({ ...input, kind }, { source: true })
      ).not.toThrow();
    }
  );

  it('requires a theme and an actual marked or drawn guide for filler', () => {
    expect(() =>
      validateTattooTask(
        { ...input, kind: 'filler', theme: '' },
        { guide: true }
      )
    ).toThrow('theme-required');
    expect(() => validateTattooTask({ ...input, kind: 'filler' }, {})).toThrow(
      'guide-required'
    );
    expect(() =>
      validateTattooTask({ ...input, kind: 'filler' }, { guide: true })
    ).not.toThrow();
  });

  it('bounds user content before creating a transport payload', () => {
    expect(() =>
      validateTattooTask({ ...input, notes: 'x'.repeat(2001) }, {})
    ).toThrow('input-too-long');
  });
});

describe('faithful task prompts', () => {
  it('keeps exact lettering and user constraints as parseable delimited data', () => {
    const text = '  Mei & Zoë\n永远 <end>  ';
    const prompt = buildTattooTaskPrompt({ ...input, kind: 'font', text }, {});
    const data = JSON.parse(
      prompt
        .split('USER_DESIGN_DATA_BEGIN\n')[1]
        .split('\nUSER_DESIGN_DATA_END')[0]
    );
    expect(data.text).toBe(text);
    expect(data.placement).toBe(input.placement);
    expect(data.style).toBe(input.style);
    expect(data.notes).toBe(input.notes);
    expect(prompt).toContain(
      'exact characters, spelling, punctuation, case and line breaks'
    );
    expect(prompt).not.toContain('<end>');
  });

  it('gives cover-up and rework distinct preservation instructions and realistic limits', () => {
    const cover = buildTattooTaskPrompt(
      { ...input, kind: 'coverup' },
      { source: true }
    );
    const rework = buildTattooTaskPrompt(
      { ...input, kind: 'coverup', coverMode: 'rework' },
      { source: true }
    );
    expect(cover).toContain('bold coverage');
    expect(cover).toContain('cannot guarantee physical coverage');
    expect(rework).toContain('Retain the recognizable existing motif');
    expect(rework).not.toContain('Replace the existing motif');
  });

  it('describes annotation roles and protects surrounding work without promising pixel accuracy', () => {
    const prompt = buildTattooTaskPrompt(
      { ...input, kind: 'filler' },
      { source: true, guide: true }
    );
    expect(prompt).toContain('image 1 is the unmarked source');
    expect(prompt).toContain('image 2 is the annotation guide');
    expect(prompt).toContain('Keep surrounding existing tattoos');
    expect(prompt).toContain('Guide marks must not appear');
    expect(prompt).toContain('not a guarantee of pixel preservation');
  });

  it('does not silently replace a personal theme with a preset', () => {
    const prompt = buildTattooTaskPrompt(input, {});
    expect(prompt).toContain(input.theme);
    expect(prompt).toContain(input.meaning);
    expect(prompt).toContain(input.mood);
  });
});

describe('source and annotation transport', () => {
  it('always orders the source before the annotation and uses durable URLs', () => {
    const attachments = buildTaskAttachments({
      annotation: { name: 'gap.png', url: 'https://media.example/gap.png' },
      source: { name: 'source.jpg', url: 'https://media.example/source.jpg' },
    });
    expect(attachments.map((a) => a.kind)).toEqual(['source', 'annotation']);
    expect(
      attachments.every((a) => a.status === 'uploaded' && a.preview === a.url)
    ).toBe(true);
    expect(() =>
      buildTaskAttachments({
        source: { name: 'source.jpg', url: 'blob:local' },
      })
    ).toThrow('attachment-url');
  });

  it('labels a standalone drawn shape as an annotation rather than a source photo', () => {
    expect(
      buildTaskAttachments({
        annotation: { name: 'shape.png', url: '/uploads/shape.png' },
      })[0].kind
    ).toBe('annotation');
  });

  it('saves the existing initial-turn contract before returning a navigation destination', () => {
    const saved = new Map<string, string>();
    const settings = defaultComposerSettings();
    const prompt = buildTattooTaskPrompt(input, {});
    const destination = saveTattooTaskTurn(
      { setItem: (key, value) => saved.set(key, value) },
      's-1777280106721-q5mzjc',
      { prompt, settings, attachments: [] }
    );
    expect(destination).toBe('/chat/s-1777280106721-q5mzjc');
    expect(
      JSON.parse(saved.get('agent:initial-turn:s-1777280106721-q5mzjc')!)
    ).toEqual({ prompt, settings, attachments: [] });
  });

  it('fails closed when session storage is unavailable', () => {
    expect(() =>
      saveTattooTaskTurn(
        {
          setItem: () => {
            throw new Error('quota');
          },
        },
        's-1777280106721-q5mzjc',
        {
          prompt: 'design',
          settings: defaultComposerSettings(),
          attachments: [],
        }
      )
    ).toThrow('storage-unavailable');
  });
});

describe('real handoff storage capacity preflight', () => {
  const sessionId = 's-1777280106721-q5mzjc';
  const initial = {
    prompt: 'Preserve these exact words. '.repeat(200),
    settings: defaultComposerSettings(),
  };

  function quotaStorage(capacity: number) {
    const values = new Map<string, string>();
    const writes: { key: string; value: string }[] = [];
    return {
      values,
      writes,
      setItem(key: string, value: string) {
        const otherSize = Array.from(values).reduce(
          (size, [storedKey, storedValue]) =>
            size +
            (storedKey === key ? 0 : storedKey.length + storedValue.length),
          0
        );
        if (otherSize + key.length + value.length > capacity)
          throw new Error('quota');
        values.set(key, value);
        writes.push({ key, value });
      },
      removeItem(key: string) {
        values.delete(key);
      },
    };
  }

  it('rejects storage that accepts a one-character check but cannot fit the actual prompt', () => {
    const storage = quotaStorage(1000);
    storage.setItem('tattoo:storage-check', '1');
    storage.removeItem('tattoo:storage-check');
    expect(() =>
      preflightTattooTaskTurn(storage, sessionId, initial, [])
    ).toThrow('storage-unavailable');
    expect(storage.values.size).toBe(0);
  });

  it('probes the actual prompt and settings plus worst-case attachment metadata, then cleans up', () => {
    const storage = quotaStorage(200000);
    preflightTattooTaskTurn(storage, sessionId, initial, [
      'source',
      'annotation',
    ]);
    expect(storage.values.size).toBe(0);
    expect(storage.writes[0].key).not.toMatch(/^agent:initial-turn:/);
    const probe = JSON.parse(storage.writes[0].value);
    expect(probe.prompt).toBe(initial.prompt);
    expect(probe.settings).toEqual(initial.settings);
    expect(
      probe.attachments.map((attachment: { kind: string }) => attachment.kind)
    ).toEqual(['source', 'annotation']);

    const prefix = 'https://media.example/';
    const url = prefix + 'a'.repeat(taskAttachmentUrlMaxLength - prefix.length);
    const attachments = buildTaskAttachments({
      source: { name: '\u0000'.repeat(taskAttachmentNameMaxLength), url },
      annotation: { name: '"'.repeat(taskAttachmentNameMaxLength), url },
    });
    saveTattooTaskTurn(storage, sessionId, { ...initial, attachments });
    const actual = storage.writes[1];
    expect(
      storage.writes[0].key.length + storage.writes[0].value.length
    ).toBeGreaterThanOrEqual(actual.key.length + actual.value.length);
  });

  it('rejects insufficient attachment headroom even when the prompt alone fits', () => {
    const storage = quotaStorage(10000);
    expect(() =>
      preflightTattooTaskTurn(storage, sessionId, initial, [])
    ).not.toThrow();
    expect(() =>
      preflightTattooTaskTurn(storage, sessionId, initial, [
        'source',
        'annotation',
      ])
    ).toThrow('storage-unavailable');
    expect(storage.values.size).toBe(0);
  });

  it('bounds stored filenames and rejects upload URLs beyond the reserved maximum', () => {
    const attachment = buildTaskAttachments({
      source: {
        name: 'x'.repeat(taskAttachmentNameMaxLength + 10),
        url: 'https://media.example/source.png',
      },
    })[0];
    expect(attachment.name.length).toBe(taskAttachmentNameMaxLength);
    expect(() =>
      buildTaskAttachments({
        source: {
          name: 'source.png',
          url:
            'https://media.example/' + 'x'.repeat(taskAttachmentUrlMaxLength),
        },
      })
    ).toThrow('attachment-url');
  });

  it('stores canonical bounded attachment fields rather than extra metadata', () => {
    const storage = quotaStorage(200000);
    preflightTattooTaskTurn(storage, sessionId, initial, ['source']);
    const source = buildTaskAttachments({
      source: { name: 'source.png', url: 'https://media.example/source.png' },
    })[0];
    saveTattooTaskTurn(storage, sessionId, {
      ...initial,
      attachments: [
        {
          ...source,
          id: 'x'.repeat(100000),
          preview: 'x'.repeat(100000),
          error: 'x'.repeat(100000),
        },
      ],
    });
    const actual = JSON.parse(
      storage.values.get(`agent:initial-turn:${sessionId}`)!
    );
    expect(actual.attachments[0].id).toBe('task-source');
    expect(actual.attachments[0].preview).toBe(source.url);
    expect(actual.attachments[0]).not.toHaveProperty('error');
  });
});

describe('free local font layout', () => {
  it('keeps line breaks and preserves Unicode characters in stacked previews', () => {
    expect(fontPreviewLines('A  B\n永远', 'lines')).toEqual(['A  B', '永远']);
    expect(fontPreviewLines('A💙', 'stacked')).toEqual(['A', '💙']);
  });

  it('keeps combining marks and joined emoji together as complete graphemes', () => {
    expect(fontPreviewLines('Zoe\u0308 👨‍👩‍👧‍👦', 'stacked')).toEqual([
      'Z',
      'o',
      'e\u0308',
      ' ',
      '👨‍👩‍👧‍👦',
    ]);
  });

  it('measures complete shaped text with spacing counted by grapheme', () => {
    const measured: string[] = [];
    const context = {
      letterSpacing: '0px',
      measureText: (text: string) => {
        measured.push(text);
        return { width: 60 };
      },
      fillText: () => {},
    };
    expect(measureTattooFontLines(context, ['Zoe\u0308'], 4)).toEqual({
      width: 68,
      spacing: 4,
    });
    expect(measureTattooFontLines(context, ['👨‍👩‍👧‍👦'], 4)).toEqual({
      width: 60,
      spacing: 4,
    });
    expect(measured).toEqual(['Zoe\u0308', '👨‍👩‍👧‍👦']);
  });

  it('draws entire lines at zero spacing when Canvas cannot preserve native letter spacing', () => {
    const drawn: string[] = [];
    const context = {
      measureText: () => ({ width: 60 }),
      fillText: (text: string) => {
        drawn.push(text);
      },
    };
    const lines = ['Zoe\u0308', '👨‍👩‍👧‍👦', 'سلام'];
    const metrics = measureTattooFontLines(context, lines, 8);
    expect(metrics.spacing).toBe(0);
    drawTattooFontLines(context, lines, {
      spacing: metrics.spacing,
      padding: 20,
      size: 40,
    });
    expect(drawn).toEqual(lines);
    expect(drawn).not.toContain('\u0308');
    expect(drawn).not.toContain('👨');
  });
});

describe('personal questionnaire directions', () => {
  it('builds distinct, deterministic briefs from the actual answers', () => {
    const templates = [
      'A single {theme} for {placement}, {style}, {size}; meaning: {meaning}; mood: {mood}.',
      'Frame {theme} in negative space. {meaning}; {placement}; {style}; {size}; {mood}.',
    ];
    const result = personalizeTattooIdeas(input, templates);
    expect(result).toHaveLength(2);
    expect(result[0]).toContain(input.theme);
    expect(result[0]).toContain(input.placement);
    expect(result[0]).toContain(input.meaning);
    expect(result[0]).not.toBe(result[1]);
    expect(personalizeTattooIdeas(input, templates)).toEqual(result);
    expect(() =>
      personalizeTattooIdeas({ ...input, theme: '' }, templates)
    ).toThrow('theme-required');
  });
});

describe('drawn gap shape validation', () => {
  it('rejects an empty canvas, a dot and a straight stroke', () => {
    expect(hasTattooGapShape([])).toBe(false);
    expect(
      hasTattooGapShape([
        [
          { x: 0.2, y: 0.2 },
          { x: 0.2, y: 0.2 },
          { x: 0.2, y: 0.2 },
        ],
      ])
    ).toBe(false);
    expect(
      hasTattooGapShape([
        [
          { x: 0.2, y: 0.2 },
          { x: 0.3, y: 0.2 },
          { x: 0.4, y: 0.2 },
        ],
      ])
    ).toBe(false);
  });

  it('accepts a meaningful outline and rejects invalid coordinates', () => {
    const outline = [
      { x: 0.2, y: 0.2 },
      { x: 0.5, y: 0.3 },
      { x: 0.4, y: 0.6 },
      { x: 0.2, y: 0.2 },
    ];
    expect(hasTattooGapShape([outline])).toBe(true);
    expect(hasTattooGapShape([[...outline, { x: Infinity, y: 0.1 }]])).toBe(
      false
    );
  });
});
