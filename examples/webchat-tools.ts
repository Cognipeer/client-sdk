/**
 * Example: Webchat with Client-Side Tool Execution
 * 
 * This example shows how to handle tool calls from the AI
 * and execute functions on the client side.
 */

import { CognipeerWebchat } from '@cognipeer/sdk';

// Create webchat with tool execution capability
const webchat = new CognipeerWebchat({
  hookId: 'your-hook-id',
  containerId: 'chat-container'
});

// Listen for tool calls from the AI
webchat.on('tool-call', async (event) => {
  const { executionId, toolName, args, conversationId, messageId } = event.data;
  
  console.log(`AI requested tool: ${toolName}`, args);
  
  try {
    let result: any;
    
    // Execute the requested tool based on tool name
    switch (toolName) {
      case 'getCurrentUser':
        result = await getCurrentUser();
        break;
        
      case 'getOrderStatus':
        result = await getOrderStatus(args.orderId);
        break;
        
      case 'searchProducts':
        result = await searchProducts(args.query, args.category);
        break;
        
      case 'submitFeedback':
        result = await submitFeedback(args.rating, args.comment);
        break;
        
      case 'getAccountBalance':
        result = await getAccountBalance(args.accountId);
        break;
        
      case 'scheduleAppointment':
        result = await scheduleAppointment(args.date, args.time);
        break;
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
    
    // Send successful result back to webchat
    webchat.sendToolResult({
      executionId,
      success: true,
      output: JSON.stringify(result)
    });
    
    console.log(`Tool ${toolName} executed successfully:`, result);
  } catch (error: any) {
    // Send error back to webchat
    webchat.sendToolResult({
      executionId,
      success: false,
      output: '',
      error: error.message || 'Tool execution failed'
    });
    
    console.error(`Tool ${toolName} execution failed:`, error);
  }
});

webchat.mount();

// Example tool implementations

async function getCurrentUser() {
  // Fetch current user from your API or state
  const response = await fetch('/api/user/current');
  return await response.json();
}

async function getOrderStatus(orderId: string) {
  const response = await fetch(`/api/orders/${orderId}`);
  const order = await response.json();
  return {
    orderId: order.id,
    status: order.status,
    tracking: order.tracking,
    estimatedDelivery: order.estimatedDelivery
  };
}

async function searchProducts(query: string, category?: string) {
  const params = new URLSearchParams({ q: query });
  if (category) params.append('category', category);
  
  const response = await fetch(`/api/products/search?${params}`);
  const products = await response.json();
  return products;
}

async function submitFeedback(rating: number, comment: string) {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, comment })
  });
  return await response.json();
}

async function getAccountBalance(accountId: string) {
  const response = await fetch(`/api/accounts/${accountId}/balance`);
  const data = await response.json();
  return {
    accountId,
    balance: data.balance,
    currency: data.currency
  };
}

async function scheduleAppointment(date: string, time: string) {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, time })
  });
  return await response.json();
}

// Alternative: Dynamic tool registry
const toolRegistry: Record<string, (...args: any[]) => Promise<any>> = {
  getCurrentUser,
  getOrderStatus,
  searchProducts,
  submitFeedback,
  getAccountBalance,
  scheduleAppointment
};

// Simplified tool execution using registry
const webchatWithRegistry = new CognipeerWebchat({
  hookId: 'your-hook-id',
  containerId: 'chat-container-2'
});

webchatWithRegistry.on('tool-call', async (event) => {
  const { executionId, toolName, args } = event.data;
  
  const tool = toolRegistry[toolName];
  
  if (!tool) {
    webchatWithRegistry.sendToolResult({
      executionId,
      success: false,
      output: '',
      error: `Tool '${toolName}' not found`
    });
    return;
  }
  
  try {
    const result = await tool(args);
    webchatWithRegistry.sendToolResult({
      executionId,
      success: true,
      output: JSON.stringify(result)
    });
  } catch (error: any) {
    webchatWithRegistry.sendToolResult({
      executionId,
      success: false,
      output: '',
      error: error.message
    });
  }
});

webchatWithRegistry.mount();
