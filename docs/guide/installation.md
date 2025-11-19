# Installation

## Package Manager Installation

The Cognipeer SDK is available on npm and can be installed using any modern JavaScript package manager.

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

```bash [bun]
bun add @cognipeer/sdk
```

:::

## Requirements

### Node.js

- **Minimum version**: Node.js 16.x or higher
- **Recommended**: Node.js 18.x or higher (for native fetch support)

The SDK uses `cross-fetch` as a polyfill for Node.js versions that don't have native fetch support.

### Browser

Modern browsers with ES2020 support:
- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## Module Formats

The SDK supports multiple module formats for maximum compatibility:

### ESM (ECMAScript Modules)

```javascript
import { CognipeerClient } from '@cognipeer/sdk';
```

### CommonJS

```javascript
const { CognipeerClient } = require('@cognipeer/sdk');
```

### Browser (via CDN)

```html
<script type="module">
  import { CognipeerClient } from 'https://cdn.jsdelivr.net/npm/@cognipeer/sdk/+esm';
  
  const client = new CognipeerClient({
    token: 'your-token'
  });
</script>
```

## TypeScript

The SDK is written in TypeScript and includes complete type definitions out of the box. No additional `@types` packages are needed.

```typescript
import { CognipeerClient, CreateConversationOptions } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});
```

## Verifying Installation

Create a simple test file to verify your installation:

```typescript
// test.ts
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: 'your-api-token'
});

console.log('Cognipeer SDK installed successfully!');
```

Run it:

```bash
npx tsx test.ts  # For TypeScript
node test.js     # For JavaScript
```

## Next Steps

- [Quick Start](/guide/quick-start) - Build your first application
- [Configuration](/guide/configuration) - Learn about client options
