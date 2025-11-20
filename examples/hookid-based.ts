import { CognipeerClient } from '@cognipeer/sdk';

/**
 * Example: Using hookId-based API access
 * 
 * This demonstrates the new architecture where:
 * 1. You create a Personal Access Token (PAT) in user settings
 * 2. You create an API channel for your peer and get a hookId
 * 3. You use both token and hookId to access the API
 * 4. peerId is automatically determined from the hookId
 */

async function main() {
  // Initialize client with PAT and hookId
  const client = new CognipeerClient({
    token: 'pat_your-personal-access-token',  // From user settings
    hookId: 'your-api-channel-hook-id',       // From API channel settings
    apiUrl: 'https://api.cognipeer.com/v1'    // Optional, defaults to production
  });

  try {
    // Get information about the peer and channel
    console.log('📡 Fetching peer, channel, and user information...\n');
    
    const peer = await client.peers.get();
    console.log('👤 Peer Information:');
    console.log(`   Name: ${peer.name}`);
    console.log(`   Model: ${peer.modelId}`);
    console.log(`   ID: ${peer._id}\n`);

    const channel = await client.channels.get();
    console.log('🔌 Channel Information:');
    console.log(`   Hook ID: ${channel.hookId}`);
    console.log(`   Type: ${channel.channelType}`);
    console.log(`   Active: ${channel.isActive}`);
    if (channel.hookData?.settings) {
      console.log(`   Hook Settings:`, JSON.stringify(channel.hookData.settings, null, 2));
    }
    console.log();

    const user = await client.users.get();
    console.log('👨‍💼 User Information:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.displayName}`);
    console.log(`   Workspace: ${user.workspace?.name} (${user.workspace?.slug})`);
    console.log(`   Roles: ${user.roles?.join(', ')}\n`);

    // Create a conversation (peerId is automatically determined)
    console.log('💬 Creating conversation...\n');
    
    const response = await client.conversations.create({
      messages: [
        { role: 'user', content: 'Hello! Can you introduce yourself?' }
      ]
    });

    console.log('🤖 AI Response:');
    console.log(response.content);
    console.log(`\n✓ Conversation ID: ${response.conversationId}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

// Run the example
main();
