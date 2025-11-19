# Browser Integration

Learn how to use Cognipeer SDK in web browsers.

## Installation

### Via npm (with bundler)

```bash
npm install @cognipeer/sdk
```

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: 'your-api-token'
});
```

### Via CDN (no bundler)

```html
<script type="module">
  import { CognipeerClient } from 'https://cdn.jsdelivr.net/npm/@cognipeer/sdk/+esm';
  
  const client = new CognipeerClient({
    token: 'your-api-token'
  });
</script>
```

## Simple Chat Widget

Complete example of a browser-based chat widget:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cognipeer Chat</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
    }
    
    .chat-container {
      max-width: 600px;
      margin: 50px auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      height: 600px;
    }
    
    .chat-header {
      padding: 20px;
      border-bottom: 1px solid #eee;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px 12px 0 0;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }
    
    .message {
      margin-bottom: 15px;
      display: flex;
      align-items: flex-start;
    }
    
    .message.user {
      justify-content: flex-end;
    }
    
    .message-content {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 18px;
      word-wrap: break-word;
    }
    
    .message.user .message-content {
      background: #667eea;
      color: white;
    }
    
    .message.ai .message-content {
      background: #f0f0f0;
      color: #333;
    }
    
    .chat-input {
      padding: 20px;
      border-top: 1px solid #eee;
      display: flex;
      gap: 10px;
    }
    
    #messageInput {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #ddd;
      border-radius: 24px;
      outline: none;
      font-size: 14px;
    }
    
    #sendButton {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 24px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
    }
    
    #sendButton:hover {
      background: #5568d3;
    }
    
    #sendButton:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    
    .typing {
      padding: 12px 16px;
      background: #f0f0f0;
      border-radius: 18px;
      color: #666;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="chat-container">
    <div class="chat-header">
      <h2>AI Assistant</h2>
      <p style="opacity: 0.9; font-size: 14px; margin-top: 5px;">How can I help you today?</p>
    </div>
    
    <div class="chat-messages" id="messages"></div>
    
    <div class="chat-input">
      <input 
        type="text" 
        id="messageInput" 
        placeholder="Type your message..."
        onkeypress="if(event.key==='Enter') sendMessage()"
      >
      <button id="sendButton" onclick="sendMessage()">Send</button>
    </div>
  </div>

  <script type="module">
    import { CognipeerClient } from 'https://cdn.jsdelivr.net/npm/@cognipeer/sdk/+esm';
    
    const client = new CognipeerClient({
      token: 'your-api-token'
    });
    
    let conversationId = null;
    const messagesDiv = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    
    function addMessage(role, content) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${role}`;
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'message-content';
      contentDiv.textContent = content;
      
      messageDiv.appendChild(contentDiv);
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    function showTyping() {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'message ai';
      typingDiv.id = 'typing-indicator';
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'typing';
      contentDiv.textContent = 'AI is typing...';
      
      typingDiv.appendChild(contentDiv);
      messagesDiv.appendChild(typingDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    function hideTyping() {
      const typingDiv = document.getElementById('typing-indicator');
      if (typingDiv) typingDiv.remove();
    }
    
    window.sendMessage = async function() {
      const content = messageInput.value.trim();
      if (!content) return;
      
      // Add user message
      addMessage('user', content);
      messageInput.value = '';
      sendButton.disabled = true;
      showTyping();
      
      try {
        let response;
        
        if (!conversationId) {
          // First message
          response = await client.conversations.create({
            peerId: 'your-peer-id',
            messages: [{ role: 'user', content }]
          });
          conversationId = response.conversationId;
        } else {
          // Follow-up message
          response = await client.conversations.sendMessage({
            conversationId,
            content
          });
        }
        
        hideTyping();
        addMessage('ai', response.content);
      } catch (error) {
        hideTyping();
        addMessage('ai', `Error: ${error.message}`);
      } finally {
        sendButton.disabled = false;
        messageInput.focus();
      }
    };
    
    // Initial greeting
    addMessage('ai', 'Hello! How can I help you today?');
  </script>
</body>
</html>
```

## React Integration

```typescript
import { useState, useEffect } from 'react';
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: process.env.REACT_APP_COGNIPEER_TOKEN!
});

export default function Chat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let response;
      
      if (!conversationId) {
        response = await client.conversations.create({
          peerId: 'your-peer-id',
          messages: [{ role: 'user', content: input }]
        });
        setConversationId(response.conversationId);
      } else {
        response = await client.conversations.sendMessage({
          conversationId,
          content: input
        });
      }

      setMessages(prev => [...prev, { role: 'ai', content: response.content || '' }]);
    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
        {loading && <div className="typing">AI is typing...</div>}
      </div>
      
      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
```

## Vue Integration

```vue
<template>
  <div class="chat-container">
    <div class="messages">
      <div 
        v-for="(msg, i) in messages" 
        :key="i" 
        :class="['message', msg.role]"
      >
        {{ msg.content }}
      </div>
      <div v-if="loading" class="typing">AI is typing...</div>
    </div>
    
    <div class="input-area">
      <input
        v-model="input"
        @keyup.enter="sendMessage"
        placeholder="Type a message..."
        :disabled="loading"
      />
      <button @click="sendMessage" :disabled="loading">
        Send
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: import.meta.env.VITE_COGNIPEER_TOKEN!
});

const conversationId = ref<string | null>(null);
const messages = ref<Array<{role: string, content: string}>>([]);
const input = ref('');
const loading = ref(false);

const sendMessage = async () => {
  if (!input.value.trim()) return;
  
  messages.value.push({ role: 'user', content: input.value });
  const userInput = input.value;
  input.value = '';
  loading.value = true;

  try {
    let response;
    
    if (!conversationId.value) {
      response = await client.conversations.create({
        peerId: 'your-peer-id',
        messages: [{ role: 'user', content: userInput }]
      });
      conversationId.value = response.conversationId;
    } else {
      response = await client.conversations.sendMessage({
        conversationId: conversationId.value,
        content: userInput
      });
    }

    messages.value.push({ role: 'ai', content: response.content || '' });
  } catch (error: any) {
    messages.value.push({ role: 'ai', content: `Error: ${error.message}` });
  } finally {
    loading.value = false;
  }
};
</script>
```

## Client Tools in Browser

Client tools work seamlessly in browsers:

```html
<script type="module">
  import { CognipeerClient } from 'https://cdn.jsdelivr.net/npm/@cognipeer/sdk/+esm';
  
  const client = new CognipeerClient({
    token: 'your-api-token'
  });
  
  // Tool that accesses browser APIs
  const browserTools = [{
    type: 'function',
    function: {
      name: 'getCurrentLocation',
      description: 'Get user location',
      parameters: { type: 'object', properties: {} }
    },
    implementation: async () => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          position => resolve(JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })),
          error => reject(error)
        );
      });
    }
  }, {
    type: 'function',
    function: {
      name: 'getScreenSize',
      description: 'Get screen dimensions',
      parameters: { type: 'object', properties: {} }
    },
    implementation: async () => {
      return JSON.stringify({
        width: window.screen.width,
        height: window.screen.height
      });
    }
  }];
  
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [{ role: 'user', content: 'Where am I?' }],
    clientTools: browserTools
  });
  
  console.log(response.content);
</script>
```

## Security Considerations

::: warning API Token Security
Never expose your API token in client-side code in production. Use a backend proxy:
:::

```typescript
// ❌ Bad - token exposed to clients
const client = new CognipeerClient({
  token: 'your-api-token'  // Never do this!
});

// ✅ Good - proxy through your backend
const sendMessage = async (message: string) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return response.json();
};
```

Backend proxy example (Next.js API route):

```typescript
// pages/api/chat.ts
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!  // Server-side only
});

export default async function handler(req, res) {
  const { message } = req.body;
  
  const response = await client.conversations.create({
    peerId: process.env.COGNIPEER_PEER_ID!,
    messages: [{ role: 'user', content: message }]
  });
  
  res.json(response);
}
```

## Next Steps

- [Client Tools](/guide/client-tools) - Function calling guide
- [Examples](/examples/basic) - More examples
- [API Reference](/api/client) - Complete API docs
