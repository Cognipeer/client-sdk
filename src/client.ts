import fetch from 'cross-fetch';
import type {
  CognipeerClientConfig,
  CreateConversationOptions,
  CreateConversationResponse,
  SendMessageOptions,
  SendMessageResponse,
  ResumeMessageResponse,
  ListConversationsOptions,
  ListConversationsResponse,
  GetMessagesOptions,
  ConversationMessage,
  ExecuteFlowOptions,
  ExecuteFlowResponse,
  Conversation,
  ExecutableClientTool,
  PendingAction,
  ToolResult,
  ClientTool,
  ApiError,
} from './types';

/**
 * Main Cognipeer SDK Client
 * 
 * @example
 * ```typescript
 * const client = new CognipeerClient({
 *   token: 'your-api-token',
 *   apiUrl: 'https://api.cognipeer.com' // optional
 * });
 * ```
 */
export class CognipeerClient {
  private readonly apiUrl: string;
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly fetchImpl: typeof fetch;
  private readonly autoExecuteTools: boolean;
  private readonly maxToolExecutions: number;
  private readonly timeout: number;

  constructor(config: CognipeerClientConfig) {
    this.apiUrl = config.apiUrl || 'https://api.cognipeer.com/v1';
    this.baseUrl = config.baseUrl || 'https://app.cognipeer.com';
    this.token = config.token;
    // Bind fetch to window to preserve 'this' context in browser
    this.fetchImpl = config.fetch ? config.fetch.bind(globalThis) : fetch.bind(globalThis);
    this.autoExecuteTools = config.autoExecuteTools !== false;
    this.maxToolExecutions = config.maxToolExecutions || 10;
    this.timeout = config.timeout || 60000;

    if (!this.token) {
      throw new Error('Cognipeer API token is required');
    }
  }

  /**
   * Make an HTTP request to the API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await this.fetchImpl(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          message: response.statusText || 'Unknown error',
          statusCode: response.status,
        }));
        
        throw new Error(error.message || `API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Convert ExecutableClientTool to API format
   */
  private toolToApiFormat(tool: ExecutableClientTool): ClientTool {
    return {
      type: 'function',
      function: {
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters,
      },
    };
  }

  /**
   * Execute a client tool locally
   */
  private async executeClientTool(
    toolName: string,
    args: Record<string, any>,
    clientTools: ExecutableClientTool[]
  ): Promise<ToolResult> {
    const tool = clientTools.find(t => t.function.name === toolName);
    
    if (!tool) {
      return {
        executionId: '',
        success: false,
        output: '',
        error: `Tool '${toolName}' not found in client tools`,
      };
    }

    try {
      const result = await tool.implementation(args);
      return {
        executionId: '',
        success: true,
        output: typeof result === 'string' ? result : JSON.stringify(result),
      };
    } catch (error: any) {
      return {
        executionId: '',
        success: false,
        output: '',
        error: error.message || 'Tool execution failed',
      };
    }
  }

  /**
   * Handle automatic tool execution loop
   */
  private async handleToolExecution(
    conversationId: string,
    messageId: string,
    pendingAction: PendingAction,
    clientTools: ExecutableClientTool[]
  ): Promise<ResumeMessageResponse> {
    let currentPendingAction = pendingAction;
    let executionCount = 0;

    while (currentPendingAction && executionCount < this.maxToolExecutions) {
      executionCount++;

      // Execute the tool locally
      const toolResult = await this.executeClientTool(
        currentPendingAction.toolName,
        currentPendingAction.args,
        clientTools
      );

      // Set the correct execution ID
      toolResult.executionId = currentPendingAction.executionId;

      // Resume the message with the tool result
      const resumeResponse = await this.resumeMessage({
        conversationId,
        messageId,
        toolResult,
      });

      // Check if there's another pending action
      if (resumeResponse.status === 'client_tool_call' && (resumeResponse as any).pendingAction) {
        currentPendingAction = (resumeResponse as any).pendingAction;
      } else {
        // No more pending actions, return the final response
        return resumeResponse;
      }
    }

    if (executionCount >= this.maxToolExecutions) {
      throw new Error(`Maximum tool executions (${this.maxToolExecutions}) exceeded`);
    }

    // This should not be reached, but TypeScript requires a return
    throw new Error('Unexpected state in tool execution loop');
  }

  /**
   * Create a new conversation
   * 
   * @example
   * ```typescript
   * // Simple conversation creation
   * const { conversationId } = await client.conversations.create({
   *   peerId: 'peer-id'
   * });
   * 
   * // With initial message and client tools
   * const response = await client.conversations.create({
   *   peerId: 'peer-id',
   *   messages: [{ role: 'user', content: 'Hello!' }],
   *   clientTools: [{
   *     type: 'function',
   *     function: {
   *       name: 'getCurrentWeather',
   *       description: 'Get current weather',
   *       parameters: {
   *         type: 'object',
   *         properties: {
   *           location: { type: 'string' }
   *         },
   *         required: ['location']
   *       }
   *     },
   *     implementation: async ({ location }) => {
   *       return `Weather in ${location}: Sunny, 72°F`;
   *     }
   *   }]
   * });
   * ```
   */
  async createConversation(
    options: CreateConversationOptions
  ): Promise<CreateConversationResponse> {
    const { clientTools, ...apiOptions } = options;
    
    const requestBody: any = {
      ...apiOptions,
      clientTools: clientTools?.map(t => this.toolToApiFormat(t)),
    };

    const response = await this.request<CreateConversationResponse>(
      '/sdk/conversation',
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    // Handle automatic tool execution if enabled
    if (
      this.autoExecuteTools &&
      response.status === 'client_tool_call' &&
      response.pendingAction &&
      response.messageId &&
      clientTools
    ) {
      const finalResponse = await this.handleToolExecution(
        response.conversationId,
        response.messageId,
        response.pendingAction,
        clientTools
      );

      return {
        ...response,
        content: finalResponse.content,
        tools: finalResponse.tools,
        status: finalResponse.status,
        pendingAction: undefined,
      };
    }

    return response;
  }

  /**
   * Send a message to an existing conversation
   * 
   * @example
   * ```typescript
   * const response = await client.conversations.sendMessage({
   *   conversationId: 'conv-id',
   *   content: 'Tell me more',
   *   clientTools: [...]
   * });
   * ```
   */
  async sendMessage(
    options: SendMessageOptions
  ): Promise<SendMessageResponse> {
    const { conversationId, clientTools, ...apiOptions } = options;
    
    const requestBody: any = {
      ...apiOptions,
      clientTools: clientTools?.map(t => this.toolToApiFormat(t)),
    };

    const response = await this.request<SendMessageResponse>(
      `/sdk/conversation/${conversationId}/message`,
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    );

    // Handle automatic tool execution if enabled
    if (
      this.autoExecuteTools &&
      response.status === 'client_tool_call' &&
      response.pendingAction &&
      clientTools
    ) {
      const finalResponse = await this.handleToolExecution(
        response.conversationId,
        response.messageId,
        response.pendingAction,
        clientTools
      );

      return {
        ...response,
        content: finalResponse.content,
        tools: finalResponse.tools,
        status: finalResponse.status,
        pendingAction: undefined,
      };
    }

    return response;
  }

  /**
   * Resume a message with a client tool result
   * 
   * This is typically used when autoExecuteTools is disabled or for manual control.
   * 
   * @example
   * ```typescript
   * const response = await client.conversations.resumeMessage({
   *   conversationId: 'conv-id',
   *   messageId: 'msg-id',
   *   toolResult: {
   *     executionId: 'exec-id',
   *     success: true,
   *     output: 'Tool result'
   *   }
   * });
   * ```
   */
  async resumeMessage(options: {
    conversationId: string;
    messageId: string;
    toolResult: ToolResult;
  }): Promise<ResumeMessageResponse> {
    const { conversationId, messageId, toolResult } = options;

    return this.request<ResumeMessageResponse>(
      `/sdk/conversation/${conversationId}/message/${messageId}/resume`,
      {
        method: 'POST',
        body: JSON.stringify({ toolResult }),
      }
    );
  }

  /**
   * List conversations
   * 
   * @example
   * ```typescript
   * const { data, total } = await client.conversations.list({
   *   filter: { peerId: 'peer-id' },
   *   page: 1,
   *   limit: 10
   * });
   * ```
   */
  async listConversations(
    options: ListConversationsOptions = {}
  ): Promise<ListConversationsResponse> {
    return this.request<ListConversationsResponse>(
      '/sdk/conversation/list',
      {
        method: 'POST',
        body: JSON.stringify(options),
      }
    );
  }

  /**
   * Get a single conversation by ID
   * 
   * @example
   * ```typescript
   * const conversation = await client.conversations.get('conv-id');
   * ```
   */
  async getConversation(conversationId: string): Promise<Conversation> {
    return this.request<Conversation>(
      `/sdk/conversation/${conversationId}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * Get messages from a conversation
   * 
   * @example
   * ```typescript
   * const messages = await client.conversations.getMessages({
   *   conversationId: 'conv-id',
   *   messagesCount: 20
   * });
   * ```
   */
  async getMessages(
    options: GetMessagesOptions
  ): Promise<ConversationMessage[]> {
    const { conversationId, messagesCount = 10 } = options;
    
    return this.request<ConversationMessage[]>(
      `/sdk/conversation/${conversationId}/message?messagesCount=${messagesCount}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * Execute a flow (app)
   * 
   * @example
   * ```typescript
   * const result = await client.flows.execute({
   *   flowId: 'flow-id',
   *   inputs: {
   *     document: 'base64-content',
   *     analysisType: 'detailed'
   *   }
   * });
   * ```
   */
  async executeFlow(
    options: ExecuteFlowOptions
  ): Promise<ExecuteFlowResponse> {
    const { flowId, inputs, version = 'latest' } = options;

    return this.request<ExecuteFlowResponse>(
      `/sdk/flow/${flowId}/execute?version=${version}`,
      {
        method: 'POST',
        body: JSON.stringify(inputs),
      }
    );
  }

  /**
   * Convenience methods grouped by resource
   */
  get conversations() {
    return {
      create: this.createConversation.bind(this),
      sendMessage: this.sendMessage.bind(this),
      resumeMessage: this.resumeMessage.bind(this),
      list: this.listConversations.bind(this),
      get: this.getConversation.bind(this),
      getMessages: this.getMessages.bind(this),
    };
  }

  get flows() {
    return {
      execute: this.executeFlow.bind(this),
    };
  }

  /**
   * List all available peers (AI assistants)
   * 
   * @example
   * ```typescript
   * const peers = await client.peers.list();
   * console.log(peers);
   * ```
   */
  async listPeers(): Promise<any[]> {
    return this.request<any[]>('/sdk/peer');
  }

  get peers() {
    return {
      list: this.listPeers.bind(this),
    };
  }
}

export default CognipeerClient;
