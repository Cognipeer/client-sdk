/**
 * Structured Output Example
 * 
 * Demonstrates getting JSON output with a schema
 * 
 * Run: npx tsx examples/structured-output.ts
 */

import { CognipeerClient } from '../src';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN || 'your-api-token',
  apiUrl: process.env.COGNIPEER_API_URL || 'https://api.cognipeer.com'
});

async function main() {
  console.log('=== Structured Output Example ===\n');

  // Extract structured data
  console.log('Extracting structured data from text...\n');
  
  const response = await client.conversations.create({
    peerId: process.env.COGNIPEER_PEER_ID || 'your-peer-id',
    messages: [
      { 
        role: 'user', 
        content: 'Extract the following: John Doe is 30 years old, lives in New York City, and works as a Software Engineer at Tech Corp. His email is john@example.com.' 
      }
    ],
    response_format: 'json',
    response_schema: {
      type: 'object',
      properties: {
        name: { 
          type: 'string',
          description: 'Full name'
        },
        age: { 
          type: 'number',
          description: 'Age in years'
        },
        city: { 
          type: 'string',
          description: 'City of residence'
        },
        occupation: { 
          type: 'string',
          description: 'Job title'
        },
        company: { 
          type: 'string',
          description: 'Company name'
        },
        email: { 
          type: 'string',
          description: 'Email address'
        }
      },
      required: ['name', 'age', 'city', 'occupation', 'company', 'email']
    }
  });

  console.log('Extracted data:');
  console.log(JSON.stringify(response.output, null, 2));
  console.log('\n---\n');

  // Product catalog example
  console.log('Generating structured product catalog...\n');
  
  const catalog = await client.conversations.create({
    peerId: process.env.COGNIPEER_PEER_ID || 'your-peer-id',
    messages: [
      { 
        role: 'user', 
        content: 'Create a product catalog entry for a laptop: Dell XPS 15, 16GB RAM, 512GB SSD, Intel i7, $1,299' 
      }
    ],
    response_format: 'json',
    response_schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        brand: { type: 'string' },
        specs: {
          type: 'object',
          properties: {
            ram: { type: 'string' },
            storage: { type: 'string' },
            processor: { type: 'string' }
          }
        },
        price: { type: 'number' },
        currency: { type: 'string' }
      },
      required: ['name', 'brand', 'specs', 'price']
    }
  });

  console.log('Product catalog entry:');
  console.log(JSON.stringify(catalog.output, null, 2));
  console.log('\n✅ Structured output examples completed!');
}

main().catch(console.error);
