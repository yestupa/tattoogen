import { afterEach, describe, expect, it, vi } from 'vitest';

import { runTest } from './settings-test';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('FastClaw admin connection test', () => {
  it('accepts the OpenAI-style data array returned by the agents endpoint', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({
          object: 'list',
          data: [
            {
              id: 'agt_tattoo',
              name: 'Tattoo Artist',
              model: 'managed',
            },
          ],
        })
      )
    );

    await expect(
      runTest(
        'fastclaw',
        {},
        {
          fastclaw_base_url: 'https://cloud.fastclaw.ai',
          fastclaw_agent_id: 'agt_tattoo',
          fastclaw_api_key: 'test-key',
        }
      )
    ).resolves.toMatchObject({
      success: true,
      details: { 'Agent ID': 'agt_tattoo', Name: 'Tattoo Artist' },
    });
  });

  it('does not echo upstream error bodies into the admin response', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { error: { message: 'rejected fc_example_secret_1234567890' } },
            { status: 401 }
          )
        )
    );

    await expect(
      runTest(
        'fastclaw',
        {},
        {
          fastclaw_base_url: 'https://cloud.fastclaw.ai',
          fastclaw_agent_id: 'agt_tattoo',
          fastclaw_api_key: 'test-key',
        }
      )
    ).resolves.toEqual({
      success: false,
      message: 'FastClaw request failed (401)',
    });
  });
});
