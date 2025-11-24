# SDK Type Definitions

Reference for the most common TypeScript interfaces exposed by `@cognipeer/sdk`.

## CognipeerClientConfig {#cognipeerclientconfig}

```typescript
export interface CognipeerClientConfig {
  token: string;
  hookId?: string;
  apiUrl?: string;
  autoExecuteTools?: boolean;
  maxToolExecutions?: number;
  timeout?: number;
  defaultPeerId?: string;
}
```

- `token`: Required Personal Access Token (PAT) or API token.
- `hookId`: Channel hook identifier for API-channel auth.
- `apiUrl`: Override the default API base URL (useful for staging/local).
- `autoExecuteTools`: Automatically run client tool implementations (default `true`).
- `maxToolExecutions`: Safety limit for recursive tool calls.
- `timeout`: Request timeout in milliseconds (default `60000`).
- `defaultPeerId`: Optional peer that will be used when one is not supplied per call.

## CreateConversationOptions {#createconversationoptions}

```typescript
export interface CreateConversationOptions {
  peerId?: string;
  hookId?: string;
  messages: ConversationMessage[];
  additionalContext?: string;
  clientTools?: ClientTool[];
  metadata?: Record<string, any>;
}
```

Used when calling `client.conversations.create`. Supply at least one user message. When PAT auth is used the user context is derived from the token automatically.

## SendMessageOptions {#sendmessageoptions}

```typescript
export interface SendMessageOptions {
  conversationId: string;
  content: string;
  clientTools?: ClientTool[];
  metadata?: Record<string, any>;
}
```

Extends an existing conversation while optionally attaching a new tool set for this turn.

## ToolResult {#toolresult}

```typescript
export interface ToolResult {
  executionId: string;
  success: boolean;
  output: string;
  error?: string;
}
```

Used with `client.conversations.resumeMessage` when you manually execute a client tool and need to pass the result back to the platform.

## ListConversationsOptions {#listconversationsoptions}

```typescript
export interface ListConversationsOptions {
  peerId?: string;
  page?: number;
  limit?: number;
  filter?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
}
```

Controls pagination, filtering and sorting when calling `client.conversations.list`.

## GetMessagesOptions {#getmessagesoptions}

```typescript
export interface GetMessagesOptions {
  conversationId: string;
  messagesCount?: number;
  beforeMessageId?: string;
}
```

Allows fetching a slice of messages from a conversation, either the latest ones or messages before a given marker.

## ExecuteFlowOptions {#executeflowoptions}

```typescript
export interface ExecuteFlowOptions {
  flowId: string;
  inputs?: Record<string, any>;
  version?: string;
  metadata?: Record<string, any>;
}
```

Options accepted by `client.flows.execute` when triggering a Cognipeer Flow / automation.
