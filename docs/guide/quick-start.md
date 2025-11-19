# Quick Start

This guide will walk you through creating your first conversation with Cognipeer SDK in just a few minutes.

## Basic Conversation

Here's the simplest way to create a conversation and get a response:

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

// Initialize the client
const client = new CognipeerClient({
  token: 'your-api-token'
});

// Create a conversation with a message
const response = await client.conversations.create({
  peerId: 'your-peer-id',
  messages: [
    { role: 'user', content: 'Hello! How can you help me?' }
  ]
});

console.log(response.content);
// "Hello! I'm an AI assistant. I can help you with..."
```

## Multi-turn Conversation

To continue a conversation, send additional messages:

```typescript
// Create initial conversation
const { conversationId } = await client.conversations.create({
  peerId: 'your-peer-id',
  messages: [
    { role: 'user', content: 'What is 2 + 2?' }
  ]
});

console.log(`Conversation ID: ${conversationId}`);

// Send follow-up message
const response = await client.conversations.sendMessage({
  conversationId,
  content: 'And what is 10 times that?'
});

console.log(response.content);
// "40"
```

## With Client Tools

The real power of Cognipeer comes from client-side tool execution. Here's how to give the AI access to custom functions:

```typescript
const response = await client.conversations.create({
  peerId: 'your-peer-id',
  messages: [
    { role: 'user', content: 'What time is it in Tokyo?' }
  ],
  clientTools: [{
    type: 'function',
    function: {
      name: 'getCurrentTime',
      description: 'Get current time for a timezone',
      parameters: {
        type: 'object',
        properties: {
          timezone: {
            type: 'string',
            description: 'IANA timezone name (e.g., Asia/Tokyo)'
          }
        },
        required: ['timezone']
      }
    },
    implementation: async ({ timezone }) => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      return formatter.format(now);
    }
  }]
});

console.log(response.content);
// "The current time in Tokyo is 15:30:45"
```

::: tip Auto-execution
The SDK automatically executes your client tools when the AI calls them. No manual intervention needed!
:::

## Structured Output

Get JSON responses from the AI by specifying a schema:

```typescript
const response = await client.conversations.create({
  peerId: 'your-peer-id',
  messages: [
    { role: 'user', content: 'Extract info: John Doe, age 30, lives in NYC' }
  ],
  response_format: 'json',
  response_schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
      city: { type: 'string' }
    },
    required: ['name', 'age', 'city']
  }
});

console.log(response.output);
// { name: "John Doe", age: 30, city: "NYC" }
```

## Complete Example

Here's a complete example that demonstrates multiple features:

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!,
  apiUrl: 'https://api.cognipeer.com' // optional
});

async function main() {
  // Create conversation with tools
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { role: 'user', content: 'Look up user john@example.com and tell me their name' }
    ],
    clientTools: [{
      type: 'function',
      function: {
        name: 'getUserByEmail',
        description: 'Get user information by email address',
        parameters: {
          type: 'object',
          properties: {
            email: { type: 'string' }
          },
          required: ['email']
        }
      },
      implementation: async ({ email }) => {
        // Simulate database lookup
        const users = {
          'john@example.com': { name: 'John Doe', age: 30 },
          'jane@example.com': { name: 'Jane Smith', age: 28 }
        };
        
        const user = users[email];
        return user ? JSON.stringify(user) : 'User not found';
      }
    }]
  });

  console.log('AI Response:', response.content);
  console.log('Tools Used:', response.tools);
  console.log('Conversation ID:', response.conversationId);
  
  // Continue the conversation
  const followUp = await client.conversations.sendMessage({
    conversationId: response.conversationId,
    content: 'How old is that user?'
  });
  
  console.log('Follow-up Response:', followUp.content);
}

main().catch(console.error);
```

## Error Handling

Always wrap API calls in try-catch blocks:

```typescript
try {
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [{ role: 'user', content: 'Hello!' }]
  });
  console.log(response.content);
} catch (error) {
  console.error('Error:', error.message);
}
```

## Next Steps

- [Client Configuration](/guide/configuration) - Learn about all configuration options
- [Client Tools](/guide/client-tools) - Deep dive into function calling
- [Conversations](/guide/conversations) - Advanced conversation management
- [Examples](/examples/basic) - More complete examples
