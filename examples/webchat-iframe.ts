/**
 * Example: Webchat Iframe Embed
 * 
 * This example shows how to embed Cognipeer webchat
 * directly into a container element using an iframe.
 */

import { CognipeerWebchat } from '@cognipeer/sdk';

// Basic iframe embed
const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  containerId: 'chat-container',
  width: '100%',
  height: '600px'
});

webchat.mount();

// With custom theme and branding
const customWebchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  containerId: 'custom-chat-container',
  theme: {
    primary: '#00b5a5',
    headerBG: '#1a1a2e',
    mainBG: '#16213e',
    footerBG: '#1a1a2e',
    radius: '12px',
    fontFamily: 'Inter, sans-serif'
  },
  logo: {
    src: 'https://example.com/logo.png',
    width: 120,
    height: 40,
    alt: 'Company Logo'
  },
  contact: {
    email: 'user@example.com',
    name: 'John Doe'
  },
  context: {
    userId: '12345',
    plan: 'premium'
  }
});

customWebchat.mount();

// With event listeners
const eventWebchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  containerId: 'event-chat-container'
});

eventWebchat.on('ready', () => {
  console.log('Chat is ready!');
});

eventWebchat.on('message-received', (event) => {
  console.log('New message:', event.data.content);
});

eventWebchat.on('conversation-created', (event) => {
  console.log('Conversation ID:', event.data.conversationId);
  // Store for future reference
  localStorage.setItem('conversationId', event.data.conversationId);
});

eventWebchat.mount();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  webchat.destroy();
  customWebchat.destroy();
  eventWebchat.destroy();
});
