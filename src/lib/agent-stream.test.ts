import { describe, expect, it, vi } from 'vitest';

import { createAgentSseWriter } from './agent-stream';

describe('agent SSE delivery', () => {
  it('keeps server-side result processing alive after a disconnected browser rejects writes', () => {
    const controller = {
      enqueue: vi.fn(() => {
        throw new TypeError('stream is closed');
      }),
      close: vi.fn(() => {
        throw new TypeError('stream is closed');
      }),
    };
    const writer = createAgentSseWriter(controller);

    expect(() =>
      writer.emit({ type: 'tool_call', data: { id: 'image-1' } })
    ).not.toThrow();
    expect(() =>
      writer.emit({
        type: 'tool_result',
        data: { files: ['https://example.com/design.png'] },
      })
    ).not.toThrow();
    expect(() => writer.close()).not.toThrow();
    expect(controller.enqueue).toHaveBeenCalledTimes(1);
  });
});
