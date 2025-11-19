# Client Tools

Client tools are the most powerful feature of Cognipeer SDK. They enable the AI to call JavaScript functions that you define, executing them on your side and using the results to continue the conversation.

## What are Client Tools?

Client tools are JavaScript functions that:
- Are defined in your code
- Follow the OpenAI function calling format
- Can be automatically invoked by the AI
- Execute on your infrastructure (not Cognipeer's servers)
- Return results that the AI uses to continue the conversation

## Basic Example

```typescript
const response = await client.conversations.create({
  peerId: 'your-peer-id',
  messages: [
    { role: 'user', content: 'What is the weather in London?' }
  ],
  clientTools: [{
    type: 'function',
    function: {
      name: 'getWeather',
      description: 'Get current weather for a city',
      parameters: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: 'City name'
          }
        },
        required: ['city']
      }
    },
    implementation: async ({ city }) => {
      // Call your weather API
      const weather = await fetch(`https://api.weather.com/${city}`);
      const data = await weather.json();
      return `Temperature: ${data.temp}°C, Conditions: ${data.conditions}`;
    }
  }]
});
```

## Tool Definition Structure

Each client tool must follow this structure:

```typescript
{
  type: 'function',                    // Always 'function'
  function: {
    name: string,                      // Unique tool name
    description?: string,              // What the tool does
    parameters: {                      // JSON Schema
      type: 'object',
      properties: {
        [key: string]: {
          type: 'string' | 'number' | 'boolean' | 'array' | 'object',
          description?: string,
          enum?: any[]
        }
      },
      required?: string[]
    }
  },
  implementation: (args) => Promise<any> | any  // Your function
}
```

### Important Notes

1. **Return Type**: Always return a string or something JSON-serializable
2. **Async Support**: Can be `async` or synchronous
3. **Error Handling**: Throw errors to indicate failures
4. **OpenAI Compatible**: Uses the same format as OpenAI's function calling

## Multiple Tools

You can provide multiple tools in a single conversation:

```typescript
const tools = [
  {
    type: 'function',
    function: {
      name: 'searchDatabase',
      description: 'Search for records in the database',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'number' }
        },
        required: ['query']
      }
    },
    implementation: async ({ query, limit = 10 }) => {
      const results = await db.search(query, limit);
      return JSON.stringify(results);
    }
  },
  {
    type: 'function',
    function: {
      name: 'sendEmail',
      description: 'Send an email to a user',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string' },
          subject: { type: 'string' },
          body: { type: 'string' }
        },
        required: ['to', 'subject', 'body']
      }
    },
    implementation: async ({ to, subject, body }) => {
      await emailService.send(to, subject, body);
      return 'Email sent successfully';
    }
  }
];

const response = await client.conversations.create({
  peerId: 'your-peer-id',
  messages: [{ role: 'user', content: 'Search for John and email him' }],
  clientTools: tools
});
```

## Automatic Execution

By default, the SDK automatically executes client tools when the AI requests them:

```typescript
const client = new CognipeerClient({
  token: 'your-token',
  autoExecuteTools: true,  // default
  maxToolExecutions: 10    // max calls per request
});
```

**How it works:**
1. AI decides to call a tool
2. SDK intercepts the call
3. Executes your `implementation` function
4. Sends result back to AI
5. AI continues with the result
6. Repeats if AI calls another tool

## Manual Execution

For more control, disable automatic execution:

```typescript
const client = new CognipeerClient({
  token: 'your-token',
  autoExecuteTools: false
});

const response = await client.conversations.create({
  peerId: 'your-peer-id',
  messages: [{ role: 'user', content: 'What time is it?' }],
  clientTools: [timeTools]
});

if (response.status === 'client_tool_call' && response.pendingAction) {
  // Manual execution
  const { toolName, args, executionId } = response.pendingAction;
  
  // Find and execute the tool
  const tool = clientTools.find(t => t.function.name === toolName);
  const result = await tool.implementation(args);
  
  // Resume with result
  const finalResponse = await client.conversations.resumeMessage({
    conversationId: response.conversationId,
    messageId: response.messageId,
    toolResult: {
      executionId,
      success: true,
      output: result
    }
  });
  
  console.log(finalResponse.content);
}
```

## Error Handling in Tools

Handle errors gracefully in your tool implementations:

```typescript
{
  type: 'function',
  function: {
    name: 'riskyOperation',
    description: 'Perform a risky operation',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      },
      required: ['id']
    }
  },
  implementation: async ({ id }) => {
    try {
      const result = await performOperation(id);
      return JSON.stringify({ success: true, result });
    } catch (error) {
      // Return error as string so AI can handle it
      return JSON.stringify({
        success: false,
        error: error.message
      });
    }
  }
}
```

## Best Practices

### 1. Clear Descriptions
```typescript
// ✅ Good
description: 'Get the current weather forecast for a specific city including temperature, humidity, and conditions'

// ❌ Bad
description: 'weather'
```

### 2. Validate Inputs
```typescript
implementation: async ({ email }) => {
  if (!email || !email.includes('@')) {
    return 'Invalid email address';
  }
  // proceed...
}
```

### 3. Return Structured Data
```typescript
implementation: async ({ userId }) => {
  const user = await db.getUser(userId);
  // Return as JSON string for complex data
  return JSON.stringify({
    name: user.name,
    email: user.email,
    status: user.status
  });
}
```

### 4. Use Enums for Limited Options
```typescript
parameters: {
  type: 'object',
  properties: {
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high'],
      description: 'Task priority level'
    }
  },
  required: ['priority']
}
```

### 5. Timeout Protection
```typescript
implementation: async ({ query }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}
```

## Advanced: Chaining Tools

The AI can call multiple tools in sequence:

```typescript
const tools = [
  {
    type: 'function',
    function: {
      name: 'getUserId',
      description: 'Get user ID by email',
      parameters: {
        type: 'object',
        properties: {
          email: { type: 'string' }
        },
        required: ['email']
      }
    },
    implementation: async ({ email }) => {
      const user = await db.findUserByEmail(email);
      return user.id;
    }
  },
  {
    type: 'function',
    function: {
      name: 'getUserOrders',
      description: 'Get orders for a user ID',
      parameters: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        },
        required: ['userId']
      }
    },
    implementation: async ({ userId }) => {
      const orders = await db.getOrders(userId);
      return JSON.stringify(orders);
    }
  }
];

// User asks: "What are john@example.com's recent orders?"
// AI will:
// 1. Call getUserId with email
// 2. Call getUserOrders with the returned ID
// 3. Format and present the results
```

## Real-World Examples

### Database Integration
```typescript
{
  type: 'function',
  function: {
    name: 'queryDatabase',
    description: 'Execute a read-only SQL query',
    parameters: {
      type: 'object',
      properties: {
        table: { type: 'string' },
        conditions: { type: 'object' },
        limit: { type: 'number' }
      },
      required: ['table']
    }
  },
  implementation: async ({ table, conditions = {}, limit = 100 }) => {
    const results = await db
      .select('*')
      .from(table)
      .where(conditions)
      .limit(limit);
    return JSON.stringify(results);
  }
}
```

### API Integration
```typescript
{
  type: 'function',
  function: {
    name: 'createJiraTicket',
    description: 'Create a new Jira ticket',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high'] }
      },
      required: ['title', 'description']
    }
  },
  implementation: async ({ title, description, priority = 'medium' }) => {
    const ticket = await jira.createIssue({
      fields: {
        project: { key: 'PROJ' },
        summary: title,
        description,
        priority: { name: priority }
      }
    });
    return `Ticket created: ${ticket.key}`;
  }
}
```

### File System Operations
```typescript
{
  type: 'function',
  function: {
    name: 'readFile',
    description: 'Read contents of a file',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string' }
      },
      required: ['path']
    }
  },
  implementation: async ({ path }) => {
    // Validate path for security
    if (path.includes('..')) {
      return 'Invalid path';
    }
    
    const fs = require('fs').promises;
    const content = await fs.readFile(path, 'utf-8');
    return content;
  }
}
```

## Security Considerations

::: warning Security
Client tools execute with your application's permissions. Always:
- Validate all inputs
- Sanitize file paths and SQL queries
- Implement rate limiting
- Use authentication/authorization
- Never expose sensitive credentials in tool results
:::

```typescript
implementation: async ({ userId }) => {
  // ✅ Validate user has permission
  if (!await checkPermission(currentUser, userId)) {
    return 'Access denied';
  }
  
  // ✅ Sanitize inputs
  const sanitizedId = sanitize(userId);
  
  // Proceed with operation
}
```

## Next Steps

- [Conversations](/guide/conversations) - Learn about conversation management
- [Examples](/examples/client-tools) - See complete client tool examples
- [API Reference](/api/conversations) - Full API documentation
