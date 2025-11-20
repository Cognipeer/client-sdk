# Conversations API

The Conversations API allows you to create and manage conversations with AI peers.

## create()

Create a new conversation with optional initial messages.

**Signature:**
```typescript
client.conversations.create(options: CreateConversationOptions): Promise<CreateConversationResponse>
```

**Parameters:**

- `options.messages` - Array of initial messages (optional)
- `options.clientTools` - Array of client-side tools (optional)
- `options.response_format` - Response format: `'text'` or `'json'` (optional)
- `options.response_schema` - JSON schema for structured output (optional)
- `options.userId` - User ID to associate with conversation (optional, PAT only)
- `options.contactId` - Contact ID to associate with conversation (required with API token, ignored with PAT)

> **Note:** When using API tokens (non-PAT), `contactId` is required. With PAT tokens, `userId` is automatically set from the token and `contactId` is ignored.

**Returns:**

```typescript
{
  conversationId: string;
  messageId: string;
  content: string;
  tools: Array<ToolExecution>;
  status: 'done' | 'client_tool_call' | 'error';
  pendingAction?: PendingAction;
}
```

**Example:**

```typescript
// With PAT token (userId automatically set)
const response = await client.conversations.create({
  messages: [
    { role: 'user', content: 'Hello!' }
  ]
});

// With API token (contactId required)
const responseWithContact = await client.conversations.create({
  contactId: 'contact-123',  // Required with API tokens
  messages: [
    { role: 'user', content: 'Hello from contact!' }
  ]
});

console.log(response.conversationId); // 'conv-123'
console.log(response.content); // AI response
```

## sendMessage()

Send a message to an existing conversation.

**Signature:**
```typescript
client.conversations.sendMessage(options: SendMessageOptions): Promise<SendMessageResponse>
```

**Parameters:**

- `options.conversationId` - Conversation ID (required)
- `options.content` - Message content (required)
- `options.contactId` - Contact ID (optional with API token, ignored with PAT)
- `options.clientTools` - Array of client-side tools (optional)
- `options.response_format` - Response format (optional)
- `options.response_schema` - JSON schema (optional)

**Returns:**

Same as `create()` response.

**Example:**

```typescript
const response = await client.conversations.sendMessage({
  conversationId: 'conv-123',
  content: 'Tell me more'
});
```

## list()

List conversations with pagination support.

**Signature:**
```typescript
client.conversations.list(options?: ListConversationsOptions): Promise<ListConversationsResponse>
```

**Parameters:**

- `options.contactId` - Contact ID to filter conversations (required with API token, ignored with PAT)
- `options.page` - Page number, 1-indexed (default: 1)
- `options.limit` - Items per page (default: 10)
- `options.sort` - Sort criteria, e.g., `{ createdDate: -1 }` (optional)
- `options.filter` - Additional filter criteria (optional)

> **Note:** When using API tokens (non-PAT), `contactId` is required. With PAT tokens, conversations are automatically filtered by the authenticated user.

**Returns:**

```typescript
{
  data: Array<Conversation>;
  total: number;
  page: number;
  limit: number;
}
```

**Example:**

```typescript
// With PAT token - automatically filtered by authenticated user
const { data, total, page, limit } = await client.conversations.list({
  page: 1,
  limit: 20
});

// With API token - contactId required
const contactConversations = await client.conversations.list({
  contactId: 'contact-123',  // Required with API tokens
  page: 1,
  limit: 20
});

console.log(`Showing ${data.length} of ${total} conversations`);

// Get next page
const page2 = await client.conversations.list({
  contactId: 'contact-123',  // Required with API tokens
  page: 2,
  limit: 20
});
```

## get()

Get a single conversation by ID.

**Signature:**
```typescript
client.conversations.get(conversationId: string): Promise<Conversation>
```

**Parameters:**

- `conversationId` - The conversation ID (required)

**Returns:**

```typescript
{
  _id: string;
  title: string;
  peerId: string;
  userId?: string;
  contactId?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  peer?: {
    _id: string;
    name: string;
    modelId: string;
    // ... other peer properties
  };
}
```

**Example:**

```typescript
const conversation = await client.conversations.get('conv-123');
console.log(conversation.title);
console.log(conversation.peer?.name);
```

## getMessages()

Get messages from a conversation.

**Signature:**
```typescript
client.conversations.getMessages(options: GetMessagesOptions): Promise<ConversationMessage[]>
```

**Parameters:**

- `options.conversationId` - The conversation ID (required)
- `options.messagesCount` - Number of recent messages to retrieve (default: 10)

**Returns:**

Array of messages:

```typescript
{
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  status: string;
  // ... other message properties
}[]
```

**Example:**

```typescript
const messages = await client.conversations.getMessages({
  conversationId: 'conv-123',
  messagesCount: 50
});

messages.forEach(msg => {
  console.log(`${msg.role}: ${msg.content}`);
});
```

## resumeMessage()

Resume message execution with a client tool result (used in manual mode).

**Signature:**
```typescript
client.conversations.resumeMessage(options: ResumeMessageOptions): Promise<ResumeMessageResponse>
```

**Parameters:**

- `options.conversationId` - The conversation ID (required)
- `options.messageId` - The message ID (required)
- `options.toolResult` - Tool execution result (required)
  - `toolResult.executionId` - Execution ID from pending action
  - `toolResult.success` - Whether execution succeeded
  - `toolResult.output` - Tool output (if successful)
  - `toolResult.error` - Error message (if failed)

**Returns:**

Same as `sendMessage()` response.

**Example:**

```typescript
// When autoExecuteTools is disabled
const response = await client.conversations.create({
  messages: [{ role: 'user', content: 'Get weather' }],
  clientTools: [weatherTool]
});

if (response.status === 'client_tool_call' && response.pendingAction) {
  // Manually execute the tool
  const result = await executeMyTool(response.pendingAction.args);
  
  // Resume with result
  const finalResponse = await client.conversations.resumeMessage({
    conversationId: response.conversationId,
    messageId: response.messageId,
    toolResult: {
      executionId: response.pendingAction.executionId,
      success: true,
      output: result
    }
  });
  
  console.log(finalResponse.content);
}
```

## Types

### Conversation

```typescript
interface Conversation {
  _id: string;
  title?: string;
  peerId: string;
  userId?: string;
  contactId?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  peer?: any;
}
```

### ConversationMessage

```typescript
interface ConversationMessage {
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  status: string;
}
```

### PendingAction

```typescript
interface PendingAction {
  executionId: string;
  toolName: string;
  args: Record<string, any>;
}
```

### ToolResult

```typescript
interface ToolResult {
  executionId: string;
  success: boolean;
  output?: string;
  error?: string;
}
```
