# Getting Started

Welcome to the Cognipeer SDK! This guide will help you get up and running with building conversational AI applications.

## What is Cognipeer?

Cognipeer is a powerful AI platform that enables you to create intelligent conversational agents (called "Peers") that can interact with users, execute functions, and perform complex workflows. The SDK provides a simple JavaScript/TypeScript interface to integrate these capabilities into your applications.

## Key Features

### 🤖 Conversational AI
Create multi-turn conversations with AI agents that remember context and can handle complex dialogues.

### 🔧 Client-Side Tool Execution
Define JavaScript functions that the AI can automatically call and execute on your side. This enables:
- Integration with external APIs
- Database queries
- Custom business logic
- Real-time data access

### 🌊 Flow Automation
Execute pre-built workflows and automations with structured inputs and outputs.

### 📦 Universal Compatibility
- ✅ Node.js (v16+)
- ✅ Modern browsers
- ✅ Edge runtimes (Cloudflare Workers, Vercel Edge)
- ✅ ESM and CommonJS support

## Prerequisites

Before you begin, you'll need:

1. **A Cognipeer Account**: Sign up at [cognipeer.com](https://cognipeer.com)
2. **A Personal Access Token (PAT)**: Generate one from your workspace settings
3. **An API Channel**: Create an API channel and get its hook ID
4. **Node.js 16+** or a modern browser

## Installation

Install the SDK using your preferred package manager:

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

## Getting Your Credentials

### 1. Personal Access Token (PAT)

1. Log in to your Cognipeer workspace
2. Navigate to **Settings** → **Security** → **Personal Access Tokens**
3. Click **Generate New Token**
4. Copy your token (starts with `pat_`)
5. Store it securely

> **Token Types:**
> - **PAT Token** (recommended): Starts with `pat_`, provides user-scoped access. Conversations are automatically associated with your user account.
> - **API Token** (legacy): For contact-based operations. Requires providing `contactId` for conversation operations.

### 2. API Channel Hook ID

1. Create or select a Peer (AI agent) in your workspace
2. Navigate to **Channels** → **API Channel**
3. Copy the Hook ID (e.g., `bhdwxdpdkndpzolyttqf`)
4. The peer associated with this channel will be used for all conversations

::: warning Security
Never commit your API token to version control. Use environment variables or secure secret management.
:::

## Authentication

The SDK requires two pieces of information:
- **token**: Your authentication token (PAT recommended)
  - **PAT tokens** (`pat_xxx`): User-scoped, no need to specify userId/contactId
  - **API tokens**: Contact-scoped, requires `contactId` parameter for conversations
- **hookId**: Your API channel's hook ID (determines which peer to use)

```typescript
const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN,    // PAT token (starts with pat_)
  hookId: process.env.COGNIPEER_HOOK_ID
});

// With PAT token - userId is automatic
const response = await client.conversations.create({
  messages: [{ role: 'user', content: 'Hello!' }]
});

// With API token - contactId is required
const apiResponse = await client.conversations.create({
  contactId: 'contact-123',  // Required with API tokens
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

## Next Steps

- [Quick Start](/guide/quick-start) - Build your first conversation
- [Client Configuration](/guide/configuration) - Configure the SDK
- [Client Tools](/guide/client-tools) - Learn about function calling
