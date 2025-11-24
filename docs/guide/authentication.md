# Authentication

Cognipeer supports two primary authentication flows. Choose the one that matches your deployment model.

## Personal Access Tokens (PAT)

Use PATs for server-to-server workloads where you control the environment.

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});
```

- Issued per user inside the Cognipeer dashboard.
- Carry the user identity, so each request is associated with that user automatically.
- Ideal for backends, cron jobs, and internal tooling.

### Rotating PATs

1. Create a new PAT in the dashboard.
2. Update your secret manager / CI.
3. Redeploy services.
4. Revoke the previous PAT once traffic is confirmed.

## API Channel Tokens (Hook IDs)

Use hook IDs when integrating channel-based bots or client-side webchat.

```typescript
const client = new CognipeerClient({
  token: process.env.COGNIPEER_API_TOKEN!,
  hookId: 'channel-hook-id'
});
```

- `token` authenticates the workspace, `hookId` identifies the channel instance.
- Works for browser environments because the hook encapsulates the contact context.
- Combine with client-side tools for fully local execution.

## Best Practices

- Store tokens in environment variables or secret managers, never commit them to Git.
- Prefer short-lived infrastructure (containers, serverless) so rotations are easy.
- Scope PAT permissions to the minimum required workspace access.
- For frontend usage, only expose hook-based tokens designed for that purpose.

## Related Docs

- [Client Configuration](/guide/configuration)
- [Contacts API](/api/contacts)
- [Users API](/api/users)
