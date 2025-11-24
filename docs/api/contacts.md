# Contacts API

The Contacts API allows you to manage contacts in your workspace. Contacts represent users, customers, or any individuals you interact with through your Cognipeer AI agents.

## Authentication

**Important**: The Contacts API supports **both** authentication methods:
- **Personal Access Token (PAT)** - For server-side applications
- **API Token (hookId)** - For API channel-based access

This dual authentication support makes the Contacts API unique among SDK endpoints, allowing it to be used in both traditional server applications and API channel integrations.

## Available Methods

### `contacts.create(options)`

Create a new contact in your workspace.

**Parameters:**
- `options` (CreateContactOptions):
  - `email?` (string): Contact's email address
  - `integrationId?` (string): External system identifier
  - `name?` (string): Contact's full name
  - `phone?` (string): Contact's phone number
  - `metadata?` (object): Additional metadata
  - `properties?` (object): Custom properties
  - `tags?` (string[]): Contact tags
  - `status?` (string): Contact status
  - Additional custom fields as needed

**Returns:** `Promise<Contact>`

**Example:**
```typescript
const contact = await client.contacts.create({
  email: 'john.doe@example.com',
  name: 'John Doe',
  phone: '+1234567890',
  properties: {
    company: 'ACME Corp',
    position: 'CEO'
  },
  tags: ['vip', 'enterprise'],
  status: 'active'
});

console.log(`Created contact: ${contact._id}`);
```

**With API Token:**
```typescript
// When using hookId for authentication
const client = new CognipeerClient({
  token: 'your-api-token',
  hookId: 'your-channel-hook-id'
});

const contact = await client.contacts.create({
  email: 'api-user@example.com',
  name: 'API User',
  integrationId: 'external-id-123'
});
```

---

### `contacts.get(options)`

Retrieve a contact by email or integration ID.

**Parameters:**
- `options` (GetContactOptions):
  - `email?` (string): Find contact by email
  - `integrationId?` (string): Find contact by integration ID
  
*Note: Either `email` or `integrationId` must be provided.*

**Returns:** `Promise<Contact>`

**Example:**
```typescript
// Find by email
const contact = await client.contacts.get({ 
  email: 'john.doe@example.com' 
});

console.log(`Found contact: ${contact.name}`);
```

```typescript
// Find by integration ID
const contact = await client.contacts.get({ 
  integrationId: 'ext-12345' 
});

console.log(`Contact email: ${contact.email}`);
```

**Error Handling:**
```typescript
try {
  const contact = await client.contacts.get({ 
    email: 'nonexistent@example.com' 
  });
} catch (error) {
  if (error.message.includes('not found')) {
    console.log('Contact does not exist');
  }
}
```

---

### `contacts.update(options)`

Update an existing contact by email or integration ID.

**Parameters:**
- `options` (UpdateContactOptions):
  - `email?` (string): Identify contact by email
  - `integrationId?` (string): Identify contact by integration ID
  - `data` (object): Fields to update
    - `name?` (string): Update contact name
    - `email?` (string): Update email address
    - `phone?` (string): Update phone number
    - `metadata?` (object): Update metadata
    - `properties?` (object): Update custom properties
    - `tags?` (string[]): Update tags
    - `status?` (string): Update status
    - Additional custom fields

*Note: Either `email` or `integrationId` must be provided to identify the contact.*

**Returns:** `Promise<Contact>`

**Example:**
```typescript
// Update by email
const updatedContact = await client.contacts.update({
  email: 'john.doe@example.com',
  data: {
    name: 'John Smith',
    phone: '+1987654321',
    properties: {
      company: 'New Corp',
      position: 'CTO'
    },
    tags: ['vip', 'enterprise', 'technical']
  }
});

console.log(`Updated: ${updatedContact.name}`);
```

```typescript
// Update by integration ID
const updatedContact = await client.contacts.update({
  integrationId: 'ext-12345',
  data: {
    status: 'inactive',
    metadata: {
      lastInteraction: new Date().toISOString()
    }
  }
});
```

**Partial Updates:**
```typescript
// Only update specific fields
await client.contacts.update({
  email: 'john.doe@example.com',
  data: {
    tags: ['premium'] // Only updates tags, leaves other fields unchanged
  }
});
```

---

### `contacts.list(options)`

List contacts with pagination and filtering.

**Parameters:**
- `options?` (ListContactsOptions):
  - `page?` (number): Page number (default: 1)
  - `limit?` (number): Items per page (default: 10)
  - `filter?` (object): Filter criteria
  - `sort?` (object): Sort options (e.g., `{ createdDate: -1 }`)

**Returns:** `Promise<PaginatedResponse<Contact>>`

**Example:**
```typescript
// Basic listing
const result = await client.contacts.list({
  page: 1,
  limit: 20
});

console.log(`Total contacts: ${result.total}`);
console.log(`Page ${result.page} of ${Math.ceil(result.total / result.limit)}`);

result.data.forEach(contact => {
  console.log(`${contact.name} <${contact.email}>`);
});
```

**With Filtering:**
```typescript
// Filter by status
const activeContacts = await client.contacts.list({
  page: 1,
  limit: 50,
  filter: {
    status: 'active',
    deleted: { $ne: true }
  },
  sort: { createdDate: -1 }
});
```

**Advanced Filtering:**
```typescript
// Complex filters
const vipContacts = await client.contacts.list({
  filter: {
    tags: { $in: ['vip', 'enterprise'] },
    'properties.company': { $exists: true }
  },
  sort: { 'properties.company': 1 }
});
```

**Pagination Loop:**
```typescript
// Fetch all contacts
const allContacts = [];
let page = 1;
let hasMore = true;

while (hasMore) {
  const result = await client.contacts.list({ page, limit: 100 });
  allContacts.push(...result.data);
  
  hasMore = page * result.limit < result.total;
  page++;
}

console.log(`Loaded ${allContacts.length} total contacts`);
```

---

## Authentication Examples

### Using Personal Access Token (PAT)

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: 'pat_your_personal_access_token',
  hookId: 'your-hook-id'
});

// All contact operations work with PAT
const contact = await client.contacts.create({
  email: 'user@example.com',
  name: 'User Name'
});
```

### Using API Token (hookId-based)

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

const client = new CognipeerClient({
  token: 'your-api-token',
  hookId: 'your-channel-hook-id'
});

// Same methods work with API token
const contact = await client.contacts.get({
  email: 'user@example.com'
});
```

---

## Type Definitions

### Contact

```typescript
interface Contact {
  _id: string;
  email?: string;
  integrationId?: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, any>;
  properties?: Record<string, any>;
  workspaceId: string;
  peerId?: string;
  tags?: string[];
  status?: string;
  createdDate?: string;
  modifiedDate?: string;
  deleted?: boolean;
  [key: string]: any;
}
```

### CreateContactOptions

```typescript
interface CreateContactOptions {
  email?: string;
  integrationId?: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, any>;
  properties?: Record<string, any>;
  tags?: string[];
  status?: string;
  [key: string]: any;
}
```

### GetContactOptions

```typescript
interface GetContactOptions {
  email?: string;
  integrationId?: string;
}
```

### UpdateContactOptions

```typescript
interface UpdateContactOptions {
  email?: string;
  integrationId?: string;
  data: {
    name?: string;
    email?: string;
    phone?: string;
    metadata?: Record<string, any>;
    properties?: Record<string, any>;
    tags?: string[];
    status?: string;
    [key: string]: any;
  };
}
```

### ListContactsOptions

```typescript
interface ListContactsOptions {
  page?: number;
  limit?: number;
  filter?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
}
```

### PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

---

## Use Cases

### Customer Relationship Management

```typescript
// Create a new customer contact
const customer = await client.contacts.create({
  email: 'customer@company.com',
  name: 'Jane Customer',
  phone: '+1555000000',
  properties: {
    company: 'Customer Corp',
    industry: 'Technology',
    lifetimeValue: 50000
  },
  tags: ['customer', 'paid'],
  status: 'active'
});

// Later, update their status
await client.contacts.update({
  email: 'customer@company.com',
  data: {
    status: 'vip',
    tags: ['customer', 'paid', 'vip'],
    properties: {
      ...customer.properties,
      lifetimeValue: 100000
    }
  }
});
```

### External System Integration

```typescript
// Sync contact from external CRM
async function syncContact(externalContact) {
  try {
    // Check if contact exists
    const existing = await client.contacts.get({
      integrationId: externalContact.id
    });
    
    // Update existing contact
    return await client.contacts.update({
      integrationId: externalContact.id,
      data: {
        name: externalContact.name,
        email: externalContact.email,
        metadata: {
          lastSync: new Date().toISOString(),
          source: 'external-crm'
        }
      }
    });
  } catch (error) {
    // Contact doesn't exist, create it
    return await client.contacts.create({
      integrationId: externalContact.id,
      name: externalContact.name,
      email: externalContact.email,
      metadata: {
        source: 'external-crm'
      }
    });
  }
}
```

### Contact Search and Reporting

```typescript
// Generate contact report
async function generateContactReport() {
  const activeContacts = await client.contacts.list({
    page: 1,
    limit: 1000,
    filter: { status: 'active' },
    sort: { createdDate: -1 }
  });
  
  const report = {
    total: activeContacts.total,
    byTag: {},
    byStatus: {},
    recentlyAdded: activeContacts.data.slice(0, 10)
  };
  
  activeContacts.data.forEach(contact => {
    // Count by tags
    contact.tags?.forEach(tag => {
      report.byTag[tag] = (report.byTag[tag] || 0) + 1;
    });
    
    // Count by status
    report.byStatus[contact.status] = 
      (report.byStatus[contact.status] || 0) + 1;
  });
  
  return report;
}
```

---

## Error Handling

```typescript
import { CognipeerClient } from '@cognipeer/sdk';

async function safeContactOperation() {
  try {
    const contact = await client.contacts.get({
      email: 'user@example.com'
    });
    
    return contact;
  } catch (error) {
    if (error.message.includes('not found')) {
      console.log('Contact does not exist, creating new one');
      
      return await client.contacts.create({
        email: 'user@example.com',
        name: 'New User'
      });
    }
    
    if (error.message.includes('Authorization')) {
      console.error('Invalid credentials');
    }
    
    throw error; // Re-throw unexpected errors
  }
}
```

---

## Best Practices

1. **Use integrationId for external systems**: When syncing with external systems, always use `integrationId` to maintain references.

2. **Implement retry logic**: Network requests can fail, implement exponential backoff for production use.

3. **Validate data before creation**: Ensure email format and required fields are valid before creating contacts.

4. **Use pagination efficiently**: Don't fetch all contacts at once, use reasonable page sizes (10-100).

5. **Handle errors gracefully**: Always wrap contact operations in try-catch blocks.

6. **Store credentials securely**: Never hardcode API tokens, use environment variables.

7. **Use appropriate authentication**: Choose PAT for server-side apps, API tokens for channel-based integrations.

---

## Related APIs

- [Conversations API](./conversations.md) - Manage conversations with contacts
- [Channels API](./channels.md) - API channel management
- [Authentication](/guide/authentication) - Authentication methods
