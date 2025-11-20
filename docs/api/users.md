# Users API

The Users API allows you to get information about the authenticated user.

## get()

Get authenticated user information.

**Signature:**
```typescript
client.users.get(): Promise<User>
```

**Parameters:**

None - returns information for the currently authenticated user (from PAT).

**Returns:**

```typescript
{
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  workspace: {
    _id: string;
    name: string;
    slug: string;
    plan: string;
  };
  roles: Array<string>;
  groups: Array<string>;
  createdAt: string;
  settings: Record<string, any>;
}
```

**Example:**

```typescript
const user = await client.users.get();

console.log('Email:', user.email);
console.log('Name:', user.displayName);
console.log('Workspace:', user.workspace.name);
console.log('Roles:', user.roles.join(', '));
```

## Use Cases

### Display User Information

```typescript
// Show user info in UI
const user = await client.users.get();

document.getElementById('user-email').textContent = user.email;
document.getElementById('user-name').textContent = user.displayName;
document.getElementById('workspace-name').textContent = user.workspace.name;
```

### Check Permissions

```typescript
// Verify user has required role
const user = await client.users.get();

if (user.roles.includes('admin')) {
  console.log('User has admin access');
} else {
  console.log('User has standard access');
}
```

### Multi-Workspace Support

```typescript
// Display workspace information
const user = await client.users.get();

console.log('Current Workspace:', user.workspace.name);
console.log('Workspace Plan:', user.workspace.plan);
console.log('Workspace ID:', user.workspace._id);
```

### User Context for Logging

```typescript
// Add user context to logs
const user = await client.users.get();

logger.info('API call initiated', {
  userId: user._id,
  email: user.email,
  workspace: user.workspace.slug
});
```

## Error Handling

```typescript
try {
  const user = await client.users.get();
  console.log('Authenticated as:', user.email);
} catch (error) {
  console.error('Authentication error:', error.message);
  // Handle invalid or expired token
}
```

## Types

### User

```typescript
interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  workspace: {
    _id: string;
    name: string;
    slug: string;
    plan: string;
  };
  roles: Array<string>;
  groups: Array<string>;
  createdAt: string;
  settings: Record<string, any>;
}
```

## Authentication

The user information is derived from your Personal Access Token (PAT):

```typescript
const client = new CognipeerClient({
  token: 'pat_your-personal-access-token'  // PAT identifies the user
});

const user = await client.users.get();
// Returns info for the user who created the PAT
```

## Notes

- User information is read-only via the SDK
- The user is determined by the PAT used for authentication
- User data includes workspace information for multi-tenancy support
- Roles and groups can be used for permission checks in your application

## Security

Never expose user tokens in client-side code:

```typescript
// ❌ Bad - exposing token in browser
const client = new CognipeerClient({
  token: 'pat_exposed-in-frontend'
});

// ✅ Good - use environment variables in backend
const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN
});
```

## Related

- [Authentication](../guide/authentication.md) - Learn about Personal Access Tokens
- [Channels API](./channels.md) - Get API channel information
- [Peers API](./peers.md) - Get peer information
