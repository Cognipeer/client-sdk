---
layout: home

hero:
  name: Cognipeer SDK
  text: Build Conversational AI Applications
  tagline: Official JavaScript/TypeScript SDK with client-side tool execution support
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/cognipeer/sdk
  image:
    src: /logo.svg
    alt: Cognipeer SDK

features:
  - icon: 🚀
    title: Simple & Intuitive
    details: Easy-to-use API for creating conversational AI applications with just a few lines of code.
  
  - icon: 🔧
    title: Client-Side Tools
    details: Define JavaScript functions that the AI can automatically execute on your side with full type safety.
  
  - icon: 📦
    title: Universal Support
    details: Works in Node.js, browsers, and edge runtimes with ESM and CommonJS support.
  
  - icon: 🎯
    title: Type-Safe
    details: Built with TypeScript for excellent IDE support and compile-time type checking.
  
  - icon: ⚡
    title: Auto-Execution
    details: Automatic client tool execution with configurable retry logic and error handling.
  
  - icon: 🌊
    title: Flow Support
    details: Execute complex workflows and automations with structured input/output handling.
---

## Quick Example

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: 'your-api-token'
});

// Create a conversation with client tools
const response = await client.conversations.create({
  peerId: 'your-peer-id',
  messages: [
    { role: 'user', content: 'What is the weather in San Francisco?' }
  ],
  clientTools: [{
    type: 'function',
    function: {
      name: 'getCurrentWeather',
      description: 'Get current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' }
        },
        required: ['location']
      }
    },
    implementation: async ({ location }) => {
      // Your weather API call here
      return `Weather in ${location}: Sunny, 72°F`;
    }
  }]
});

console.log(response.content);
// The AI automatically called your function and used the result!
```

## Installation

::: code-group

```bash [npm]
npm install @cognipeer/sdk
```

```bash [yarn]
yarn add @cognipeer/sdk
```

```bash [pnpm]
pnpm add @cognipeer/sdk
```

:::

## Why Cognipeer SDK?

The Cognipeer SDK makes it incredibly easy to build AI applications with function calling capabilities. Unlike traditional AI SDKs that only support server-side tools, Cognipeer enables **client-side tool execution** where your JavaScript functions are automatically called by the AI and the results are seamlessly integrated into the conversation.

### Key Benefits

- **🎯 Automatic Tool Execution**: No need to manually handle tool calls - the SDK does it for you
- **🔒 Client-Side Security**: Your sensitive operations stay on your infrastructure
- **📝 OpenAI Compatible**: Uses the same function calling format as OpenAI
- **🎨 Flexible Integration**: Works with any external API, database, or service
- **⚡ Real-time Responses**: Fast, efficient processing with built-in timeout handling

[Get Started →](/guide/getting-started)
