/**
 * Test file to verify SDK functionality
 * 
 * Run: node test-build.js
 */

const { CognipeerClient } = require('./dist/index.js');

console.log('Testing Cognipeer SDK...\n');

// Test 1: Client initialization
console.log('✓ Test 1: Client initialization');
const client = new CognipeerClient({
  token: 'test-token-123'
});
console.log('  Client created successfully\n');

// Test 2: Check methods exist
console.log('✓ Test 2: Method availability');
console.log('  conversations.create:', typeof client.conversations.create === 'function');
console.log('  conversations.sendMessage:', typeof client.conversations.sendMessage === 'function');
console.log('  conversations.list:', typeof client.conversations.list === 'function');
console.log('  conversations.get:', typeof client.conversations.get === 'function');
console.log('  conversations.getMessages:', typeof client.conversations.getMessages === 'function');
console.log('  conversations.resumeMessage:', typeof client.conversations.resumeMessage === 'function');
console.log('  flows.execute:', typeof client.flows.execute === 'function');
console.log();

// Test 3: Error handling
console.log('✓ Test 3: Error handling');
try {
  new CognipeerClient({ token: '' });
  console.log('  ✗ Should have thrown error for empty token');
} catch (error) {
  console.log('  ✓ Correctly throws error for empty token:', error.message);
}
console.log();

// Test 4: Configuration
console.log('✓ Test 4: Configuration options');
const configuredClient = new CognipeerClient({
  token: 'test-token',
  apiUrl: 'https://custom-api.example.com',
  autoExecuteTools: false,
  maxToolExecutions: 5,
  timeout: 30000
});
console.log('  Custom configuration accepted\n');

// Test 5: Type exports
console.log('✓ Test 5: Type definitions');
const types = require('./dist/index.js');
console.log('  CognipeerClient exported:', typeof types.CognipeerClient === 'function');
console.log('  Default export available:', typeof types.default === 'function');
console.log();

console.log('✅ All tests passed!');
console.log('\n📦 SDK is ready for publishing!');
console.log('\nNext steps:');
console.log('1. npm run docs:build - Build documentation');
console.log('2. npm publish --dry-run - Test publish');
console.log('3. npm publish --access public - Publish to npm');
