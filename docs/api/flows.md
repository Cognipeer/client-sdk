# Flows API

The Flows API allows you to execute pre-built workflows and automations (Apps).

## execute()

Execute a flow/app with structured inputs.

**Signature:**
```typescript
client.flows.execute(options: ExecuteFlowOptions): Promise<ExecuteFlowResponse>
```

**Parameters:**

- `options.flowId` - The flow/app ID (required)
- `options.inputs` - Input data for the flow (required)
- `options.version` - Flow version to execute (optional, default: `'latest'`)

**Returns:**

```typescript
{
  success: boolean;
  outputs: Record<string, any>;
  error?: string;
}
```

**Example:**

```typescript
// Execute an invoice analysis flow
const result = await client.flows.execute({
  flowId: 'invoice-analyzer',
  inputs: {
    document: 'base64-encoded-pdf-content',
    analysisType: 'detailed',
    extractTables: true
  }
});

if (result.success) {
  console.log('Invoice data:', result.outputs.invoiceData);
  console.log('Analysis:', result.outputs.analysis);
} else {
  console.error('Flow error:', result.error);
}
```

## Common Use Cases

### Document Processing

```typescript
const result = await client.flows.execute({
  flowId: 'document-processor',
  inputs: {
    document: base64Content,
    outputFormat: 'json'
  }
});
```

### Data Extraction

```typescript
const result = await client.flows.execute({
  flowId: 'data-extractor',
  inputs: {
    text: documentText,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        date: { type: 'string' },
        amount: { type: 'number' }
      }
    }
  }
});
```

### Content Analysis

```typescript
const result = await client.flows.execute({
  flowId: 'content-analyzer',
  inputs: {
    content: articleText,
    analysisType: 'sentiment',
    language: 'en'
  }
});
```

## Error Handling

```typescript
try {
  const result = await client.flows.execute({
    flowId: 'my-flow',
    inputs: { data: 'value' }
  });
  
  if (!result.success) {
    console.error('Flow execution failed:', result.error);
    return;
  }
  
  console.log('Results:', result.outputs);
} catch (error) {
  console.error('API error:', error.message);
}
```

## Types

### ExecuteFlowOptions

```typescript
interface ExecuteFlowOptions {
  flowId: string;
  inputs: Record<string, any>;
  version?: string;
}
```

### ExecuteFlowResponse

```typescript
interface ExecuteFlowResponse {
  success: boolean;
  outputs: Record<string, any>;
  error?: string;
}
```

## Flow Discovery

To find available flows:

1. Log in to your Cognipeer workspace
2. Navigate to **Gallery** → **Apps**
3. Browse or install flows
4. Get the flow ID from the app details

## Creating Custom Flows

Flows can be created in the Cognipeer platform:

1. Go to **Apps** → **Create App**
2. Define your workflow steps
3. Configure inputs and outputs
4. Test and publish
5. Use the flow ID to execute via SDK

## Version Management

```typescript
// Use latest version (default)
await client.flows.execute({
  flowId: 'my-flow',
  inputs: { ... }
});

// Use specific version
await client.flows.execute({
  flowId: 'my-flow',
  inputs: { ... },
  version: 'v1.2.0'
});
```

## Best Practices

1. **Validate Inputs**: Ensure required inputs are provided
2. **Handle Errors**: Check `success` field before using outputs
3. **Version Pinning**: Use specific versions in production
4. **Test Flows**: Test flows thoroughly before production use
5. **Monitor Execution**: Log flow executions for debugging
