# Cognipeer SDK

Official JavaScript/TypeScript SDK for [Cognipeer AI](https://cognipeer.com) - Build conversational AI applications with client-side tool execution and webchat integration.

[![npm version](https://badge.fury.io/js/@cognipeer%2Fsdk.svg)](https://www.npmjs.com/package/@cognipeer/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


Documentation: <https://docs.cognipeer.com/client-sdk/guide/getting-started>
## Features

- 🚀 **Simple & Intuitive** - Easy-to-use API for conversational AI
- 🔧 **Client-Side Tools** - Define JavaScript functions the AI can automatically execute
- 💬 **Webchat Integration** - Embed chat UI with iframe, URL, or floating widget
- 📦 **Universal Support** - Works in Node.js, browsers, and edge runtimes
- 🎯 **Type-Safe** - Full TypeScript support with complete type definitions
- ⚡ **Auto-Execution** - Automatic client tool execution with retry logic
- 🌊 **Flow Support** - Execute complex workflows and automations
- 🔒 **Secure** - Your sensitive operations stay on your infrastructure

## Installation

```bash
npm install @cognipeer/sdk
```

## Quick Start

### Prerequisites

Before using the SDK, you need:

1. **Personal Access Token (PAT)**: Generate from workspace settings → Security → Personal Access Tokens
   - PAT tokens are user-scoped and always associate conversations with the authenticated user
2. **API Channel Hook ID**: Create an API channel for your peer to get a hookId

### Token Types

The SDK supports two types of authentication tokens:

- **Personal Access Token (PAT)**: Prefixed with `pat_`, these tokens are user-scoped. All conversations created with PAT tokens are associated with the authenticated user (`userId`).
- **API Token**: Legacy tokens used with the `hookId`. These tokens allow you to specify a `contactId` for conversations, which is useful for contact-based operations.

### Programmatic API

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: 'pat_your-personal-access-token',  // Personal Access Token from settings
  hookId: 'your-api-channel-hook-id'        // From API channel settings
});

// The peer associated with your API channel is automatically used
// No need to specify peerId in requests!

// Create a conversation (PAT token - userId automatically set)
const response = await client.conversations.create({
  messages: [
    { role: 'user', content: 'Hello! How can you help me?' }
  ]
});

console.log(response.content);

// With API token, you can specify a contactId
// Note: contactId is only used with API tokens, not PAT tokens
const responseWithContact = await client.conversations.create({
  contactId: 'contact-123',  // Only works with API tokens
  messages: [
    { role: 'user', content: 'Hello from contact!' }
  ]
});

// List conversations with pagination
const { data, total, page, limit } = await client.conversations.list({
  page: 1,
  limit: 10,
  sort: { createdDate: -1 }
});

console.log(`Showing ${data.length} of ${total} conversations`);
data.forEach(conv => {
  console.log(`- ${conv.title || 'Untitled'} (${conv._id})`);
});

// Get peer information
const peer = await client.peers.get();
console.log(`Using peer: ${peer.name}`);

// Get current user information
const user = await client.users.get();
console.log(`Authenticated as: ${user.email}`);

// Get channel information
const channel = await client.channels.get();
console.log(`Channel: ${channel.name}, Active: ${channel.isActive}`);
```

### Webchat Integration

```typescript
import { CognipeerWebchat } from '@cognipeer/sdk';

// Floating widget (like Intercom)
const widget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'bottom-right'
});

// Or embed in a container
const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  containerId: 'chat-container'
});
webchat.mount();
```

**[📖 Full Webchat Documentation](./docs/WEBCHAT.md)**

## Client-Side Tool Execution

The killer feature - define JavaScript functions that the AI can automatically call:

```typescript
const response = await client.conversations.create({
  messages: [
    { role: 'user', content: 'What is the weather in Tokyo?' }
  ],
  clientTools: [{
    type: 'function',
    function: {
      name: 'getCurrentWeather',
      description: 'Get current weather for a city',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string' }
        },
        required: ['city']
      }
    },
    implementation: async ({ city }) => {
      // Your weather API call here
      const response = await fetch(`https://api.weather.com/${city}`);
      const data = await response.json();
      return `Temperature: ${data.temp}°C, Conditions: ${data.conditions}`;
    }
  }]
});

// The AI automatically called your function and used the result!
console.log(response.content);
```

## Key Capabilities

### Conversation Management

```typescript
// Create a new conversation
const { conversationId } = await client.conversations.create({
  messages: [{ role: 'user', content: 'My name is Alice' }]
});

// Send follow-up message
const response = await client.conversations.sendMessage({
  conversationId,
  content: 'What is my name?'
});

console.log(response.content); // "Your name is Alice"

// List all conversations with pagination (PAT token - automatically filtered by user)
const { data, total, page, limit } = await client.conversations.list({
  page: 1,
  limit: 20,
  sort: { createdDate: -1 }
});

// List conversations for a specific contact (API token only - contactId required)
const contactConversations = await client.conversations.list({
  contactId: 'contact-123',  // Required with API tokens
  page: 1,
  limit: 20,
  sort: { createdDate: -1 }
});

// Get a specific conversation
const conversation = await client.conversations.get(conversationId);

// Get messages from a conversation
const messages = await client.conversations.getMessages({
  conversationId,
  messagesCount: 50
});

// Send message with contactId (API token only)
const responseWithContact = await client.conversations.sendMessage({
  conversationId,
  contactId: 'contact-123',  // Only works with API tokens
  content: 'Follow-up from contact'
});
```

### Structured JSON Output

```typescript
const response = await client.conversations.create({
  messages: [
    { role: 'user', content: 'Extract: John Doe, age 30, NYC' }
  ],
  response_format: 'json',
  response_schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
      city: { type: 'string' }
    }
  }
});

console.log(response.output); // { name: "John Doe", age: 30, city: "NYC" }
```

### Execute Workflows

```typescript
const result = await client.flows.execute({
  flowId: 'your-flow-id',
  inputs: {
    document: 'base64-content',
    analysisType: 'detailed'
  }
});

console.log(result.outputs);
```

## Real-World Examples

### Database Integration

```typescript
const tools = [{
  type: 'function',
  function: {
    name: 'queryUsers',
    description: 'Search users in database',
    parameters: {
      type: 'object',
      properties: {
        email: { type: 'string' }
      }
    }
  },
  implementation: async ({ email }) => {
    const users = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return JSON.stringify(users);
  }
}];

const response = await client.conversations.create({
  messages: [{ role: 'user', content: 'Find user john@example.com' }],
  clientTools: tools
});
```

### API Integration

```typescript
const tools = [{
  type: 'function',
  function: {
    name: 'sendEmail',
    description: 'Send an email',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' }
      }
    }
  },
  implementation: async ({ to, subject, body }) => {
    await emailService.send(to, subject, body);
    return 'Email sent successfully';
  }
}];
```

## Configuration

```typescript
const client = new CognipeerClient({
  // Required
  token: 'your-personal-access-token',  // PAT token
  hookId: 'your-channel-hook-id',       // API channel hook ID
  
  // Optional
  apiUrl: 'https://api.cognipeer.com/v1',  // API base URL
  autoExecuteTools: true,                   // Auto-execute client tools
  maxToolExecutions: 10,                    // Max tool execution loops
  timeout: 60000,                           // Request timeout in ms
  
  // Callbacks
  onToolStart: (toolName, args) => {
    console.log(`Executing tool: ${toolName}`, args);
  },
  onToolEnd: (toolName, result) => {
    console.log(`Tool completed: ${toolName}`, result);
  }
});
```

## API Methods

### Conversations

```typescript
// Create a new conversation
const response = await client.conversations.create({
  messages: [{ role: 'user', content: 'Hello' }],
  clientTools: [...],  // Optional client-side tools
  response_format: 'text' | 'json',  // Optional
  response_schema: {...}  // Optional for JSON mode
});

// Send a message to existing conversation
const response = await client.conversations.sendMessage({
  conversationId: 'conv-id',
  content: 'Follow-up message',
  clientTools: [...]  // Optional
});

// Resume message execution with tool result (manual mode)
const response = await client.conversations.resumeMessage({
  conversationId: 'conv-id',
  messageId: 'msg-id',
  toolResult: {
    executionId: 'exec-id',
    success: true,
    output: 'Tool result'
  }
});

// List conversations with pagination
const { data, total, page, limit } = await client.conversations.list({
  page: 1,          // Page number (default: 1)
  limit: 10,        // Items per page (default: 10)
  sort: { createdDate: -1 },  // Sort order
  filter: {}        // Additional filters (optional)
});

// Get a single conversation
const conversation = await client.conversations.get('conv-id');

// Get messages from a conversation
const messages = await client.conversations.getMessages({
  conversationId: 'conv-id',
  messagesCount: 20  // Number of recent messages (default: 10)
});
```

### Flows (Apps)

```typescript
// Execute a workflow/app
const result = await client.flows.execute({
  flowId: 'flow-id',
  inputs: {
    // Flow-specific inputs
    document: 'base64-content',
    analysisType: 'detailed'
  },
  version: 'latest'  // Optional: specific version
});

console.log(result.outputs);
```

### Peers

```typescript
// Get the peer associated with your API channel
const peer = await client.peers.get();

console.log(peer.name);        // Peer name
console.log(peer.modelId);     // AI model being used
console.log(peer.prompt);      // System prompt
```

### Users

```typescript
// Get authenticated user information
const user = await client.users.get();

console.log(user.email);           // User email
console.log(user.displayName);     // Display name
console.log(user.workspace.name);  // Workspace name
console.log(user.roles);           // User roles
```

### Channels

```typescript
// Get API channel information
const channel = await client.channels.get();

console.log(channel.hookId);       // Hook ID
console.log(channel.channelType);  // Channel type (e.g., 'api')
console.log(channel.isActive);     // Active status
console.log(channel.prompt);       // Channel-specific prompt
```

### Contacts

**Note**: The Contacts API supports **both PAT and API tokens** for authentication, making it unique among SDK endpoints.

```typescript
// Create a new contact
const contact = await client.contacts.create({
  email: 'john.doe@example.com',
  name: 'John Doe',
  phone: '+1234567890',
  properties: {
    company: 'ACME Corp',
    position: 'CEO'
  },
  tags: ['vip', 'enterprise'],
  status: 'active'
});

// Get a contact by email
const contact = await client.contacts.get({ 
  email: 'john.doe@example.com' 
});

// Or by integration ID
const contact = await client.contacts.get({ 
  integrationId: 'ext-12345' 
});

// Update a contact
const updated = await client.contacts.update({
  email: 'john.doe@example.com',
  data: {
    name: 'John Smith',
    status: 'vip',
    properties: {
      company: 'New Corp'
    }
  }
});

// List contacts with pagination
const { data, total, page, limit } = await client.contacts.list({
  page: 1,
  limit: 20,
  filter: { status: 'active' },
  sort: { createdDate: -1 }
});

console.log(`Total contacts: ${total}`);
data.forEach(contact => {
  console.log(`${contact.name} <${contact.email}>`);
});
```

**Authentication Support:**
The Contacts API works with both authentication methods:

```typescript
// With Personal Access Token (PAT)
const client = new CognipeerClient({
  token: 'pat_your-personal-access-token',
  hookId: 'your-hook-id'
});

// With API Token
const client = new CognipeerClient({
  token: 'your-api-token',
  hookId: 'your-channel-hook-id'
});

// Same contact operations work with either authentication method
const contact = await client.contacts.create({
  email: 'user@example.com',
  name: 'User Name'
});
```

## Browser Support

Works seamlessly in browsers:

```html
<script type="module">
  import { CognipeerClient } from 'https://cdn.jsdelivr.net/npm/@cognipeer/sdk/+esm';
  
  const client = new CognipeerClient({
    token: 'pat_your-token',
    hookId: 'your-hook-id'
  });
  
  const response = await client.conversations.create({
    messages: [{ role: 'user', content: 'Hello!' }]
  });
  
  console.log(response.content);
</script>
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import { 
  CognipeerClient, 
  CreateConversationOptions,
  SendMessageResponse,
  ExecutableClientTool 
} from '@cognipeer/sdk';

const client: CognipeerClient = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!,
  hookId: process.env.COGNIPEER_HOOK_ID!
});

const options: CreateConversationOptions = {
  messages: [{ role: 'user', content: 'Hello' }]
};

const response: SendMessageResponse = await client.conversations.create(options);
```

## Documentation

- **[Getting Started](https://cognipeer.com/docs/sdk/getting-started)** - Installation and setup
- **[Quick Start](https://cognipeer.com/docs/sdk/quick-start)** - Your first conversation
- **[Client Tools](https://cognipeer.com/docs/sdk/client-tools)** - Function calling guide
- **[API Reference](https://cognipeer.com/docs/sdk/api)** - Complete API documentation
- **[Examples](https://cognipeer.com/docs/sdk/examples)** - Real-world examples

## Requirements

- Node.js 16+ or modern browser
- Cognipeer API token ([Get one here](https://cognipeer.com))

## Error Handling

```typescript
try {
  const response = await client.conversations.create({
    messages: [{ role: 'user', content: 'Hello' }]
  });
} catch (error) {
  console.error('Error:', error.message);
}
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT © [Cognipeer](https://cognipeer.com)

## Support

- **Documentation**: https://cognipeer.com/docs/sdk
- **Issues**: https://github.com/cognipeer/sdk/issues
- **Email**: support@cognipeer.com
- **Discord**: https://discord.gg/cognipeer

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

---

Built with ❤️ by [Cognipeer](https://cognipeer.com)
