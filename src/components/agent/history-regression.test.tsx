import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { storedToMessages, type ChatHistoryData } from '@/lib/agent-chat';
import * as runs from '@/lib/agent-runs';

const source = readFileSync('src/routes/(agent)/chat/$sessionId.tsx', 'utf8');
// Execute the production effect against the real store, without mounting its
// unrelated preview/auth UI or duplicating its race/cancellation conditions.
const effect = source
  .split('// Load any persisted history')[1]
  .split('const send = useCallback')[0];
const body = effect.match(
  /useEffect\(\(\) => \{([\s\S]*)\}, \[sessionId\]\);/
)![1];
const invoke = new Function(
  'sessionId',
  'apiGet',
  'sessionStorage',
  'hasRun',
  'routerRef',
  'setTitle',
  'seedRun',
  'storedToMessages',
  'getRun',
  ts.transpile(`return (() => {${body}})();`)
);
const ids: string[] = [];
function snapshot(id: string): runs.AgentRun {
  return runs.getRun(id);
}
function request(pendingTurn = false) {
  const id = `history-test-${ids.length}`;
  ids.push(id);
  let resolve!: (data: ChatHistoryData) => void;
  let reject!: (error: Error) => void;
  const apiGet = vi.fn(
    () =>
      new Promise<ChatHistoryData>((yes, no) => {
        resolve = yes;
        reject = no;
      })
  );
  const replace = vi.fn(),
    setTitle = vi.fn();
  const cleanup = invoke(
    id,
    apiGet,
    { getItem: () => (pendingTurn ? 'pending' : null) },
    runs.hasRun,
    { current: { replace } },
    setTitle,
    runs.seedRun,
    storedToMessages,
    snapshot
  ) as () => void;
  const history: ChatHistoryData = {
    chat: { id, title: 'Old title', updatedAt: '2026-10-04' },
    messages: [
      {
        id: 'old',
        role: 'user',
        createdAt: '2026-10-04',
        parts: [{ type: 'text', text: 'Old persisted prompt' }],
      },
    ],
  };
  return { id, apiGet, replace, setTitle, cleanup, resolve, reject, history };
}
afterEach(() => {
  ids.forEach(runs.dropRun);
  ids.length = 0;
  vi.unstubAllGlobals();
});

describe('history snapshots cannot overwrite newer local runs', () => {
  it.each(['failed', 'successful'])(
    'retains a fast %s turn completed before history resolves',
    async (outcome) => {
      const r = request();
      vi.stubGlobal(
        'fetch',
        outcome === 'failed'
          ? vi.fn().mockRejectedValue(new Error('POST blocked by fixture'))
          : vi
              .fn()
              .mockResolvedValue(
                new Response(
                  'data: {"type":"content","data":{"content":"New short answer"}}\n\ndata: {"type":"done"}\n\n'
                )
              )
      );
      await runs.startRun({ sessionId: r.id, text: 'New prompt' });
      const newer = snapshot(r.id);
      expect(newer.streaming).toBe(false);
      expect(newer.messages.at(-1)?.content).toContain(
        outcome === 'failed' ? 'POST blocked by fixture' : 'New short answer'
      );
      r.resolve(r.history);
      await new Promise((resolve) => setTimeout(resolve, 0));
      await vi.waitFor(() => expect(snapshot(r.id)).toBe(newer));
      expect(snapshot(r.id).messages[0].content).toBe('New prompt');
      expect(r.setTitle).not.toHaveBeenCalled();
      expect(r.apiGet).toHaveBeenCalledTimes(1);
    }
  );
  it('retains any replacement of the local store while history is pending', async () => {
    const r = request();
    runs.seedRun(r.id, [
      { id: 'local', role: 'user', content: 'Local update' },
    ]);
    const newer = snapshot(r.id);
    r.resolve(r.history);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await vi.waitFor(() => expect(snapshot(r.id)).toBe(newer));
    expect(r.setTitle).not.toHaveBeenCalled();
  });
  it('still seeds an unchanged initial snapshot and title', async () => {
    const r = request();
    r.resolve(r.history);
    await vi.waitFor(() =>
      expect(snapshot(r.id).messages[0]?.content).toBe('Old persisted prompt')
    );
    expect(r.setTitle).toHaveBeenCalledWith('Old title');
    expect(r.apiGet).toHaveBeenCalledTimes(1);
  });
  it('ignores a cancelled session response', async () => {
    const r = request();
    r.cleanup();
    const next = request();
    next.resolve(next.history);
    await vi.waitFor(() => expect(snapshot(next.id).messages).toHaveLength(1));
    const nextRun = snapshot(next.id);
    r.resolve(r.history);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(runs.hasRun(r.id)).toBe(false);
    expect(r.setTitle).not.toHaveBeenCalled();
    expect(snapshot(next.id)).toBe(nextRun);
  });
  it.each([false, true])(
    'preserves missing-session handling with pending turn %s',
    async (pending) => {
      const r = request(pending);
      r.resolve({ chat: null, messages: [] });
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(r.replace).toHaveBeenCalledTimes(pending ? 0 : 1);
      if (!pending) expect(r.replace).toHaveBeenCalledWith('/chat');
    }
  );
  it('ignores a failed history lookup without dropping the local run', async () => {
    const r = request();
    r.reject(new Error('GET failed'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(r.replace).not.toHaveBeenCalled();
    expect(r.setTitle).not.toHaveBeenCalled();
  });
});
