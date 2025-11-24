# Flows

Flows let you trigger deterministic workflows from the SDK. Use them for automations that should not run inline with a chat response.

## Executing a Flow

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({ token: process.env.COGNIPEER_TOKEN! });

await client.flows.execute({
  flowId: 'flow-customer-onboarding',
  inputs: {
    email: 'user@example.com',
    plan: 'enterprise'
  },
  version: 'latest'
});
```

- `flowId`: The identifier from the Cognipeer dashboard.
- `inputs`: JSON payload that the flow expects.
- `version`: Optional specific version (defaults to latest published).

## When to Use Flows

- Long running operations (report generation, ETL, syncing CRMs).
- Multi-step workflows where each step must succeed exactly once.
- Background jobs triggered from chat but not blocking the response.

## Observability Tips

- Store the `executionId` returned by the API to correlate logs.
- Send progress updates back to the user via `conversations.sendMessage`.
- Use structured outputs so flows can emit machine-readable payloads.

## Related

- [Conversation Guide](/guide/conversations)
- [Client Tools](/guide/client-tools)
