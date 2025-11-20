# Peers API

The Peers API allows you to get information about the peer associated with your API channel.

## get()

Get the peer associated with your API channel.

**Signature:**
```typescript
client.peers.get(): Promise<Peer>
```

**Parameters:**

None - the peer is automatically determined from your API channel's hookId.

**Returns:**

```typescript
{
  _id: string;
  name: string;
  description?: string;
  modelId: string;
  prompt: string;
  temperature?: number;
  messagesCount?: number;
  language?: string;
  contentType?: string;
  datasources?: Array<string>;
  tools?: Array<string>;
  // ... other peer properties
}
```

**Example:**

```typescript
const peer = await client.peers.get();

console.log('Peer Name:', peer.name);
console.log('AI Model:', peer.modelId);
console.log('System Prompt:', peer.prompt);
console.log('Temperature:', peer.temperature);
console.log('Message History:', peer.messagesCount);
```

## Use Cases

### Display Peer Information

```typescript
// Get peer details to display in UI
const peer = await client.peers.get();

document.getElementById('peer-name').textContent = peer.name;
document.getElementById('peer-description').textContent = peer.description || 'No description';
document.getElementById('peer-model').textContent = peer.modelId;
```

### Validate Configuration

```typescript
// Verify peer configuration before starting
const peer = await client.peers.get();

if (!peer.datasources || peer.datasources.length === 0) {
  console.warn('No datasources configured for this peer');
}

if (!peer.prompt) {
  console.warn('No system prompt configured');
}
```

### Dynamic Behavior

```typescript
// Adjust client behavior based on peer settings
const peer = await client.peers.get();

if (peer.contentType === 'json') {
  // Use JSON response format
  const response = await client.conversations.create({
    messages: [{ role: 'user', content: 'Get data' }],
    response_format: 'json'
  });
} else {
  // Use text format
  const response = await client.conversations.create({
    messages: [{ role: 'user', content: 'Get data' }]
  });
}
```

## Error Handling

```typescript
try {
  const peer = await client.peers.get();
  console.log('Connected to peer:', peer.name);
} catch (error) {
  console.error('Failed to get peer information:', error.message);
  // Handle error - check hookId, authentication, etc.
}
```

## Types

### Peer

```typescript
interface Peer {
  _id: string;
  name: string;
  description?: string;
  modelId: string;
  prompt: string;
  temperature?: number;
  messagesCount?: number;
  language?: string;
  contentType?: string;
  datasources?: Array<string>;
  tools?: Array<string>;
  createdAt?: string;
  updatedAt?: string;
}
```

## Notes

- The peer is automatically determined from your API channel's hookId
- Each API channel is associated with exactly one peer
- Peer information is read-only via the SDK (modify via web interface)
- Peer settings affect all conversations created through the API channel

## Related

- [Channels API](./channels.md) - Get API channel information
- [Conversations API](./conversations.md) - Create conversations with the peer
