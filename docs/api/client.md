# CognipeerClient API

Complete API reference for the `CognipeerClient` class.

## Constructor

### `new CognipeerClient(config)`

Creates a new instance of the Cognipeer client.

**Parameters:**

- `config` ([`CognipeerClientConfig`](/api/types#cognipeerclientconfig)) - Client configuration

**Example:**

```typescript
const client = new CognipeerClient({
  token: 'your-api-token',
  apiUrl: 'https://api.cognipeer.com',
  autoExecuteTools: true,
  maxToolExecutions: 10,
  timeout: 60000
});
```

## Conversation Methods

### `conversations.create(options)`

Create a new conversation with optional initial messages.

**Parameters:**

- `options` ([`CreateConversationOptions`](/api/types#createconversationoptions)) - Conversation options

**Returns:** `Promise<CreateConversationResponse>`

**Example:**

```typescript
const response = await client.conversations.create({
  peerId: 'your-peer-id',
  messages: [
    { role: 'user', content: 'Hello!' }
  ],
  clientTools: [/* optional tools */]
});
```

---

### `conversations.sendMessage(options)`

Send a message to an existing conversation.

**Parameters:**

- `options` ([`SendMessageOptions`](/api/types#sendmessageoptions)) - Message options

**Returns:** `Promise<SendMessageResponse>`

**Example:**

```typescript
const response = await client.conversations.sendMessage({
  conversationId: 'conv-123',
  content: 'Tell me more',
  clientTools: [/* optional tools */]
});
```

---

### `conversations.resumeMessage(options)`

Resume a message with a client tool result.

**Parameters:**

- `options.conversationId` (string) - Conversation ID
- `options.messageId` (string) - Message ID
- `options.toolResult` ([`ToolResult`](/api/types#toolresult)) - Tool execution result

**Returns:** `Promise<ResumeMessageResponse>`

**Example:**

```typescript
const response = await client.conversations.resumeMessage({
  conversationId: 'conv-123',
  messageId: 'msg-456',
  toolResult: {
    executionId: 'exec-789',
    success: true,
    output: 'Tool result data'
  }
});
```

---

### `conversations.list(options)`

List conversations with filtering and pagination.

**Parameters:**

- `options` ([`ListConversationsOptions`](/api/types#listconversationsoptions)) - List options

**Returns:** `Promise<ListConversationsResponse>`

**Example:**

```typescript
const { data, total } = await client.conversations.list({
  filter: { peerId: 'peer-123' },
  page: 1,
  limit: 10,
  sort: { createdAt: -1 }
});
```

---

### `conversations.get(conversationId)`

Get a single conversation by ID.

**Parameters:**

- `conversationId` (string) - Conversation ID

**Returns:** `Promise<Conversation>`

**Example:**

```typescript
const conversation = await client.conversations.get('conv-123');
```

---

### `conversations.getMessages(options)`

Get messages from a conversation.

**Parameters:**

- `options` ([`GetMessagesOptions`](/api/types#getmessagesoptions)) - Message options

**Returns:** `Promise<ConversationMessage[]>`

**Example:**

```typescript
const messages = await client.conversations.getMessages({
  conversationId: 'conv-123',
  messagesCount: 20
});
```

## Flow Methods

### `flows.execute(options)`

Execute a flow (workflow/automation).

**Parameters:**

- `options` ([`ExecuteFlowOptions`](/api/types#executeflowoptions)) - Flow execution options

**Returns:** `Promise<ExecuteFlowResponse>`

**Example:**

```typescript
const result = await client.flows.execute({
  flowId: 'flow-123',
  inputs: {
    document: 'base64-encoded-content',
    analysisType: 'detailed'
  },
  version: 'latest'
});
```

## Configuration Properties

### `token`

API authentication token (required).

**Type:** `string`

---

### `apiUrl`

API base URL.

**Type:** `string`  
**Default:** `'https://api.cognipeer.com'`

---

### `autoExecuteTools`

Whether to automatically execute client tools when called by AI.

**Type:** `boolean`  
**Default:** `true`

---

### `maxToolExecutions`

Maximum number of tool executions per request to prevent infinite loops.

**Type:** `number`  
**Default:** `10`

---

### `timeout`

Request timeout in milliseconds.

**Type:** `number`  
**Default:** `60000` (60 seconds)

## Error Handling

All methods can throw errors. Always wrap API calls in try-catch blocks:

```typescript
try {
  const response = await client.conversations.create({...});
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error appropriately
}
```

### Common Errors

- **401 Unauthorized**: Invalid or missing API token
- **404 Not Found**: Resource (peer, conversation, etc.) not found
- **400 Bad Request**: Invalid request parameters
- **Timeout Error**: Request exceeded timeout limit

## Rate Limiting

The SDK respects API rate limits. Implement exponential backoff for retries:

```typescript
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

const response = await withRetry(() => 
  client.conversations.create({...})
);
```

## TypeScript Support

All methods have full TypeScript support with type inference:

```typescript
import { CognipeerClient, CreateConversationOptions } from '@cognipeer/sdk';

const client = new CognipeerClient({ token: 'token' });

// TypeScript knows the response type
const response = await client.conversations.create({
  peerId: 'peer-id',
  messages: [{ role: 'user', content: 'Hello' }]
  // TypeScript provides autocomplete and type checking
});

// response.content is typed as string | undefined
console.log(response.content);
```

## Next Steps

- [Type Definitions](/api/types) - Complete type reference
- [Examples](/examples/basic) - Usage examples
- [Client Tools](/guide/client-tools) - Tool execution guide
