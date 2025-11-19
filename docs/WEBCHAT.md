# Cognipeer Webchat Integration

Complete guide for integrating Cognipeer Webchat into your website or application using the official SDK.

## Overview

The Cognipeer SDK provides three flexible ways to integrate webchat:

1. **Iframe Embed** - Embed chat directly in a container element
2. **URL Generation** - Generate URLs with custom parameters and handle events
3. **Floating Widget** - Add a floating chat button (like Intercom/Drift)

## Installation

### NPM/Yarn (TypeScript/JavaScript projects)

```bash
npm install @cognipeer/sdk
# or
yarn add @cognipeer/sdk
```

### CDN (Direct browser usage)

```html
<script src="https://unpkg.com/@cognipeer/sdk@latest/dist/webchat-browser.min.js"></script>
```

## Method 1: Iframe Embed

Embed the webchat directly into a container element on your page.

### Basic Example

```typescript
import { CognipeerWebchat } from '@cognipeer/sdk';

const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  containerId: 'chat-container',
  width: '100%',
  height: '600px'
});

webchat.mount();
```

### HTML Setup

```html
<div id="chat-container"></div>
```

### With Custom Theme

```typescript
const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  containerId: 'chat-container',
  theme: {
    primary: '#00b5a5',
    headerBG: '#ffffff',
    mainBG: '#f5f5f5',
    radius: '12px',
    fontFamily: 'Inter, sans-serif'
  },
  logo: {
    src: 'https://example.com/logo.png',
    width: 120,
    height: 40
  }
});

webchat.mount();
```

### With Context and Parameters

```typescript
const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  containerId: 'chat-container',
  contact: {
    email: 'user@example.com',
    name: 'John Doe'
  },
  context: {
    userId: '12345',
    plan: 'premium',
    customData: { foo: 'bar' }
  },
  params: {
    source: 'landing-page',
    campaign: 'summer-2024'
  }
});

webchat.mount();
```

## Method 2: URL Generation with Events

Generate webchat URLs and handle events for custom integrations.

### Basic URL Generation

```typescript
import { CognipeerWebchat } from '@cognipeer/sdk';

const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id'
});

// Generate URL with parameters
const url = webchat.generateUrl({
  contact: { email: 'user@example.com' },
  context: { userId: '123' },
  params: { source: 'website' }
});

console.log(url);
// https://app.cognipeer.com/webchat/your-hook-id?contact=...&context=...
```

### Opening in New Window

```typescript
const url = webchat.generateUrl();
window.open(url, 'Cognipeer Chat', 'width=400,height=600');
```

### Event Listening

Listen to webchat events for deeper integration:

```typescript
const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  containerId: 'chat-container'
});

// Listen for ready event
webchat.on('ready', (event) => {
  console.log('Webchat is ready!');
});

// Listen for messages
webchat.on('message-received', (event) => {
  console.log('New message:', event.data.content);
  console.log('Conversation ID:', event.data.conversationId);
});

// Listen for conversation creation
webchat.on('conversation-created', (event) => {
  console.log('Conversation created:', event.data.conversationId);
  // Store conversation ID in your database
  saveConversationId(event.data.conversationId);
});

// Listen for errors
webchat.on('error', (event) => {
  console.error('Chat error:', event.data.message);
});

webchat.mount();
```

### Client Tool Execution

Handle tool calls from the AI to execute functions on the client side:

```typescript
const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  containerId: 'chat-container'
});

// Listen for tool calls
webchat.on('tool-call', async (event) => {
  const { executionId, toolName, args } = event.data;
  
  console.log(`AI requested tool: ${toolName}`, args);
  
  try {
    let result;
    
    // Execute the requested tool
    switch (toolName) {
      case 'getCurrentUser':
        result = await fetchCurrentUser();
        break;
      case 'getOrderStatus':
        result = await fetchOrderStatus(args.orderId);
        break;
      case 'submitFeedback':
        result = await submitFeedback(args);
        break;
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
    
    // Send result back to webchat
    webchat.sendToolResult({
      executionId,
      success: true,
      output: JSON.stringify(result)
    });
  } catch (error) {
    // Send error back
    webchat.sendToolResult({
      executionId,
      success: false,
      output: '',
      error: error.message
    });
  }
});

webchat.mount();
```

### Programmatic Control

Control the webchat programmatically:

```typescript
// Send a message
webchat.sendMessage('Hello from the parent app!');

// Open chat (in widget mode)
webchat.open();

// Close chat
webchat.close();

// Start new conversation
webchat.newConversation();

// Cleanup
webchat.destroy();
```

## Method 3: Floating Widget

Add a floating chat widget button to your website (similar to Intercom, Drift, etc.).

### Basic Widget

```typescript
import { CognipeerWebchat } from '@cognipeer/sdk';

const widget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'bottom-right'
});
```

### Customized Widget

```typescript
const widget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'bottom-right',
  size: 60,
  buttonColor: '#00b5a5',
  iconColor: '#ffffff',
  autoOpen: false,
  zIndex: 9999,
  theme: {
    primary: '#00b5a5',
    headerBG: '#ffffff',
    mainBG: '#f9fafb'
  },
  contact: {
    email: 'user@example.com',
    name: 'John Doe'
  }
});
```

### Widget Positions

```typescript
// Bottom right (default)
position: 'bottom-right'

// Bottom left
position: 'bottom-left'

// Top right
position: 'top-right'

// Top left
position: 'top-left'
```

### Custom Icon

```typescript
const widget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  icon: `
    <svg width="24" height="24" viewBox="0 0 24 24">
      <!-- Your custom SVG icon -->
    </svg>
  `
});
```

### Widget with Events

```typescript
const widget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'bottom-right'
});

// Listen to widget events
widget.on('open', () => {
  console.log('Widget opened');
  // Track analytics
  analytics.track('Chat Opened');
});

widget.on('close', () => {
  console.log('Widget closed');
});

widget.on('message-sent', (event) => {
  console.log('User sent message:', event.data.content);
});

// Destroy widget
widget.destroy();
```

## CDN Usage (Vanilla JavaScript)

For plain HTML/JavaScript projects without a build system:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Cognipeer Webchat</title>
</head>
<body>
  <!-- Option 1: Iframe Embed -->
  <div id="chat-container" style="width: 100%; height: 600px;"></div>

  <!-- Load Cognipeer Webchat -->
  <script src="https://unpkg.com/@cognipeer/sdk@latest/dist/webchat-browser.min.js"></script>
  
  <script>
    // Iframe embed
    var webchat = new CognipeerWebchat({
      hookId: 'your-hook-id',
      containerId: 'chat-container'
    });
    webchat.mount();

    // OR: Floating widget
    // var widget = CognipeerWebchat.createWidget({
    //   hookId: 'your-hook-id',
    //   position: 'bottom-right'
    // });
  </script>
</body>
</html>
```

## React Integration

### Iframe Component

```tsx
import { useEffect, useRef } from 'react';
import { CognipeerWebchat } from '@cognipeer/sdk';

export function ChatComponent() {
  const webchatRef = useRef<CognipeerWebchat | null>(null);

  useEffect(() => {
    webchatRef.current = new CognipeerWebchat({
      hookId: 'your-hook-id',
      containerId: 'chat-container',
      theme: {
        primary: '#00b5a5'
      }
    });

    webchatRef.current.mount();

    // Cleanup
    return () => {
      webchatRef.current?.destroy();
    };
  }, []);

  return <div id="chat-container" style={{ width: '100%', height: '600px' }} />;
}
```

### Widget Component

```tsx
import { useEffect, useRef } from 'react';
import { CognipeerWebchat } from '@cognipeer/sdk';

export function ChatWidget() {
  const widgetRef = useRef<CognipeerWebchat | null>(null);

  useEffect(() => {
    widgetRef.current = CognipeerWebchat.createWidget({
      hookId: 'your-hook-id',
      position: 'bottom-right'
    });

    // Cleanup
    return () => {
      widgetRef.current?.destroy();
    };
  }, []);

  return null; // Widget is positioned fixed
}
```

## Vue.js Integration

```vue
<template>
  <div id="chat-container" style="width: 100%; height: 600px"></div>
</template>

<script>
import { CognipeerWebchat } from '@cognipeer/sdk';

export default {
  name: 'ChatComponent',
  data() {
    return {
      webchat: null
    };
  },
  mounted() {
    this.webchat = new CognipeerWebchat({
      hookId: 'your-hook-id',
      containerId: 'chat-container'
    });
    this.webchat.mount();
  },
  beforeUnmount() {
    this.webchat?.destroy();
  }
};
</script>
```

## Angular Integration

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CognipeerWebchat } from '@cognipeer/sdk';

@Component({
  selector: 'app-chat',
  template: '<div id="chat-container" style="width: 100%; height: 600px"></div>'
})
export class ChatComponent implements OnInit, OnDestroy {
  private webchat?: CognipeerWebchat;

  ngOnInit() {
    this.webchat = new CognipeerWebchat({
      hookId: 'your-hook-id',
      containerId: 'chat-container'
    });
    this.webchat.mount();
  }

  ngOnDestroy() {
    this.webchat?.destroy();
  }
}
```

## Configuration Options

### WebchatConfig

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `hookId` | `string` | **Required.** Hook ID for the webchat channel | - |
| `apiUrl` | `string` | API base URL | `'https://app.cognipeer.com'` |
| `containerId` | `string` | DOM element ID for iframe mounting | - |
| `width` | `string` | Iframe width | `'100%'` |
| `height` | `string` | Iframe height | `'600px'` |
| `theme` | `WebchatTheme` | Theme customization | - |
| `logo` | `WebchatLogo` | Logo customization | - |
| `contact` | `WebchatContact` | Pre-fill contact info | - |
| `context` | `Record<string, any>` | Additional context | - |
| `params` | `Record<string, any>` | Parameters for peer | - |
| `welcomeMessage` | `string` | Welcome message | - |
| `showPoweredBy` | `boolean` | Show Cognipeer badge | `false` |
| `allowAttachments` | `boolean` | Allow file uploads | `false` |
| `maxAttachments` | `number` | Max attachment count | `5` |

### WebchatTheme

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `primary` | `string` | Primary color (hex) | `'#00b5a5'` |
| `headerBG` | `string` | Header background | `'#ffffff'` |
| `mainBG` | `string` | Main background | `'#ffffff'` |
| `footerBG` | `string` | Footer background | `'#ffffff'` |
| `radius` | `string` | Border radius | `'7px'` |
| `fontFamily` | `string` | Font family | `'Helvetica, Arial, sans-serif'` |

### WebchatWidgetConfig

All `WebchatConfig` options plus:

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | Widget position | `'bottom-right'` |
| `size` | `number` | Button size (px) | `60` |
| `buttonColor` | `string` | Button background color | `theme.primary` or `'#00b5a5'` |
| `iconColor` | `string` | Icon color | `'#ffffff'` |
| `autoOpen` | `boolean` | Auto-open on load | `false` |
| `zIndex` | `number` | Z-index for widget | `9999` |

## Events

| Event | Description | Data |
|-------|-------------|------|
| `ready` | Webchat initialized | - |
| `open` | Chat opened | - |
| `close` | Chat closed | - |
| `message-sent` | User sent message | `{ content, conversationId }` |
| `message-received` | AI sent message | `{ content, conversationId, messageId }` |
| `conversation-created` | New conversation | `{ conversationId, contactId }` |
| `tool-call` | AI requests tool execution | `{ conversationId, messageId, executionId, toolName, args }` |
| `error` | Error occurred | `{ message, code }` |

## Best Practices

### 1. Store Conversation IDs

```typescript
webchat.on('conversation-created', (event) => {
  // Store for future reference
  localStorage.setItem('cognipeer_conversation_id', event.data.conversationId);
  
  // Or send to your backend
  fetch('/api/save-conversation', {
    method: 'POST',
    body: JSON.stringify({ conversationId: event.data.conversationId })
  });
});
```

### 2. Pre-fill User Context

```typescript
const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  contact: {
    email: currentUser.email,
    name: currentUser.name
  },
  context: {
    userId: currentUser.id,
    plan: currentUser.subscription.plan,
    // Add any relevant context
  }
});
```

### 3. Handle Tool Calls Gracefully

```typescript
webchat.on('tool-call', async (event) => {
  try {
    const result = await executeToolSafely(event.data.toolName, event.data.args);
    webchat.sendToolResult({
      executionId: event.data.executionId,
      success: true,
      output: JSON.stringify(result)
    });
  } catch (error) {
    console.error('Tool execution failed:', error);
    webchat.sendToolResult({
      executionId: event.data.executionId,
      success: false,
      output: '',
      error: 'Failed to execute tool'
    });
  }
});
```

### 4. Cleanup on Unmount

Always call `destroy()` when removing the webchat:

```typescript
useEffect(() => {
  const webchat = new CognipeerWebchat({ ... });
  webchat.mount();
  
  return () => {
    webchat.destroy(); // Cleanup listeners and iframe
  };
}, []);
```

## Troubleshooting

### Iframe Not Loading

- Verify your `hookId` is correct
- Check browser console for errors
- Ensure the container element exists in DOM

### Events Not Firing

- Verify postMessage listeners are set up correctly
- Check browser security settings
- Ensure iframe origin is allowed

### Styling Issues

- Use `style` property to override iframe styles
- Check for CSS conflicts with your page
- Use theme customization for internal styling

## Support

For issues, questions, or feature requests:
- Documentation: https://docs.cognipeer.com
- GitHub: https://github.com/cognipeer/sdk
- Email: support@cognipeer.com
