# Client Configuration

Complete reference for configuring the Cognipeer SDK client.

## Constructor

```typescript
new CognipeerClient(config: CognipeerClientConfig)
```

## Configuration Options

### Required Options

#### `token`
- **Type:** `string`
- **Description:** Your authentication token (PAT or API token)
  - **PAT Token**: Starts with `pat_`, user-scoped authentication. Conversations are automatically associated with the authenticated user.
  - **API Token**: Legacy tokens for contact-based operations. Requires `contactId` for conversation operations.
- **Example:** `'pat_kcnlto8e01zg3frarz8l1kvenmhqvtqzjmfnxdvh'`
- **How to get:** Generate from workspace settings → Security → Personal Access Tokens

> **Important:** When using API tokens (non-PAT), you must provide `contactId` when creating conversations or listing them. PAT tokens automatically use the authenticated user's ID.

#### `hookId`
- **Type:** `string`
- **Description:** Your API channel's hook ID
- **Example:** `'bhdwxdpdkndpzolyttqf'`
- **How to get:** Create/select a peer → Channels → API Channel
- **Note:** The peer associated with this channel will be used for all conversations

### Optional Options

#### `apiUrl`
- **Type:** `string`
- **Default:** `'https://api.cognipeer.com/v1'`
- **Description:** Base URL for the Cognipeer API
- **Example:** `'http://localhost:8080/v1'` (for local development)

#### `baseUrl`
- **Type:** `string`
- **Default:** `'https://app.cognipeer.com'`
- **Description:** Base URL for the Cognipeer web application
- **Usage:** Used for generating links and webhooks

#### `autoExecuteTools`
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Automatically execute client tools when AI requests them
- **When false:** You must manually call `resumeMessage()` with tool results

#### `maxToolExecutions`
- **Type:** `number`
- **Default:** `10`
- **Description:** Maximum number of sequential tool executions allowed
- **Purpose:** Prevents infinite loops in tool execution chains

#### `timeout`
- **Type:** `number`
- **Default:** `60000` (60 seconds)
- **Description:** Request timeout in milliseconds
- **Note:** Long-running operations may need higher values

#### `fetch`
- **Type:** `typeof fetch`
- **Default:** `cross-fetch`
- **Description:** Custom fetch implementation
- **Usage:** For environments with specific fetch requirements

### Callback Options

#### `onToolStart`
- **Type:** `(toolName: string, args: any) => void`
- **Description:** Called before executing a client tool
- **Usage:** Logging, monitoring, or custom pre-execution logic

**Example:**
```typescript
onToolStart: (toolName, args) => {
  console.log(`🔧 Executing: ${toolName}`, args);
}
```

#### `onToolEnd`
- **Type:** `(toolName: string, result: ToolResult) => void`
- **Description:** Called after executing a client tool
- **Usage:** Logging, monitoring, or custom post-execution logic

**Example:**
```typescript
onToolEnd: (toolName, result) => {
  if (result.success) {
    console.log(`✅ ${toolName} completed:`, result.output);
  } else {
    console.error(`❌ ${toolName} failed:`, result.error);
  }
}
```

## Configuration Examples

### Basic Configuration

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: 'pat_your-token',
  hookId: 'your-hook-id'
});
```

### Production Configuration

```typescript
const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!,
  hookId: process.env.COGNIPEER_HOOK_ID!,
  timeout: 120000, // 2 minutes
  maxToolExecutions: 15
});
```

### Development Configuration

```typescript
const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!,
  hookId: process.env.COGNIPEER_HOOK_ID!,
  apiUrl: 'http://localhost:8080/v1',
  baseUrl: 'http://localhost:3000',
  onToolStart: (toolName, args) => {
    console.log(`[TOOL START] ${toolName}`, args);
  },
  onToolEnd: (toolName, result) => {
    console.log(`[TOOL END] ${toolName}`, result);
  }
});
```

### Manual Tool Execution

```typescript
const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!,
  hookId: process.env.COGNIPEER_HOOK_ID!,
  autoExecuteTools: false // Disable auto-execution
});

// Handle tool execution manually
const response = await client.conversations.create({
  messages: [{ role: 'user', content: 'Get weather' }],
  clientTools: [weatherTool]
});

if (response.status === 'client_tool_call' && response.pendingAction) {
  // Execute tool manually
  const result = await myCustomToolExecutor(
    response.pendingAction.toolName,
    response.pendingAction.args
  );
  
  // Resume conversation
  await client.conversations.resumeMessage({
    conversationId: response.conversationId,
    messageId: response.messageId,
    toolResult: {
      executionId: response.pendingAction.executionId,
      success: true,
      output: result
    }
  });
}
```

### With Custom Fetch

```typescript
import nodeFetch from 'node-fetch';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!,
  hookId: process.env.COGNIPEER_HOOK_ID!,
  fetch: nodeFetch as any
});
```

### Environment Variables

Best practice for storing credentials:

```bash
# .env file
COGNIPEER_TOKEN=pat_your-token
COGNIPEER_HOOK_ID=your-hook-id
COGNIPEER_API_URL=https://api.cognipeer.com/v1
```

```typescript
// config.ts
import { CognipeerClient } from '@cognipeer/sdk';
import dotenv from 'dotenv';

dotenv.config();

export const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!,
  hookId: process.env.COGNIPEER_HOOK_ID!,
  apiUrl: process.env.COGNIPEER_API_URL
});
```

## Type Definition

```typescript
interface CognipeerClientConfig {
  token: string;
  hookId: string;
  apiUrl?: string;
  baseUrl?: string;
  autoExecuteTools?: boolean;
  maxToolExecutions?: number;
  timeout?: number;
  fetch?: typeof fetch;
  onToolStart?: (toolName: string, args: any) => void;
  onToolEnd?: (toolName: string, result: ToolResult) => void;
}
```

## Error Handling

The client will throw errors for:
- Missing required credentials
- Network failures
- API errors
- Timeout exceeded
- Invalid configuration

```typescript
try {
  const client = new CognipeerClient({
    token: '',
    hookId: ''
  });
} catch (error) {
  console.error('Configuration error:', error.message);
}
```

## Best Practices

1. **Use Environment Variables**: Never hardcode tokens
2. **Set Appropriate Timeouts**: Based on your use case
3. **Enable Callbacks**: For debugging and monitoring
4. **Handle Errors**: Always wrap API calls in try-catch
5. **Validate Config**: Check required fields before instantiation
