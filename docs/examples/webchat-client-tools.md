# Webchat Client Tools Integration

This example demonstrates how to use client-side tools with Cognipeer Webchat, allowing the AI to execute JavaScript functions directly in the user's browser during conversations.

## Overview

Client tools enable powerful interactions by letting the AI:
- Access browser APIs (geolocation, notifications, localStorage, etc.)
- Perform calculations and data processing
- Call external APIs from the client
- Interact with the page DOM
- Execute custom business logic

## Quick Start

```typescript
import { CognipeerWebchat, ClientTool } from '@cognipeer/sdk';

// Define client tools
const tools: ClientTool[] = [
  {
    name: 'get_current_time',
    description: 'Get the current date and time',
    execute: async () => {
      return new Date().toLocaleString();
    }
  },
  {
    name: 'calculate',
    description: 'Perform a mathematical calculation',
    parameters: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'Mathematical expression (e.g., "2 + 2")'
        }
      },
      required: ['expression']
    },
    execute: async (args) => {
      const expression = args.expression as string;
      // Use a safe math parser in production!
      const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
      const result = Function('"use strict"; return (' + sanitized + ')')();
      return `${expression} = ${result}`;
    }
  }
];

// Create webchat with tools
const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  tools: tools
});

// Listen to tool calls (optional)
webchat.on('tool-call', (event) => {
  console.log('Tool called:', event.data);
});

// Mount webchat
webchat.mount({
  containerId: 'chat-container',
  width: '100%',
  height: '600px'
});
```

## Running This Example

1. Install dependencies:
```bash
npm install
```

2. Set your Hook ID in `.env.local`:
```env
NEXT_PUBLIC_COGNIPEER_BASE_URL=https://app.cognipeer.com
```

3. Run the development server:
```bash
npm run dev
```

4. Open `http://localhost:3000/webchat-widget`

5. Try asking:
   - "What time is it?"
   - "Calculate 25 * 4"

## Example Tools

### 1. Get Current Time

```typescript
{
  name: 'get_current_time',
  description: 'Get the current date and time',
  execute: async () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  }
}
```

### 2. Get User Location

```typescript
{
  name: 'get_user_location',
  description: 'Get the user\'s approximate location',
  execute: async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return JSON.stringify({
        city: data.city,
        region: data.region,
        country: data.country_name,
        timezone: data.timezone
      });
    } catch (error: any) {
      throw new Error(`Failed to get location: ${error.message}`);
    }
  }
}
```

### 3. Calculate

```typescript
{
  name: 'calculate',
  description: 'Perform a mathematical calculation',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Mathematical expression to evaluate'
      }
    },
    required: ['expression']
  },
  execute: async (args) => {
    try {
      // Basic validation and sanitization
      const sanitized = args.expression.replace(/[^0-9+\-*/().%\s]/g, '');
      const result = Function('"use strict"; return (' + sanitized + ')')();
      return `${args.expression} = ${result}`;
    } catch (error: any) {
      throw new Error(`Calculation failed: ${error.message}`);
    }
  }
}
```

### 4. Browser Information

```typescript
{
  name: 'get_browser_info',
  description: 'Get information about the user\'s browser and device',
  execute: async () => {
    return JSON.stringify({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    });
  }
}
```

### 5. Show Notification

```typescript
{
  name: 'show_notification',
  description: 'Show a browser notification to the user',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Notification title' },
      message: { type: 'string', description: 'Notification message' }
    },
    required: ['title', 'message']
  },
  execute: async (args) => {
    if (!('Notification' in window)) {
      throw new Error('Browser does not support notifications');
    }

    if (Notification.permission === 'granted') {
      new Notification(args.title, { body: args.message });
      return 'Notification displayed successfully';
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(args.title, { body: args.message });
        return 'Permission granted and notification displayed';
      }
    }
    
    throw new Error('Notification permission denied');
  }
}
```

## Widget with Client Tools

```typescript
import { CognipeerWebchat } from '@cognipeer/sdk';

const widget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'bottom-right',
  buttonColor: '#14b8a6',
  tools: [
    {
      name: 'get_current_time',
      description: 'Get current time',
      execute: async () => new Date().toLocaleString()
    },
    {
      name: 'calculate',
      description: 'Perform calculation',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string' }
        },
        required: ['expression']
      },
      execute: async (args) => {
        const sanitized = args.expression.replace(/[^0-9+\-*/().%\s]/g, '');
        return String(Function('"use strict"; return (' + sanitized + ')')());
      }
    }
  ]
});

// Listen to tool execution
widget.on('tool-call', (event) => {
  console.log('Tool called:', event.data.toolName);
  console.log('Args:', event.data.args);
  console.log('Execution ID:', event.data.executionId);
});
```

## Dynamic Tool Registration

You can also register tools after creating the webchat instance:

```typescript
const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id'
});

// Register a tool later
webchat.registerTool({
  name: 'my_custom_tool',
  description: 'Does something useful',
  execute: async () => {
    return 'Result';
  }
});

// Unregister when no longer needed
webchat.unregisterTool('my_custom_tool');
```

## Best Practices

### 1. Clear Descriptions
Write clear, specific descriptions that help the AI understand when to use each tool:

```typescript
// ✅ Good
{
  name: 'get_cart_total',
  description: 'Calculate the total price of items in the shopping cart including tax and shipping',
  execute: async () => { /* ... */ }
}

// ❌ Bad
{
  name: 'get_cart_total',
  description: 'Gets total',
  execute: async () => { /* ... */ }
}
```

### 2. Error Handling
Always handle errors gracefully and return user-friendly messages:

```typescript
{
  name: 'fetch_data',
  description: 'Fetch data from API',
  execute: async () => {
    try {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to fetch data: ${error.message}`);
    }
  }
}
```

### 3. Security
- Never use `eval()` on user input without sanitization
- Validate all parameters
- Request browser permissions properly
- Sanitize any user-provided data

```typescript
// ⚠️ Dangerous
execute: async (args) => {
  return eval(args.code); // NEVER DO THIS!
}

// ✅ Safe
execute: async (args) => {
  const sanitized = args.expression.replace(/[^0-9+\-*/().%\s]/g, '');
  return Function('"use strict"; return (' + sanitized + ')')();
}
```

### 4. Performance
- Keep execution fast (< 5 seconds recommended)
- Cache results when appropriate
- Handle timeouts gracefully
- Show loading states for long operations

## How It Works

1. **Tool Registration**: When you create a webchat with tools, they're registered via postMessage to the iframe
2. **AI Decision**: During conversation, the AI decides when to call a tool based on the description
3. **Tool Call Event**: The webchat iframe sends a `tool-call` event with the tool name and arguments
4. **Local Execution**: Your `execute` function runs in the browser
5. **Result Return**: The result is sent back to the iframe via `tool-result` event
6. **Conversation Continues**: The AI uses the result to continue the conversation

```
User: "What time is it?"
  ↓
AI decides to call get_current_time()
  ↓
postMessage: { type: 'tool-call', toolName: 'get_current_time' }
  ↓
Your execute() function runs
  ↓
postMessage: { type: 'tool-result', output: '3:45 PM' }
  ↓
AI: "It's currently 3:45 PM"
```

## Events

Listen to tool call events for monitoring and debugging:

```typescript
webchat.on('tool-call', (event) => {
  console.log({
    toolName: event.data.toolName,
    args: event.data.args,
    executionId: event.data.executionId,
    conversationId: event.data.conversationId,
    messageId: event.data.messageId
  });
});
```

## Troubleshooting

### Tool Not Being Called
1. Check tool description - make it clear and specific
2. Verify parameter schema is correct
3. Check browser console for registration logs

### Execution Errors
1. Check browser console for error messages
2. Validate args match the parameter schema
3. Ensure execute function is async

### Tool Not Registered
1. Verify iframe is loaded properly
2. Check Hook ID is correct
3. Look for registration console logs

## Use Cases

- **E-commerce**: Calculate cart totals, check inventory, apply discount codes
- **Customer Support**: Fetch account info, check order status, access user data
- **Productivity**: Set reminders, create tasks, access calendar
- **Data Processing**: Generate charts, transform data, parse CSV
- **Browser Integration**: Read cookies, check localStorage, access device APIs

## Learn More

- [SDK Documentation](https://github.com/Cognipeer/client-sdk)
- [Webchat Guide](../WEBCHAT.md)
- [Client Tools API Reference](../guide/client-tools.md)
- [Live Demo](https://client-sdk.cognipeer.com/webchat-widget)
