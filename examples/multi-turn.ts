/**
 * Multi-turn Conversation Example
 * 
 * Demonstrates maintaining context across multiple messages
 * 
 * Run: npx tsx examples/multi-turn.ts
 */

import { CognipeerClient } from '../src';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN || 'your-api-token',
  apiUrl: process.env.COGNIPEER_API_URL || 'https://api.cognipeer.com'
});

async function main() {
  console.log('=== Multi-turn Conversation Example ===\n');

  // First message
  console.log('User: My name is Alice and I love programming in TypeScript.');
  const first = await client.conversations.create({
    peerId: process.env.COGNIPEER_PEER_ID || 'your-peer-id',
    messages: [
      { 
        role: 'user', 
        content: 'My name is Alice and I love programming in TypeScript.' 
      }
    ]
  });
  console.log('AI:', first.content);
  console.log('Conversation ID:', first.conversationId);
  console.log('---\n');

  // Second message - AI should remember context
  console.log('User: What is my name?');
  const second = await client.conversations.sendMessage({
    conversationId: first.conversationId,
    content: 'What is my name?'
  });
  console.log('AI:', second.content);
  console.log('---\n');

  // Third message - AI should remember more context
  console.log('User: What programming language do I like?');
  const third = await client.conversations.sendMessage({
    conversationId: first.conversationId,
    content: 'What programming language do I like?'
  });
  console.log('AI:', third.content);
  console.log('---\n');

  // Fourth message - more complex query
  console.log('User: Can you summarize what you know about me?');
  const fourth = await client.conversations.sendMessage({
    conversationId: first.conversationId,
    content: 'Can you summarize what you know about me?'
  });
  console.log('AI:', fourth.content);
  console.log('---\n');

  console.log('✅ Multi-turn conversation completed!');
}

main().catch(console.error);
