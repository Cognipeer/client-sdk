# Basic Usage Examples

Complete examples demonstrating common use cases with Cognipeer SDK.

## Simple Chat

The most basic example - a single question and answer:

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});

async function simpleChat() {
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { role: 'user', content: 'What is the capital of France?' }
    ]
  });
  
  console.log(response.content);
  // "The capital of France is Paris."
}

simpleChat().catch(console.error);
```

## Multi-turn Conversation

Maintaining context across multiple messages:

```typescript
async function multiTurnChat() {
  const client = new CognipeerClient({
    token: process.env.COGNIPEER_TOKEN!
  });

  // First message
  const initial = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { role: 'user', content: 'My name is Alice and I like pizza.' }
    ]
  });
  
  console.log('AI:', initial.content);
  
  // Second message - AI remembers context
  const followUp = await client.conversations.sendMessage({
    conversationId: initial.conversationId,
    content: 'What is my name and what do I like?'
  });
  
  console.log('AI:', followUp.content);
  // "Your name is Alice and you like pizza."
}

multiTurnChat().catch(console.error);
```

## With Conversation History

Start a conversation with existing history:

```typescript
async function withHistory() {
  const client = new CognipeerClient({
    token: process.env.COGNIPEER_TOKEN!
  });

  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { role: 'user', content: 'I have a meeting at 3 PM' },
      { role: 'ai', content: 'I\'ve noted that. Your meeting is at 3 PM.' },
      { role: 'user', content: 'What time is my meeting?' }
    ]
  });
  
  console.log(response.content);
  // "Your meeting is at 3 PM."
}

withHistory().catch(console.error);
```

## Listing Conversations

Retrieve all conversations for a specific peer:

```typescript
async function listConversations() {
  const client = new CognipeerClient({
    token: process.env.COGNIPEER_TOKEN!
  });

  const result = await client.conversations.list({
    filter: { peerId: 'your-peer-id' },
    page: 1,
    limit: 10,
    sort: { createdAt: -1 }
  });
  
  console.log(`Total conversations: ${result.total}`);
  
  result.data.forEach(conv => {
    console.log(`- ${conv._id} (created: ${conv.createdAt})`);
  });
}

listConversations().catch(console.error);
```

## Getting Conversation Details

Fetch a specific conversation and its messages:

```typescript
async function getConversationDetails() {
  const client = new CognipeerClient({
    token: process.env.COGNIPEER_TOKEN!
  });

  const conversationId = 'conv-123';
  
  // Get conversation metadata
  const conversation = await client.conversations.get(conversationId);
  console.log('Peer ID:', conversation.peerId);
  console.log('Created:', conversation.createdAt);
  
  // Get messages
  const messages = await client.conversations.getMessages({
    conversationId,
    messagesCount: 20
  });
  
  messages.forEach(msg => {
    console.log(`[${msg.type}]: ${msg.content}`);
  });
}

getConversationDetails().catch(console.error);
```

## Error Handling

Proper error handling for API calls:

```typescript
async function withErrorHandling() {
  const client = new CognipeerClient({
    token: process.env.COGNIPEER_TOKEN!
  });

  try {
    const response = await client.conversations.create({
      peerId: 'invalid-peer-id',
      messages: [{ role: 'user', content: 'Hello' }]
    });
    
    console.log(response.content);
  } catch (error: any) {
    if (error.message.includes('404')) {
      console.error('Peer not found');
    } else if (error.message.includes('401')) {
      console.error('Authentication failed - check your token');
    } else if (error.message.includes('timeout')) {
      console.error('Request timed out');
    } else {
      console.error('Error:', error.message);
    }
  }
}

withErrorHandling().catch(console.error);
```

## Using Additional Context

Provide additional context to influence the AI's response:

```typescript
async function withAdditionalContext() {
  const client = new CognipeerClient({
    token: process.env.COGNIPEER_TOKEN!
  });

  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { role: 'user', content: 'What should I do today?' }
    ],
    additionalContext: `
      User preferences:
      - Likes outdoor activities
      - Vegetarian
      - Lives in San Francisco
      
      Current weather: Sunny, 72°F
      Today's date: Saturday, May 15
    `
  });
  
  console.log(response.content);
  // AI will use the context to give personalized suggestions
}

withAdditionalContext().catch(console.error);
```

## Checking Tool Usage

See what tools the AI used during conversation:

```typescript
async function checkToolUsage() {
  const client = new CognipeerClient({
    token: process.env.COGNIPEER_TOKEN!
  });

  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { role: 'user', content: 'Search for information about AI' }
    ]
  });
  
  console.log('Response:', response.content);
  
  if (response.tools && response.tools.length > 0) {
    console.log('\nTools used:');
    response.tools.forEach(tool => {
      console.log(`- ${tool.name}`);
      console.log(`  Input:`, tool.input);
      console.log(`  Output:`, tool.output);
    });
  }
}

checkToolUsage().catch(console.error);
```

## Complete Example App

A complete chatbot with all features:

```typescript
import { CognipeerClient } from '@cognipeer/sdk';
import readline from 'readline';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function chatbot() {
  console.log('Chatbot started. Type "exit" to quit.\n');
  
  // Create initial conversation
  let conversationId: string | null = null;
  
  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log('Goodbye!');
        rl.close();
        return;
      }
      
      try {
        let response;
        
        if (!conversationId) {
          // First message - create conversation
          const result = await client.conversations.create({
            peerId: 'your-peer-id',
            messages: [{ role: 'user', content: input }]
          });
          conversationId = result.conversationId;
          response = result;
        } else {
          // Subsequent messages
          response = await client.conversations.sendMessage({
            conversationId,
            content: input
          });
        }
        
        console.log(`AI: ${response.content}\n`);
        
        // Show tools if used
        if (response.tools && response.tools.length > 0) {
          console.log('(Tools used:', response.tools.map(t => t.name).join(', '), ')\n');
        }
      } catch (error: any) {
        console.error('Error:', error.message, '\n');
      }
      
      askQuestion();
    });
  };
  
  askQuestion();
}

chatbot().catch(console.error);
```

Run it:

```bash
npm install readline
ts-node chatbot.ts
```

## Next Steps

- [Client Tools Examples](/examples/client-tools) - See function calling in action
- [Structured Output](/examples/structured-output) - Get JSON responses
- [Browser Integration](/examples/browser) - Use in web applications
