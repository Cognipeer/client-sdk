/**
 * Client Tools Example
 * 
 * Demonstrates automatic client-side tool execution
 * 
 * Run: npx tsx examples/with-tools.ts
 */

import { CognipeerClient, ExecutableClientTool } from '../src';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN || 'your-api-token',
  apiUrl: process.env.COGNIPEER_API_URL || 'https://api.cognipeer.com'
});

// Define client tools
const tools: ExecutableClientTool[] = [
  {
    type: 'function',
    function: {
      name: 'getCurrentTime',
      description: 'Get current time for a timezone',
      parameters: {
        type: 'object',
        properties: {
          timezone: {
            type: 'string',
            description: 'IANA timezone (e.g., America/New_York)'
          }
        },
        required: ['timezone']
      }
    },
    implementation: async ({ timezone }) => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      return formatter.format(now);
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculate',
      description: 'Perform a mathematical calculation',
      parameters: {
        type: 'object',
        properties: {
          expression: {
            type: 'string',
            description: 'Math expression to evaluate (e.g., "2 + 2")'
          }
        },
        required: ['expression']
      }
    },
    implementation: async ({ expression }) => {
      try {
        // Simple safe evaluation (only numbers and basic operators)
        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
        const result = eval(sanitized);
        return result.toString();
      } catch (error: any) {
        return `Error: ${error.message}`;
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getSystemInfo',
      description: 'Get system information',
      parameters: {
        type: 'object',
        properties: {}
      }
    },
    implementation: async () => {
      return JSON.stringify({
        platform: process.platform,
        nodeVersion: process.version,
        memory: {
          total: Math.round(require('os').totalmem() / 1024 / 1024 / 1024) + ' GB',
          free: Math.round(require('os').freemem() / 1024 / 1024 / 1024) + ' GB'
        },
        cpus: require('os').cpus().length
      });
    }
  }
];

async function main() {
  console.log('Starting conversation with client tools...\n');

  const response = await client.conversations.create({
    peerId: process.env.COGNIPEER_PEER_ID || 'your-peer-id',
    messages: [
      { 
        role: 'user', 
        content: 'What time is it in Tokyo? Also calculate 123 * 456 and tell me about this system.' 
      }
    ],
    clientTools: tools
  });

  console.log('AI Response:', response.content);
  console.log('\nConversation ID:', response.conversationId);
  
  if (response.tools && response.tools.length > 0) {
    console.log('\nTools executed:');
    response.tools.forEach((tool, i) => {
      console.log(`\n${i + 1}. ${tool.name}`);
      console.log('   Input:', JSON.stringify(tool.input));
      console.log('   Output:', tool.output);
    });
  }
}

main().catch(console.error);
