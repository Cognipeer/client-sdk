# Configuration

Learn how to configure the Cognipeer client with all available options.

## Basic Configuration

The minimal configuration requires only an API token:

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: 'your-api-token'
});
```

## All Configuration Options

```typescript
const client = new CognipeerClient({
  // Required: Your API authentication token
  token: 'your-api-token',
  
  // Optional: API base URL
  // Default: 'https://api.cognipeer.com'
  apiUrl: 'https://api.cognipeer.com',
  
  // Optional: Custom fetch implementation
  // Useful for Node.js < 18 or custom HTTP handling
  fetch: customFetch,
  
  // Optional: Automatically execute client tools
  // Default: true
  autoExecuteTools: true,
  
  // Optional: Maximum tool executions per request
  // Default: 10
  maxToolExecutions: 10,
  
  // Optional: Request timeout in milliseconds
  // Default: 60000 (60 seconds)
  timeout: 60000
});
```

## Environment-based Configuration

Use environment variables for different environments:

```typescript
// .env.development
COGNIPEER_TOKEN=dev_token_here
COGNIPEER_API_URL=https://dev-api.cognipeer.com

// .env.production
COGNIPEER_TOKEN=prod_token_here
COGNIPEER_API_URL=https://api.cognipeer.com
```

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!,
  apiUrl: process.env.COGNIPEER_API_URL
});
```

## Custom Fetch Implementation

For Node.js < 18 or custom HTTP handling:

```typescript
import fetch from 'node-fetch';

const client = new CognipeerClient({
  token: 'your-token',
  fetch: fetch as any
});
```

With custom headers:

```typescript
import fetch from 'cross-fetch';

const customFetch = (url: string, options: RequestInit) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-Custom-Header': 'value'
    }
  });
};

const client = new CognipeerClient({
  token: 'your-token',
  fetch: customFetch
});
```

## Tool Execution Configuration

### Automatic Execution (Default)

Tools are executed automatically when the AI calls them:

```typescript
const client = new CognipeerClient({
  token: 'your-token',
  autoExecuteTools: true,  // default
  maxToolExecutions: 10    // prevent infinite loops
});
```

### Manual Execution

Disable automatic execution for fine-grained control:

```typescript
const client = new CognipeerClient({
  token: 'your-token',
  autoExecuteTools: false
});

const response = await client.conversations.create({
  peerId: 'peer-id',
  messages: [{ role: 'user', content: 'Hello' }],
  clientTools: [myTool]
});

// Check if AI wants to call a tool
if (response.status === 'client_tool_call' && response.pendingAction) {
  // Handle tool execution manually
  const result = await executeMyTool(response.pendingAction);
  
  // Resume with result
  await client.conversations.resumeMessage({
    conversationId: response.conversationId,
    messageId: response.messageId!,
    toolResult: result
  });
}
```

## Timeout Configuration

Set custom timeout for long-running operations:

```typescript
const client = new CognipeerClient({
  token: 'your-token',
  timeout: 120000  // 2 minutes
});
```

Handle timeout errors:

```typescript
try {
  const response = await client.conversations.create({
    peerId: 'peer-id',
    messages: [{ role: 'user', content: 'Complex query' }]
  });
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Request timed out');
  }
}
```

## Multiple Client Instances

Create multiple clients for different workspaces or configurations:

```typescript
const clientA = new CognipeerClient({
  token: process.env.WORKSPACE_A_TOKEN!,
  apiUrl: 'https://api.cognipeer.com'
});

const clientB = new CognipeerClient({
  token: process.env.WORKSPACE_B_TOKEN!,
  apiUrl: 'https://api.cognipeer.com',
  autoExecuteTools: false
});
```

## TypeScript Configuration

The SDK is fully typed. Enable strict mode for best experience:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  }
}
```

## Best Practices

### 1. Use Environment Variables

```typescript
// ✅ Good - secure
const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});

// ❌ Bad - hardcoded
const client = new CognipeerClient({
  token: 'sk_live_abc123...'
});
```

### 2. Reuse Client Instances

```typescript
// ✅ Good - create once
export const cognipeerClient = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});

// Use in multiple files
import { cognipeerClient } from './config';
```

### 3. Set Appropriate Timeouts

```typescript
// For quick operations
const quickClient = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!,
  timeout: 10000  // 10 seconds
});

// For complex workflows
const workflowClient = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!,
  timeout: 300000  // 5 minutes
});
```

### 4. Configure Tool Limits

```typescript
const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!,
  maxToolExecutions: 5  // Prevent excessive tool calls
});
```

## Next Steps

- [Quick Start](/guide/quick-start) - Start building
- [Conversations](/guide/conversations) - Learn about conversations
- [Client Tools](/guide/client-tools) - Configure client tools
