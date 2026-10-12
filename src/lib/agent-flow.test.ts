import { describe, expect, it } from 'vitest';

import {
  agentSignInHref,
  clearDeferredAgentTurn,
  deferAgentTurn,
  hasPendingAgentTurn,
  readDeferredAgentTurn,
} from './agent-flow';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const sessionId = 's-1791783727607-whh39q';

describe('agent sign-in handoff', () => {
  it('returns an anonymous user to the chat session that holds their design', () => {
    expect(agentSignInHref(`/chat/${sessionId}`)).toBe(
      `/sign-in?callbackUrl=%2Fchat%2F${sessionId}`
    );
  });

  it('preserves other agent workspace destinations', () => {
    expect(agentSignInHref('/library')).toBe('/sign-in?callbackUrl=%2Flibrary');
  });
});

describe('credit refusal handoff', () => {
  it('moves a refused design to a draft that can be restored after checkout', () => {
    const storage = new MemoryStorage();
    const turn = {
      prompt: 'A custom butterfly tattoo',
      settings: {
        modelOption: 'nano-banana-2' as const,
        aspectRatio: '3:4',
        resolution: '2k',
      },
      attachments: [],
    };
    storage.setItem(`agent:initial-turn:${sessionId}`, JSON.stringify(turn));

    deferAgentTurn(storage, sessionId, turn);

    expect(storage.getItem(`agent:initial-turn:${sessionId}`)).toBeNull();
    expect(readDeferredAgentTurn(storage, sessionId)).toEqual(turn);
    expect(hasPendingAgentTurn(storage, sessionId)).toBe(true);

    clearDeferredAgentTurn(storage, sessionId);
    expect(readDeferredAgentTurn(storage, sessionId)).toBeNull();
    expect(hasPendingAgentTurn(storage, sessionId)).toBe(false);
  });

  it('keeps the initial turn if saving the deferred draft fails', () => {
    const storage = new MemoryStorage();
    storage.setItem(`agent:initial-turn:${sessionId}`, 'original');
    const throwingStorage = {
      getItem: storage.getItem.bind(storage),
      removeItem: storage.removeItem.bind(storage),
      setItem: () => {
        throw new Error('storage full');
      },
    };

    expect(() =>
      deferAgentTurn(throwingStorage, sessionId, {
        prompt: 'A custom butterfly tattoo',
        attachments: [],
      })
    ).toThrow('storage full');
    expect(storage.getItem(`agent:initial-turn:${sessionId}`)).toBe('original');
  });

  it('restores uploaded image previews from stable URLs after checkout', () => {
    const storage = new MemoryStorage();
    deferAgentTurn(storage, sessionId, {
      prompt: 'Adapt this tattoo',
      attachments: [
        {
          id: 'att-1',
          name: 'reference.png',
          preview: 'blob:old-page',
          url: 'https://cdn.example.com/reference.png',
          status: 'uploaded',
        },
      ],
    });

    expect(readDeferredAgentTurn(storage, sessionId)?.attachments).toEqual([
      {
        id: 'att-1',
        name: 'reference.png',
        preview: 'https://cdn.example.com/reference.png',
        url: 'https://cdn.example.com/reference.png',
        status: 'uploaded',
      },
    ]);
  });

  it('ignores damaged drafts instead of crashing the chat page', () => {
    const storage = new MemoryStorage();
    storage.setItem(`agent:deferred-turn:${sessionId}`, '{bad json');
    expect(readDeferredAgentTurn(storage, sessionId)).toBeNull();
  });
});
