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
2. **An API Token**: Generate one from your workspace settings
3. **A Peer ID**: Create a Peer (AI agent) in your workspace
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

## Getting Your API Token

1. Log in to your Cognipeer workspace
2. Navigate to **Settings** → **API Tokens**
3. Click **Generate New Token**
4. Copy your token and store it securely

::: warning Security
Never commit your API token to version control. Use environment variables or secure secret management.
:::

## Next Steps

- [Quick Start](/guide/quick-start) - Build your first conversation
- [Client Configuration](/guide/configuration) - Configure the SDK
- [Client Tools](/guide/client-tools) - Learn about function calling
