/**
 * A dropped browser must not prevent a completed image turn from being
 * reduced and saved to chat history. Only network delivery stops here.
 */
export function createAgentSseWriter(
  controller: Pick<
    ReadableStreamDefaultController<Uint8Array>,
    'enqueue' | 'close'
  >
) {
  const encoder = new TextEncoder();
  let disconnected = false;

  return {
    emit(evt: { type: string; data?: Record<string, unknown> }) {
      if (disconnected) return;
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(evt)}\n\n`));
      } catch {
        disconnected = true;
      }
    },
    close() {
      if (disconnected) return;
      try {
        controller.close();
      } catch {
        disconnected = true;
      }
    },
  };
}
