# Real-World Use Cases

Ideas for applying Cognipeer SDK across products.

## 1. Customer Support Copilot

```typescript
const response = await client.conversations.create({
  peerId: 'support-peer',
  messages: [{ role: 'user', content: ticket.summary }],
  clientTools: [lookupCustomerTool, createZendeskTicketTool]
});
```

- Pull CRM data with client tools
- Draft replies and push them into your help desk
- Keep sensitive credentials inside your infrastructure

## 2. RevOps Briefings

```typescript
const summary = await client.conversations.create({
  peerId: 'revops-peer',
  messages: [{ role: 'user', content: 'Summarize this week\'s pipeline health.' }],
  clientTools: [salesforceQueryTool]
});
```

Return JSON via structured outputs, feed dashboards, or trigger alerts.

## 3. Internal Knowledge Search

```typescript
const searchResult = await client.conversations.create({
  peerId: 'knowledge-peer',
  messages: [{ role: 'user', content: 'How do I rotate API keys?' }],
  clientTools: [notionSearchTool, confluenceLookupTool]
});
```

Chain multiple tools so the AI fetches the most relevant doc automatically.

## 4. Workflow Automation

```typescript
await client.flows.execute({
  flowId: 'flow-onboarding',
  inputs: {
    email: user.email,
    plan: selectedPlan
  }
});
```

Flows complement conversations when you need deterministic pipelines or integrations that should not run inline with the chat response.

## 5. Embedded Webchat

Combine `CognipeerWebchat` with client tools for on-site assistants that can:
- Inspect the DOM
- Read analytics context
- Trigger front-end UI changes

See [Webchat Client Tools](/examples/webchat-client-tools).

## Additional Resources

- [Structured Output](/examples/structured-output)
- [Browser Example](/examples/browser)
- [Guide: Client Tools](/guide/client-tools)
