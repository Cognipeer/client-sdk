# Conversation Guide

Learn how to create, continue, and inspect Cognipeer conversations.

## Creating Conversations

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({ token: process.env.COGNIPEER_TOKEN! });

const response = await client.conversations.create({
  peerId: 'sales-assistant',
  messages: [
    { role: 'user', content: 'Help me draft a welcome email.' }
  ],
  additionalContext: 'User prefers short-form emails.'
});

console.log(response.conversationId);
```

- Provide a `peerId` for multi-agent workspaces. If omitted, configure `defaultPeerId` in the client config.
- `additionalContext` acts like system instructions for that request.

## Continuing a Conversation

```typescript
const reply = await client.conversations.sendMessage({
  conversationId: response.conversationId,
  content: 'Make it more formal.',
  clientTools: [toneAnalyzerTool]
});
```

Every follow-up automatically includes prior history on the server, so you only pass the new message content.

## Manual Tool Execution

Disable auto execution if you need to inspect tool calls before running them:

```typescript
const manualClient = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!,
  autoExecuteTools: false
});

const pending = await manualClient.conversations.create({
  peerId: 'ops-peer',
  messages: [{ role: 'user', content: 'Sync the latest numbers.' }],
  clientTools: [refreshMetricsTool]
});

if (pending.status === 'client_tool_call' && pending.pendingAction) {
  const tool = refreshMetricsTool;
  const output = await tool.implementation(pending.pendingAction.args);

  await manualClient.conversations.resumeMessage({
    conversationId: pending.conversationId,
    messageId: pending.messageId,
    toolResult: {
      executionId: pending.pendingAction.executionId,
      success: true,
      output
    }
  });
}
```

## Listing Conversations

```typescript
const list = await client.conversations.list({
  peerId: 'sales-assistant',
  page: 1,
  limit: 20,
  sort: { createdAt: -1 }
});

list.data.forEach(conv => {
  console.log(conv._id, conv.status, conv.createdAt);
});
```

Use filters (peerId, status, metadata) to scope the results to your application.

## Fetching Messages

```typescript
const messages = await client.conversations.getMessages({
  conversationId: response.conversationId,
  messagesCount: 15
});

messages.forEach(msg => {
  console.log(`[${msg.role}] ${msg.content}`);
});
```

`messagesCount` lets you build infinite-scroll chat windows without loading the entire history.

## Error Handling Tips

- Wrap calls with retries for transient network errors.
- Handle `401` by rotating the PAT / API token.
- Guard against exceeded `maxToolExecutions` if loops occur.

## Related Topics

- [Client Configuration](/guide/configuration)
- [Client Tools](/guide/client-tools)
- [Structured Output Examples](/examples/structured-output)
