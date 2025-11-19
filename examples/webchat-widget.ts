/**
 * Example: Webchat Floating Widget
 * 
 * This example shows how to add a floating chat widget
 * to your website (similar to Intercom, Drift, etc.)
 */

import { CognipeerWebchat } from '@cognipeer/sdk';

// Basic floating widget
const widget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'bottom-right'
});

// Customized widget with theme
const customWidget = CognipeerWebchat.createWidget({
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
    mainBG: '#f9fafb',
    radius: '12px'
  },
  contact: {
    email: 'user@example.com',
    name: 'John Doe'
  },
  context: {
    userId: '12345',
    currentPage: window.location.pathname
  }
});

// Widget with event tracking
const trackedWidget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'bottom-right'
});

trackedWidget.on('open', () => {
  console.log('Widget opened');
  // Track in analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', 'chat_opened');
  }
});

trackedWidget.on('close', () => {
  console.log('Widget closed');
});

trackedWidget.on('message-sent', (event) => {
  console.log('User sent message:', event.data.content);
});

trackedWidget.on('message-received', (event) => {
  console.log('AI responded:', event.data.content);
});

// Different widget positions
const bottomLeftWidget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'bottom-left'
});

const topRightWidget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'top-right'
});

// Custom icon
const customIconWidget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'bottom-right',
  icon: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" 
            fill="currentColor"/>
    </svg>
  `
});

// Widget that auto-opens after delay
const autoOpenWidget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'bottom-right',
  autoOpen: true // Opens after 500ms
});

// Programmatic control
const controlledWidget = CognipeerWebchat.createWidget({
  hookId: 'your-hook-id',
  position: 'bottom-right'
});

// Open programmatically
document.getElementById('open-chat-btn')?.addEventListener('click', () => {
  controlledWidget.open();
});

// Send message programmatically
document.getElementById('send-message-btn')?.addEventListener('click', () => {
  controlledWidget.sendMessage('Hello from the app!');
});

// Destroy widget when needed
document.getElementById('destroy-widget-btn')?.addEventListener('click', () => {
  controlledWidget.destroy();
});
