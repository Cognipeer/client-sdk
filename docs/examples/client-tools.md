# Client Tools Examples

Complete real-world examples of using client-side tool execution.

## Weather Tool

A simple weather lookup tool:

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});

const weatherTool = {
  type: 'function' as const,
  function: {
    name: 'getCurrentWeather',
    description: 'Get current weather for a city',
    parameters: {
      type: 'object' as const,
      properties: {
        city: {
          type: 'string' as const,
          description: 'City name (e.g., "London", "Tokyo")'
        },
        units: {
          type: 'string' as const,
          enum: ['celsius', 'fahrenheit'],
          description: 'Temperature units'
        }
      },
      required: ['city']
    }
  },
  implementation: async ({ city, units = 'celsius' }) => {
    // Call a weather API (example with OpenWeatherMap)
    const apiKey = process.env.WEATHER_API_KEY;
    const unitsParam = units === 'celsius' ? 'metric' : 'imperial';
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unitsParam}&appid=${apiKey}`
    );
    
    const data = await response.json();
    
    return JSON.stringify({
      temperature: data.main.temp,
      conditions: data.weather[0].description,
      humidity: data.main.humidity,
      units
    });
  }
};

async function askAboutWeather() {
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { role: 'user', content: 'What is the weather like in Tokyo?' }
    ],
    clientTools: [weatherTool]
  });
  
  console.log(response.content);
  // "The weather in Tokyo is currently 22°C with clear skies and 65% humidity."
}

askAboutWeather().catch(console.error);
```

## Database Query Tool

Query your database safely:

```typescript
import { CognipeerClient } from '@cognipeer/sdk';
import { Pool } from 'pg';

const db = new Pool({
  connectionString: process.env.DATABASE_URL
});

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});

const databaseTools = [
  {
    type: 'function' as const,
    function: {
      name: 'searchUsers',
      description: 'Search for users in the database',
      parameters: {
        type: 'object' as const,
        properties: {
          email: {
            type: 'string' as const,
            description: 'User email to search for'
          },
          name: {
            type: 'string' as const,
            description: 'User name to search for'
          },
          limit: {
            type: 'number' as const,
            description: 'Maximum number of results'
          }
        }
      }
    },
    implementation: async ({ email, name, limit = 10 }) => {
      const conditions = [];
      const values = [];
      
      if (email) {
        conditions.push(`email ILIKE $${values.length + 1}`);
        values.push(`%${email}%`);
      }
      
      if (name) {
        conditions.push(`name ILIKE $${values.length + 1}`);
        values.push(`%${name}%`);
      }
      
      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' OR ')}`
        : '';
      
      const query = `
        SELECT id, name, email, created_at 
        FROM users 
        ${whereClause}
        LIMIT $${values.length + 1}
      `;
      
      values.push(limit);
      
      const result = await db.query(query, values);
      return JSON.stringify(result.rows);
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'getUserOrders',
      description: 'Get orders for a specific user',
      parameters: {
        type: 'object' as const,
        properties: {
          userId: {
            type: 'string' as const,
            description: 'User ID'
          }
        },
        required: ['userId']
      }
    },
    implementation: async ({ userId }) => {
      const result = await db.query(
        `SELECT id, total, status, created_at 
         FROM orders 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 20`,
        [userId]
      );
      
      return JSON.stringify(result.rows);
    }
  }
];

async function queryDatabase() {
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { role: 'user', content: 'Find user john@example.com and show their recent orders' }
    ],
    clientTools: databaseTools
  });
  
  console.log(response.content);
  console.log('\nTools used:', response.tools?.map(t => t.name));
}

queryDatabase().catch(console.error);
```

## File System Operations

Safe file system access:

```typescript
import { CognipeerClient } from '@cognipeer/sdk';
import { promises as fs } from 'fs';
import path from 'path';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});

// Define safe directory
const SAFE_DIR = path.join(process.cwd(), 'data');

const fileTools = [
  {
    type: 'function' as const,
    function: {
      name: 'listFiles',
      description: 'List files in a directory',
      parameters: {
        type: 'object' as const,
        properties: {
          directory: {
            type: 'string' as const,
            description: 'Directory path (relative to safe directory)'
          }
        }
      }
    },
    implementation: async ({ directory = '.' }) => {
      const safePath = path.join(SAFE_DIR, directory);
      
      // Security check
      if (!safePath.startsWith(SAFE_DIR)) {
        return 'Access denied: Invalid path';
      }
      
      const files = await fs.readdir(safePath);
      return JSON.stringify(files);
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'readFile',
      description: 'Read contents of a text file',
      parameters: {
        type: 'object' as const,
        properties: {
          filename: {
            type: 'string' as const,
            description: 'File name to read'
          }
        },
        required: ['filename']
      }
    },
    implementation: async ({ filename }) => {
      const safePath = path.join(SAFE_DIR, filename);
      
      // Security checks
      if (!safePath.startsWith(SAFE_DIR)) {
        return 'Access denied: Invalid path';
      }
      
      if (path.extname(filename) === '.exe') {
        return 'Access denied: Cannot read executable files';
      }
      
      const content = await fs.readFile(safePath, 'utf-8');
      return content;
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'writeFile',
      description: 'Write content to a file',
      parameters: {
        type: 'object' as const,
        properties: {
          filename: {
            type: 'string' as const,
            description: 'File name to write'
          },
          content: {
            type: 'string' as const,
            description: 'Content to write'
          }
        },
        required: ['filename', 'content']
      }
    },
    implementation: async ({ filename, content }) => {
      const safePath = path.join(SAFE_DIR, filename);
      
      // Security check
      if (!safePath.startsWith(SAFE_DIR)) {
        return 'Access denied: Invalid path';
      }
      
      await fs.writeFile(safePath, content, 'utf-8');
      return `File ${filename} written successfully`;
    }
  }
];

async function fileSystemChat() {
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { role: 'user', content: 'List all files and read README.md' }
    ],
    clientTools: fileTools
  });
  
  console.log(response.content);
}

fileSystemChat().catch(console.error);
```

## Email Sending Tool

Integrate with email services:

```typescript
import { CognipeerClient } from '@cognipeer/sdk';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});

const emailTool = {
  type: 'function' as const,
  function: {
    name: 'sendEmail',
    description: 'Send an email to a recipient',
    parameters: {
      type: 'object' as const,
      properties: {
        to: {
          type: 'string' as const,
          description: 'Recipient email address'
        },
        subject: {
          type: 'string' as const,
          description: 'Email subject'
        },
        body: {
          type: 'string' as const,
          description: 'Email body content'
        }
      },
      required: ['to', 'subject', 'body']
    }
  },
  implementation: async ({ to, subject, body }) => {
    // Validate email
    if (!to.includes('@')) {
      return 'Invalid email address';
    }
    
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text: body
      });
      
      return `Email sent successfully (ID: ${info.messageId})`;
    } catch (error: any) {
      return `Failed to send email: ${error.message}`;
    }
  }
};

async function emailAssistant() {
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { 
        role: 'user', 
        content: 'Send an email to team@company.com about tomorrow\'s meeting at 3 PM' 
      }
    ],
    clientTools: [emailTool]
  });
  
  console.log(response.content);
}

emailAssistant().catch(console.error);
```

## API Integration (Stripe)

Integrate with third-party APIs:

```typescript
import { CognipeerClient } from '@cognipeer/sdk';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});

const stripeTools = [
  {
    type: 'function' as const,
    function: {
      name: 'searchCustomers',
      description: 'Search for Stripe customers by email',
      parameters: {
        type: 'object' as const,
        properties: {
          email: {
            type: 'string' as const,
            description: 'Customer email address'
          }
        },
        required: ['email']
      }
    },
    implementation: async ({ email }) => {
      const customers = await stripe.customers.list({
        email,
        limit: 10
      });
      
      return JSON.stringify(customers.data.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        created: new Date(c.created * 1000).toISOString()
      })));
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'getCustomerPayments',
      description: 'Get payment history for a customer',
      parameters: {
        type: 'object' as const,
        properties: {
          customerId: {
            type: 'string' as const,
            description: 'Stripe customer ID'
          }
        },
        required: ['customerId']
      }
    },
    implementation: async ({ customerId }) => {
      const charges = await stripe.charges.list({
        customer: customerId,
        limit: 20
      });
      
      return JSON.stringify(charges.data.map(c => ({
        id: c.id,
        amount: c.amount / 100,
        currency: c.currency,
        status: c.status,
        date: new Date(c.created * 1000).toISOString()
      })));
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'createRefund',
      description: 'Create a refund for a charge',
      parameters: {
        type: 'object' as const,
        properties: {
          chargeId: {
            type: 'string' as const,
            description: 'Charge ID to refund'
          },
          amount: {
            type: 'number' as const,
            description: 'Amount to refund in dollars (optional, defaults to full amount)'
          },
          reason: {
            type: 'string' as const,
            enum: ['duplicate', 'fraudulent', 'requested_by_customer'],
            description: 'Reason for refund'
          }
        },
        required: ['chargeId']
      }
    },
    implementation: async ({ chargeId, amount, reason = 'requested_by_customer' }) => {
      const refund = await stripe.refunds.create({
        charge: chargeId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason
      });
      
      return `Refund created: ${refund.id} for $${refund.amount / 100}`;
    }
  }
];

async function stripeAssistant() {
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { 
        role: 'user', 
        content: 'Find customer john@example.com and refund their last payment' 
      }
    ],
    clientTools: stripeTools
  });
  
  console.log(response.content);
  console.log('\nTools used:', response.tools?.map(t => t.name).join(' → '));
}

stripeAssistant().catch(console.error);
```

## Calendar Integration

Integrate with Google Calendar:

```typescript
import { CognipeerClient } from '@cognipeer/sdk';
import { google } from 'googleapis';

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

auth.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth });

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});

const calendarTools = [
  {
    type: 'function' as const,
    function: {
      name: 'listEvents',
      description: 'List upcoming calendar events',
      parameters: {
        type: 'object' as const,
        properties: {
          days: {
            type: 'number' as const,
            description: 'Number of days to look ahead'
          }
        }
      }
    },
    implementation: async ({ days = 7 }) => {
      const now = new Date();
      const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: future.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      const events = response.data.items || [];
      return JSON.stringify(events.map(e => ({
        summary: e.summary,
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
        location: e.location
      })));
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'createEvent',
      description: 'Create a new calendar event',
      parameters: {
        type: 'object' as const,
        properties: {
          summary: {
            type: 'string' as const,
            description: 'Event title'
          },
          startTime: {
            type: 'string' as const,
            description: 'Start time in ISO format'
          },
          endTime: {
            type: 'string' as const,
            description: 'End time in ISO format'
          },
          description: {
            type: 'string' as const,
            description: 'Event description'
          }
        },
        required: ['summary', 'startTime', 'endTime']
      }
    },
    implementation: async ({ summary, startTime, endTime, description }) => {
      const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary,
          description,
          start: { dateTime: startTime },
          end: { dateTime: endTime }
        }
      });
      
      return `Event created: ${event.data.htmlLink}`;
    }
  }
];

async function calendarAssistant() {
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { 
        role: 'user', 
        content: 'What meetings do I have this week?' 
      }
    ],
    clientTools: calendarTools
  });
  
  console.log(response.content);
}

calendarAssistant().catch(console.error);
```

## Multi-Tool Chain Example

Complex workflow using multiple tools:

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});

const businessTools = [
  {
    type: 'function' as const,
    function: {
      name: 'searchInventory',
      description: 'Search for products in inventory',
      parameters: {
        type: 'object' as const,
        properties: {
          query: { type: 'string' as const }
        },
        required: ['query']
      }
    },
    implementation: async ({ query }) => {
      // Simulate inventory lookup
      return JSON.stringify([
        { id: '1', name: 'Product A', stock: 50, price: 29.99 },
        { id: '2', name: 'Product B', stock: 0, price: 49.99 }
      ]);
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'checkSupplier',
      description: 'Check supplier availability for a product',
      parameters: {
        type: 'object' as const,
        properties: {
          productId: { type: 'string' as const }
        },
        required: ['productId']
      }
    },
    implementation: async ({ productId }) => {
      return JSON.stringify({
        available: true,
        leadTime: '5 days',
        quantity: 1000
      });
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'createPurchaseOrder',
      description: 'Create a purchase order',
      parameters: {
        type: 'object' as const,
        properties: {
          productId: { type: 'string' as const },
          quantity: { type: 'number' as const }
        },
        required: ['productId', 'quantity']
      }
    },
    implementation: async ({ productId, quantity }) => {
      return `PO-${Date.now()} created for ${quantity} units of product ${productId}`;
    }
  }
];

async function businessWorkflow() {
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      { 
        role: 'user', 
        content: 'Check if Product B is in stock. If not, order 100 units from supplier.' 
      }
    ],
    clientTools: businessTools
  });
  
  console.log(response.content);
  console.log('\nExecution chain:', response.tools?.map(t => t.name).join(' → '));
}

businessWorkflow().catch(console.error);
```

## Next Steps

- [Structured Output](/examples/structured-output) - Get JSON responses
- [Browser Integration](/examples/browser) - Use in web apps
- [Use Cases](/examples/use-cases) - More real-world examples
