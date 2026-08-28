import { describe, expect, it, vi } from 'vitest';

import { CognipeerClient } from '../src/client';

function createFetchMock(responseBody: unknown) {
  return vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
  );
}

describe('CognipeerClient', () => {
  it('requires an API token and hook ID', () => {
    expect(() => new CognipeerClient({ token: '', hookId: 'hook-1' })).toThrow(
      'Cognipeer API token is required',
    );
    expect(() => new CognipeerClient({ token: 'token-1', hookId: '' })).toThrow(
      'Hook ID is required',
    );
  });

  it('sends authentication and hook headers for resource requests', async () => {
    const fetchMock = createFetchMock({ id: 'user-1' });
    const client = new CognipeerClient({
      token: 'token-1',
      hookId: 'hook-1',
      apiUrl: 'https://api.example.test/v1',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(client.users.get()).resolves.toEqual({ id: 'user-1' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const request = fetchMock.mock.calls[0];
    expect(request?.[0]).toBe('https://api.example.test/v1/sdk/user');
    expect(request?.[1]?.method).toBe('GET');
    expect(request?.[1]?.headers).toMatchObject({
      Authorization: 'Bearer token-1',
      'x-hook-id': 'hook-1',
    });
  });

  it('serializes conversation creation options for the SDK endpoint', async () => {
    const fetchMock = createFetchMock({
      conversationId: 'conversation-1',
      peerId: 'peer-1',
      status: 'completed',
      content: 'Hello',
    });
    const client = new CognipeerClient({
      token: 'token-1',
      hookId: 'hook-1',
      apiUrl: 'https://api.example.test/v1',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(
      client.conversations.create({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    ).resolves.toMatchObject({ conversationId: 'conversation-1' });

    const request = fetchMock.mock.calls[0];
    expect(request?.[0]).toBe('https://api.example.test/v1/sdk/conversation');
    expect(JSON.parse(String(request?.[1]?.body))).toEqual({
      messages: [{ role: 'user', content: 'Hello' }],
    });
  });
});
