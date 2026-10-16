import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { TaskFontPreview } from './task-font-preview';
import { TaskGapGuide } from './task-gap-guide';

describe('free task tools before interaction', () => {
  it('renders the exact lettering, honest system font labels and free export controls without login', () => {
    const html = renderToStaticMarkup(
      <TaskFontPreview
        text={'Mei & Zoë\n永远'}
        onChange={() => {}}
        copy={{
          title: 'Free local lettering preview',
          family: 'System font stack',
          serif: 'Serif: Georgia, Times New Roman, serif',
          sans: 'Sans: Arial, Helvetica, sans-serif',
          script: 'Device cursive',
          mono: 'Mono: Courier New, monospace',
          deviceNote:
            'The available font and missing-character fallback vary by device.',
          size: 'Preview size',
          spacing: 'Letter spacing',
          layout: 'Layout',
          lines: 'Original lines',
          stacked: 'Stacked characters',
          download: 'Download free PNG',
          empty: 'Type the exact words to preview',
          exportError: 'Export unavailable',
          previewLabel: 'Your exact words',
        }}
      />
    );
    expect(html).toContain('Mei &amp; Zoë');
    expect(html).toContain('永远');
    expect(html).toContain('vary by device');
    expect(html).toContain('Download free PNG');
    expect(html).toContain('Original lines');
    expect(html).toContain('Stacked characters');
    expect(html).not.toContain('href="/sign-in');
  });

  it('renders a real labelled gap canvas and a clear reset control', () => {
    const html = renderToStaticMarkup(
      <TaskGapGuide
        source={null}
        onChange={() => {}}
        label="Draw the gap boundary"
        hint="Draw a closed outline with your finger or pointer."
        clearLabel="Clear drawn guide"
        errorLabel="Could not export guide"
      />
    );
    expect(html).toContain('<canvas');
    expect(html).toContain('aria-label="Draw the gap boundary"');
    expect(html).toContain('Clear drawn guide');
    expect(html).toContain('with your finger or pointer');
  });
});
