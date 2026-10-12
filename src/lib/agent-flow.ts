import type { InitialTurnPayload } from '@/lib/agent-chat';

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function agentSignInHref(pathname: string): string {
  const destination =
    pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : '/chat';
  return `/sign-in?callbackUrl=${encodeURIComponent(destination)}`;
}

export function deferAgentTurn(
  storage: SessionStorageLike,
  sessionId: string,
  payload: InitialTurnPayload
): void {
  const attachments = (payload.attachments ?? [])
    .filter((item) => item.status === 'uploaded' && item.url)
    .map((item) => ({ ...item, preview: item.url! }));
  // Save first. If storage is unavailable, the original initial turn remains
  // available for a retry rather than being silently discarded.
  storage.setItem(
    `agent:deferred-turn:${sessionId}`,
    JSON.stringify({ ...payload, attachments })
  );
  storage.removeItem(`agent:initial-turn:${sessionId}`);
  storage.removeItem(`agent:initial-prompt:${sessionId}`);
}

export function readDeferredAgentTurn(
  storage: SessionStorageLike,
  sessionId: string
): InitialTurnPayload | null {
  const raw = storage.getItem(`agent:deferred-turn:${sessionId}`);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const payload = parsed as InitialTurnPayload;
    if (payload.prompt !== undefined && typeof payload.prompt !== 'string')
      return null;
    if (
      payload.attachments !== undefined &&
      !Array.isArray(payload.attachments)
    )
      return null;
    return payload;
  } catch {
    return null;
  }
}

export function clearDeferredAgentTurn(
  storage: SessionStorageLike,
  sessionId: string
): void {
  storage.removeItem(`agent:deferred-turn:${sessionId}`);
}

export function hasPendingAgentTurn(
  storage: SessionStorageLike,
  sessionId: string
): boolean {
  return (
    !!storage.getItem(`agent:initial-turn:${sessionId}`) ||
    !!storage.getItem(`agent:initial-prompt:${sessionId}`) ||
    readDeferredAgentTurn(storage, sessionId) !== null
  );
}
