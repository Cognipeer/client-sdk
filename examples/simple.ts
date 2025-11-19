/**
 * Simple Node.js Example
 * 
 * Run: npx tsx examples/simple.ts
 */

import { CognipeerClient } from '../src';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN || 'your-api-token',
  apiUrl: process.env.COGNIPEER_API_URL || 'https://api.cognipeer.com'
});

async function main() {
  console.log('Creating conversation...\n');

  const response = await client.conversations.create({
    peerId: process.env.COGNIPEER_PEER_ID || 'your-peer-id',
    messages: [
      { role: 'user', content: 'Hello! What can you help me with?' }
    ]
  });

  console.log('AI Response:', response.content);
  console.log('\nConversation ID:', response.conversationId);
  console.log('Message ID:', response.messageId);
  
  if (response.tools && response.tools.length > 0) {
    console.log('\nTools used:', response.tools.map(t => t.name).join(', '));
  }
}

main().catch(console.error);
