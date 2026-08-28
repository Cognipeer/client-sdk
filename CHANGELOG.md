# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2026-08-28

### Added
- Added Node 24 GitHub Actions workflows for build validation and npm Trusted Publishing.
- Added client tests covering authentication, hook headers, and conversation payloads.

### Changed
- Corrected npm repository, issues, and homepage metadata for `@cognipeer/sdk`.
- Updated README and documentation links to the canonical client-sdk documentation and repository.

## [2.2.0] - 2024-12-XX

### Added
- ✨ **NEW: Contacts API** - Complete contact management functionality
  - `contacts.create()` - Create new contacts with custom properties
  - `contacts.get()` - Retrieve contacts by email or integrationId
  - `contacts.update()` - Update contact information
  - `contacts.list()` - List contacts with pagination and filtering
- 🔐 **Dual Authentication Support** - Contacts API works with both PAT and API tokens
- 🔄 **Resource Re-additions** - Restored previously removed resources:
  - `peers.get()` - Get peer information from channel
  - `users.get()` - Get authenticated user information
  - `channels.get()` - Get channel information
- 📝 New comprehensive documentation:
  - `/docs/api/contacts.md` - Complete Contacts API reference
  - `/docs/api/peers.md` - Peers API documentation
  - `/docs/api/users.md` - Users API documentation
  - `/docs/api/channels.md` - Channels API documentation
- 📚 Updated authentication documentation to explain dual token support
- 🎯 New example: `examples/contacts-demo.ts` - Complete contact management demo

### Changed
- 📖 Updated `README.md` with Contacts API examples and dual authentication info
- 📚 Enhanced authentication documentation in main docs project
- 🏗️ Expanded SDK to include comprehensive workspace resource access

### Type Definitions
Added new TypeScript interfaces:
- `Contact` - Contact entity interface
- `CreateContactOptions` - Options for creating contacts
- `GetContactOptions` - Options for retrieving contacts
- `UpdateContactOptions` - Options for updating contacts
- `ListContactsOptions` - Options for listing contacts with pagination
- `PaginatedResponse<T>` - Generic paginated response type

## [2.1.0] - 2024-11-20

### 🚨 Breaking Changes
- **BREAKING**: Removed `users.get()` method - not needed for client SDK
- **BREAKING**: Removed `peers.get()` method - peerId is managed automatically via hookId
- **BREAKING**: Removed `channels.get()` method - channel info managed internally

### Added
- ✨ New `conversations.list()` method with pagination support
- 📊 Pagination parameters: `page`, `limit`, `sort`, `filter`
- 🔍 Automatic peer filtering based on channel's peerId
- 📝 `title` field added to `Conversation` interface
- 📖 New comprehensive API documentation:
  - `/docs/api/conversations.md` - Complete conversations API reference
  - `/docs/api/configuration.md` - Client configuration guide
  - `/docs/api/flows.md` - Flows/Apps API reference
- 🎯 Enhanced conversation management capabilities

### Changed
- 🔧 Updated `package.json` main entry to use `.js` instead of `.cjs`
- 📚 Updated all documentation to reflect removed methods
- 🏗️ Simplified SDK surface area - focused on essential client-side methods
- 📝 Updated README with pagination examples and new API structure

### Fixed
- 🐛 Fixed CommonJS module loading issue
- 🔧 Fixed `index.cjs` not found error

### Migration Guide
```typescript
// v2.0.0
const user = await client.users.get();
const peer = await client.peers.get();
const channel = await client.channels.get();

// v2.1.0 - These methods removed
// All necessary context is managed automatically via hookId

// New pagination support
const { data, total, page, limit } = await client.conversations.list({
  page: 1,
  limit: 10
});

console.log(`Total: ${total} conversations`);
data.forEach(conv => {
  console.log(`- ${conv.title} (${conv._id})`);
});
```

## [2.0.0] - 2024-XX-XX

### 🚨 Breaking Changes
- **BREAKING**: `CognipeerClientConfig` now requires `hookId` parameter
- **BREAKING**: Removed `peerId` from `CreateConversationOptions` - peerId is now automatically determined from the channel's hookId
- **BREAKING**: Removed `peers.list()` method - use `peers.get()` instead to get peer info for your channel

### Added
- ✨ New `hookId` parameter in client configuration for channel-based authentication
- 🆕 `peers.get()` method to retrieve peer information for the current API channel
- 🆕 `channels.get()` method to retrieve channel information (hookId, peerId, channelType, isActive, hookData with settings)
- 🆕 `users.get()` method to retrieve authenticated user information (email, workspace, roles, groups)
- 📦 New `Peer`, `Channel`, and `User` TypeScript interfaces
- 🔒 Enhanced security with hookId-based API channel validation
- 📝 Added `hookid-based.ts` example demonstrating the new architecture
- 🎯 Hook settings/data now returned in channel.get() response

### Changed
- 🔧 Client now sends hookId via `x-hook-id` header in all API requests
- 📚 Updated README and documentation to reflect hookId-based authentication
- 🏗️ Simplified conversation creation - no need to specify peerId anymore

### Migration Guide
```typescript
// Before (v1.x)
const client = new CognipeerClient({
  token: 'your-token'
});
const response = await client.conversations.create({
  peerId: 'peer-id',
  messages: [...]
});

// After (v2.0)
const client = new CognipeerClient({
  token: 'pat_your-personal-access-token',
  hookId: 'your-api-channel-hook-id'
});
const response = await client.conversations.create({
  messages: [...]  // peerId automatically determined from hookId
});
```

## [1.0.0] - 2024-01-XX

### Added
- Initial release of Cognipeer SDK
- Core `CognipeerClient` class with full API support
- Conversation management (create, send messages, list, get)
- Client-side tool execution with automatic handling
- Manual tool execution mode for fine-grained control
- Flow execution support
- Full TypeScript support with comprehensive type definitions
- Browser support (ESM, UMD)
- Node.js support (ESM, CommonJS)
- Automatic tool execution with configurable retry logic
- Structured JSON output with schema validation
- Multi-turn conversation support
- Additional context injection
- Complete documentation with VitePress
- Real-world examples for all features
- Error handling and timeout support

### Features
- 🔧 **Client Tools**: OpenAI-compatible function calling
- ⚡ **Auto-execution**: Automatic client tool execution
- 🌊 **Flows**: Execute complex workflows
- 📦 **Universal**: Works in Node.js, browsers, and edge runtimes
- 🎯 **Type-safe**: Full TypeScript support
- 🔒 **Secure**: Client-side execution keeps data secure

### Documentation
- Getting started guide
- Quick start tutorial
- Client tools deep dive
- Configuration reference
- API reference
- Browser integration guide
- Multiple real-world examples
- TypeScript usage guide

### Examples
- Simple conversation
- Multi-turn conversations
- Client tools with various integrations
- Structured output
- Browser-based chat widget
- React integration
- Vue integration
- Database integration
- API integration (Stripe, Google Calendar)
- File system operations
- Email sending

[1.0.0]: https://github.com/Cognipeer/client-sdk/releases/tag/v1.0.0
[1.0.5]: https://github.com/Cognipeer/client-sdk/releases/tag/v1.0.5
