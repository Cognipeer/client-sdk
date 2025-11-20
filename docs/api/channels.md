# Channels API

The Channels API allows you to get information about your API channel.

## get()

Get API channel information.

**Signature:**
```typescript
client.channels.get(): Promise<Channel>
```

**Parameters:**

None - the channel is automatically determined from your hookId.

**Returns:**

```typescript
{
  _id: string;
  name: string;
  hookId: string;
  peerId: string;
  channelType: string;
  galleryKey: string;
  isActive: boolean;
  prompt?: string;
  messagesCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

**Example:**

```typescript
const channel = await client.channels.get();

console.log('Channel Name:', channel.name);
console.log('Hook ID:', channel.hookId);
console.log('Peer ID:', channel.peerId);
console.log('Active:', channel.isActive);
console.log('Custom Prompt:', channel.prompt);
```

## Use Cases

### Validate Channel Status

```typescript
// Check if channel is active before operations
const channel = await client.channels.get();

if (!channel.isActive) {
  throw new Error('API channel is disabled');
}

console.log('Channel is active and ready');
```

### Display Channel Information

```typescript
// Show channel details in admin UI
const channel = await client.channels.get();

console.log('Channel Configuration:');
console.log('- Name:', channel.name);
console.log('- Type:', channel.channelType);
console.log('- Hook ID:', channel.hookId);
console.log('- Created:', new Date(channel.createdAt).toLocaleDateString());
```

### Channel-Specific Settings

```typescript
// Use channel-specific settings
const channel = await client.channels.get();

// Channel has custom prompt that overrides peer's prompt
if (channel.prompt) {
  console.log('Using channel-specific prompt:', channel.prompt);
}

// Channel has custom message history limit
if (channel.messagesCount) {
  console.log('Using channel-specific message history:', channel.messagesCount);
}
```

### Multi-Channel Management

```typescript
// If you have multiple API channels, verify which one you're using
const channel = await client.channels.get();

console.log('Connected to channel:', channel.name);
console.log('Associated peer:', channel.peerId);

// You can create different CognipeerClient instances for different channels
const productionClient = new CognipeerClient({
  token: prodToken,
  hookId: prodHookId
});

const testingClient = new CognipeerClient({
  token: testToken,
  hookId: testHookId
});
```

## Error Handling

```typescript
try {
  const channel = await client.channels.get();
  
  if (!channel.isActive) {
    console.warn('Channel is inactive');
  }
  
  console.log('Using channel:', channel.name);
} catch (error) {
  console.error('Failed to get channel information:', error.message);
  // Check hookId validity and authentication
}
```

## Channel Types

The `channelType` field indicates the integration type:

- `api` - API channel (SDK access)
- `whatsapp` - WhatsApp integration
- `webchat` - Web chat widget
- `chatwoot` - Chatwoot integration
- Other integration types...

```typescript
const channel = await client.channels.get();

if (channel.channelType === 'api') {
  console.log('This is an API channel for programmatic access');
}
```

## Types

### Channel

```typescript
interface Channel {
  _id: string;
  name: string;
  hookId: string;
  peerId: string;
  channelType: string;
  galleryKey: string;
  isActive: boolean;
  prompt?: string;
  messagesCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

## Channel Settings

### Custom Prompt

Channels can have a custom prompt that overrides or extends the peer's system prompt:

```typescript
const channel = await client.channels.get();

if (channel.prompt) {
  console.log('Channel adds this to conversations:', channel.prompt);
  // Example: "When responding through the API channel, be concise."
}
```

### Message History Limit

Channels can override the peer's default message history setting:

```typescript
const channel = await client.channels.get();

if (channel.messagesCount) {
  console.log('This channel includes', channel.messagesCount, 'previous messages');
}
```

## Creating API Channels

API channels must be created in the Cognipeer web interface:

1. Go to your peer's settings
2. Navigate to the **Channels** tab
3. Click **Add Channel** → **API Access**
4. Name your channel and save
5. Copy the hookId for use in your SDK configuration

```typescript
// Use the hookId from the channel you created
const client = new CognipeerClient({
  token: 'pat_your-token',
  hookId: 'hook-id-from-channel-creation'
});
```

## Notes

- Each API channel is associated with exactly one peer
- Channels can be enabled/disabled without deletion
- Channel-specific settings override peer settings
- The hookId uniquely identifies the channel
- Multiple channels can point to the same peer

## Security

- Keep hookId secure (though less sensitive than PAT)
- Disable channels when not in use
- Monitor channel usage through the dashboard
- Use different channels for production/testing/development

## Related

- [Peers API](./peers.md) - Get peer information
- [Conversations API](./conversations.md) - Create conversations through the channel
- [Configuration](./configuration.md) - SDK configuration options
