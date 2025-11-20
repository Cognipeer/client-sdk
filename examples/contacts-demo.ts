import { CognipeerClient } from '../src';

/**
 * Complete example demonstrating contact management
 * 
 * This example shows how to:
 * - Create contacts with custom properties
 * - Find contacts by email or integration ID
 * - Update contact information
 * - List contacts with pagination and filtering
 * - Handle errors gracefully
 * - Use both PAT and API token authentication
 */

async function main() {
  // Initialize client with Personal Access Token
  const client = new CognipeerClient({
    token: process.env.COGNIPEER_TOKEN || 'pat_your-token',
    hookId: process.env.COGNIPEER_HOOK_ID || 'your-hook-id',
  });

  console.log('=== Cognipeer Contacts API Demo ===\n');

  try {
    // 1. Create a new contact
    console.log('1. Creating a new contact...');
    const newContact = await client.contacts.create({
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+1234567890',
      properties: {
        company: 'ACME Corp',
        position: 'CEO',
        industry: 'Technology'
      },
      tags: ['vip', 'enterprise'],
      status: 'active',
      metadata: {
        source: 'sdk-example',
        createdBy: 'demo-script'
      }
    });
    console.log(`✓ Contact created: ${newContact._id}`);
    console.log(`  Name: ${newContact.name}`);
    console.log(`  Email: ${newContact.email}\n`);

    // 2. Get contact by email
    console.log('2. Retrieving contact by email...');
    const foundByEmail = await client.contacts.get({
      email: 'john.doe@example.com'
    });
    console.log(`✓ Found contact: ${foundByEmail.name}`);
    console.log(`  Company: ${foundByEmail.properties?.company}\n`);

    // 3. Update contact information
    console.log('3. Updating contact information...');
    const updatedContact = await client.contacts.update({
      email: 'john.doe@example.com',
      data: {
        name: 'John Smith',
        phone: '+1987654321',
        properties: {
          ...foundByEmail.properties,
          company: 'New Corp',
          position: 'CTO'
        },
        tags: ['vip', 'enterprise', 'technical'],
        status: 'vip'
      }
    });
    console.log(`✓ Contact updated: ${updatedContact.name}`);
    console.log(`  New company: ${updatedContact.properties?.company}`);
    console.log(`  New position: ${updatedContact.properties?.position}\n`);

    // 4. Create contact with integration ID
    console.log('4. Creating contact with integration ID...');
    const externalContact = await client.contacts.create({
      email: 'external@example.com',
      name: 'External User',
      integrationId: 'ext-12345',
      properties: {
        externalSystem: 'CRM',
        syncedAt: new Date().toISOString()
      },
      metadata: {
        source: 'external-crm'
      }
    });
    console.log(`✓ External contact created: ${externalContact._id}`);
    console.log(`  Integration ID: ${externalContact.integrationId}\n`);

    // 5. Get contact by integration ID
    console.log('5. Retrieving contact by integration ID...');
    const foundByIntegrationId = await client.contacts.get({
      integrationId: 'ext-12345'
    });
    console.log(`✓ Found contact: ${foundByIntegrationId.name}`);
    console.log(`  Email: ${foundByIntegrationId.email}\n`);

    // 6. List contacts with pagination
    console.log('6. Listing all contacts...');
    const contactList = await client.contacts.list({
      page: 1,
      limit: 10,
      sort: { createdDate: -1 }
    });
    console.log(`✓ Found ${contactList.total} total contacts`);
    console.log(`  Showing page ${contactList.page} of ${Math.ceil(contactList.total / contactList.limit)}`);
    contactList.data.forEach((contact, index) => {
      console.log(`  ${index + 1}. ${contact.name} <${contact.email}>`);
    });
    console.log();

    // 7. Filter contacts by status
    console.log('7. Filtering contacts by status...');
    const activeContacts = await client.contacts.list({
      page: 1,
      limit: 50,
      filter: {
        status: 'active',
        deleted: { $ne: true }
      }
    });
    console.log(`✓ Found ${activeContacts.total} active contacts\n`);

    // 8. Filter contacts by tags
    console.log('8. Filtering VIP contacts...');
    const vipContacts = await client.contacts.list({
      filter: {
        tags: { $in: ['vip', 'enterprise'] }
      }
    });
    console.log(`✓ Found ${vipContacts.total} VIP contacts\n`);

    // 9. Bulk update example
    console.log('9. Bulk status update for VIP contacts...');
    let updatedCount = 0;
    for (const contact of vipContacts.data) {
      if (contact.email) {
        await client.contacts.update({
          email: contact.email,
          data: {
            status: 'premium',
            metadata: {
              ...contact.metadata,
              bulkUpdated: new Date().toISOString()
            }
          }
        });
        updatedCount++;
      }
    }
    console.log(`✓ Updated ${updatedCount} contacts to premium status\n`);

    // 10. Sync with external system example
    console.log('10. Syncing with external system...');
    const externalContacts = [
      { id: 'crm-001', email: 'user1@example.com', name: 'User One' },
      { id: 'crm-002', email: 'user2@example.com', name: 'User Two' },
    ];

    for (const extContact of externalContacts) {
      try {
        // Try to find existing contact
        const existing = await client.contacts.get({
          integrationId: extContact.id
        });
        
        // Update existing
        await client.contacts.update({
          integrationId: extContact.id,
          data: {
            name: extContact.name,
            email: extContact.email,
            metadata: {
              lastSync: new Date().toISOString()
            }
          }
        });
        console.log(`  ✓ Updated: ${extContact.name}`);
      } catch (error) {
        // Create new contact if not found
        await client.contacts.create({
          integrationId: extContact.id,
          email: extContact.email,
          name: extContact.name,
          metadata: {
            source: 'external-crm',
            firstSync: new Date().toISOString()
          }
        });
        console.log(`  ✓ Created: ${extContact.name}`);
      }
    }
    console.log('✓ Sync completed\n');

    // 11. Generate contact report
    console.log('11. Generating contact report...');
    const allContacts = await client.contacts.list({
      page: 1,
      limit: 1000
    });

    const report = {
      total: allContacts.total,
      byStatus: {} as Record<string, number>,
      byTag: {} as Record<string, number>,
      withPhone: 0,
      withCompany: 0
    };

    allContacts.data.forEach(contact => {
      // Count by status
      const status = contact.status || 'unknown';
      report.byStatus[status] = (report.byStatus[status] || 0) + 1;

      // Count by tags
      contact.tags?.forEach(tag => {
        report.byTag[tag] = (report.byTag[tag] || 0) + 1;
      });

      // Count with phone
      if (contact.phone) report.withPhone++;

      // Count with company
      if (contact.properties?.company) report.withCompany++;
    });

    console.log('Contact Report:');
    console.log(`  Total Contacts: ${report.total}`);
    console.log(`  By Status:`, JSON.stringify(report.byStatus, null, 4));
    console.log(`  By Tags:`, JSON.stringify(report.byTag, null, 4));
    console.log(`  With Phone: ${report.withPhone}`);
    console.log(`  With Company: ${report.withCompany}\n`);

    console.log('=== Demo completed successfully! ===');

  } catch (error: any) {
    console.error('\n❌ Error occurred:');
    console.error(`  Message: ${error.message}`);
    console.error(`  Stack: ${error.stack}`);
    process.exit(1);
  }
}

// Error handling wrapper
async function runDemo() {
  try {
    await main();
  } catch (error: any) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the demo
runDemo();
