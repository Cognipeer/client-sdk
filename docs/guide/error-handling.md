# Error Handling

Design resilient applications by catching platform and network errors explicitly.

## Wrap API Calls

```typescript
try {
  const response = await client.conversations.create({
    peerId: 'support-peer',
    messages: [{ role: 'user', content: 'Hello' }]
  });
  console.log(response.content);
} catch (error: any) {
  if (error.message.includes('401')) {
    rotateToken();
  } else if (error.message.includes('404')) {
    console.error('Resource not found');
  } else if (error.message.includes('timeout')) {
    console.warn('Retrying after timeout');
  } else {
    console.error('Unknown error', error);
  }
}
```

## Retry with Backoff

```typescript
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** i));
    }
  }
  throw new Error('retry failed');
}
```

## Tool Execution Errors

When implementing client tools, throw informative errors so the AI can decide what to do next:

```typescript
implementation: async ({ city }) => {
  if (!city) throw new Error('City is required');
  const result = await fetchWeather(city);
  if (!result.ok) throw new Error('Weather API unavailable');
  return await result.text();
}
```

With manual execution you can send failures back using `success: false` and an `error` message.

## Logging

- Include `conversationId`, `messageId`, and `executionId` in your logs.
- Redact user content before storing server logs.
- Aggregate errors in your monitoring tool to detect flakey flows.

## Related

- [Configuration Guide](/guide/configuration)
- [Client Tools](/guide/client-tools)
- [Conversations](/guide/conversations)
