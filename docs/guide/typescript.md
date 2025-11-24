# TypeScript Support

The SDK ships with full TypeScript declarations to provide autocomplete and compile-time guarantees.

## Importing Types

```typescript
import {
  CognipeerClient,
  CreateConversationOptions,
  ClientTool,
  ToolResult
} from '@cognipeer/sdk';
```

Use the exported interfaces to avoid duplicating shapes across your codebase.

## Narrowing Responses

```typescript
const response = await client.conversations.create(options);

if (response.status === 'client_tool_call' && response.pendingAction) {
  // TypeScript knows pendingAction is defined here
}
```

Discriminated unions on the response help handle tool-call branches safely.

## Strict Settings

Recommended `tsconfig.json` flags:

```json
{
  "strict": true,
  "esModuleInterop": true,
  "moduleResolution": "node",
  "resolveJsonModule": true
}
```

## Generics for Tools

```typescript
const lookupTool: ClientTool<{ email: string }> = {
  type: 'function',
  function: {
    name: 'lookup_user',
    parameters: {
      type: 'object',
      properties: { email: { type: 'string' } },
      required: ['email']
    }
  },
  implementation: async ({ email }) => {
    const user = await repo.findByEmail(email);
    return JSON.stringify(user);
  }
};
```

Typing your tool args prevents runtime mistakes before you deploy.

## IDE Tips

- Enable `typescript.tsserver.experimental.enableProjectDiagnostics` in VS Code for faster feedback.
- Add `@types/node` for server contexts (already included in this repo).

## Related

- [Configuration Guide](/guide/configuration)
- [Client Tools](/guide/client-tools)
