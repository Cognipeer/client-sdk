# Structured Output Examples

Generate JSON or typed data consistently by combining client tools with schema-guided prompts.

## Basic JSON Schema

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: process.env.COGNIPEER_TOKEN!
});

async function planTrip() {
  const response = await client.conversations.create({
    peerId: 'your-peer-id',
    messages: [
      {
        role: 'user',
        content: 'Plan a weekend in Lisbon for two adults. Return JSON.'
      }
    ],
    responseFormat: {
      type: 'json_schema',
      json_schema: {
        name: 'travel_plan',
        schema: {
          type: 'object',
          properties: {
            overview: { type: 'string' },
            days: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'string' },
                  morning: { type: 'string' },
                  afternoon: { type: 'string' },
                  evening: { type: 'string' }
                },
                required: ['day', 'morning', 'afternoon', 'evening']
              }
            }
          },
          required: ['overview', 'days']
        }
      }
    }
  });

  console.log(JSON.parse(response.content ?? '{}'));
}
```

Set `responseFormat.type` to `json_schema` to tell Cognipeer to only return data that matches your schema.

## Validating Responses

```typescript
import { z } from 'zod';

const TripPlan = z.object({
  overview: z.string(),
  days: z.array(
    z.object({
      day: z.string(),
      morning: z.string(),
      afternoon: z.string(),
      evening: z.string()
    })
  )
});

async function safePlan() {
  const result = await planTrip();
  const parsed = TripPlan.parse(result);
  return parsed;
}
```

Use runtime validators (Zod, Ajv, Joi) to guarantee safety before persisting data.

## Structured Tool Outputs

Tools can also enforce shape by returning JSON strings:

```typescript
const lookupOrderTool = {
  type: 'function' as const,
  function: {
    name: 'lookupOrder',
    description: 'Get order details by ID',
    parameters: {
      type: 'object',
      properties: {
        orderId: { type: 'string' }
      },
      required: ['orderId']
    }
  },
  implementation: async ({ orderId }) => {
    const order = await db.orders.find(orderId);
    return JSON.stringify({
      orderId,
      status: order.status,
      total: order.total,
      items: order.items.map(item => ({
        sku: item.sku,
        quantity: item.qty,
        price: item.price
      }))
    });
  }
};
```

Because the SDK serializes tool outputs back into the conversation, providing strict JSON lets you stitch downstream automations with confidence.

## When to Use Structured Output

- Generating entities you will store in a database
- Returning machine-readable responses to the browser
- Creating workflows where multiple agents pass data between each other
- Triggering flows based on AI-generated parameters

## Next Steps

- [Client Tools Examples](/examples/client-tools)
- [Use Cases](/examples/use-cases)
- [API Reference](/api/client)
