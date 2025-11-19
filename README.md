# Cognipeer SDK

Official JavaScript/TypeScript SDK for [Cognipeer AI](https://cognipeer.com) - Build conversational AI applications with client-side tool execution and webchat integration.

[![npm version](https://badge.fury.io/js/@cognipeer%2Fsdk.svg)](https://www.npmjs.com/package/@cognipeer/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

### Programmatic API

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: 'your-api-token'
});

// Create a conversation
const response = await client.conversations.create({
  peerId: 'your-peer-id',
  messages: [
    { role: 'user', content: 'Hello! How can you help me?' }
  ]
});

console.log(response.content);
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
  peerId: 'your-peer-id',
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

### Multi-turn Conversations

```typescript
// Create conversation
const { conversationId } = await client.conversations.create({
  peerId: 'your-peer-id',
  messages: [{ role: 'user', content: 'My name is Alice' }]
});

// Continue conversation
const response = await client.conversations.sendMessage({
  conversationId,
  content: 'What is my name?'
});

console.log(response.content); // "Your name is Alice"
```

### Structured JSON Output

```typescript
const response = await client.conversations.create({
  peerId: 'your-peer-id',
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
  peerId: 'your-peer-id',
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
  token: 'your-api-token',
  
  // Optional
  apiUrl: 'https://api.cognipeer.com',
  autoExecuteTools: true,
  maxToolExecutions: 10,
  timeout: 60000
});
```

## Browser Support

Works seamlessly in browsers:

```html
<script type="module">
  import { CognipeerClient } from 'https://cdn.jsdelivr.net/npm/@cognipeer/sdk/+esm';
  
  const client = new CognipeerClient({
    token: 'your-token'
  });
  
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
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
  token: process.env.COGNIPEER_TOKEN!
});

const options: CreateConversationOptions = {
  peerId: 'your-peer-id',
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
    peerId: 'your-peer-id',
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
