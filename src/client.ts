import fetch from 'cross-fetch';
import type {
  CognipeerClientConfig,
  ExecutableClientTool,
  PendingAction,
  ToolResult,
  ClientTool,
  ApiError,
  ResumeMessageResponse,
} from './types';
import type { IConversations, IFlows, IPeers, IUsers, IChannels, IContacts } from './interfaces';
import { ConversationsResource, FlowsResource, PeersResource, UsersResource, ChannelsResource, ContactsResource } from './resources';

/**
 * Main Cognipeer SDK Client
 * 
 * @example
 * ```typescript
 * const client = new CognipeerClient({
 *   token: 'pat_your-personal-access-token',
 *   hookId: 'your-channel-hook-id',
 *   apiUrl: 'https://api.cognipeer.com/v1' // optional
 * });
 * 
 * // Access resources via properties
 * await client.conversations.create({ messages: [...] });
 * await client.conversations.list({ page: 1, limit: 10 });
 * await client.flows.execute({ flowId: 'flow-id', inputs: {...} });
 * await client.peers.get();
 * await client.users.get();
 * await client.channels.get();
 * ```
 */
export class CognipeerClient {
  private readonly apiUrl: string;
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly hookId: string;
  private readonly fetchImpl: typeof fetch;
  private readonly autoExecuteTools: boolean;
  private readonly maxToolExecutions: number;
  private readonly timeout: number;
  private readonly onToolStart?: (toolName: string, args: any) => void;
  private readonly onToolEnd?: (toolName: string, result: ToolResult) => void;

  // Resource interfaces
  public readonly conversations: IConversations;
  public readonly flows: IFlows;
  public readonly peers: IPeers;
  public readonly users: IUsers;
  public readonly channels: IChannels;
  public readonly contacts: IContacts;

  constructor(config: CognipeerClientConfig) {
    this.apiUrl = config.apiUrl || 'https://api.cognipeer.com/v1';
    this.baseUrl = config.baseUrl || 'https://app.cognipeer.com';
    this.token = config.token;
    this.hookId = config.hookId;
    // Bind fetch to window to preserve 'this' context in browser
    this.fetchImpl = config.fetch ? config.fetch.bind(globalThis) : fetch.bind(globalThis);
    this.autoExecuteTools = config.autoExecuteTools !== false;
    this.maxToolExecutions = config.maxToolExecutions || 10;
    this.timeout = config.timeout || 60000;
    this.onToolStart = config.onToolStart;
    this.onToolEnd = config.onToolEnd;

    if (!this.token) {
      throw new Error('Cognipeer API token is required');
    }

    if (!this.hookId) {
      throw new Error('Hook ID is required');
    }

    // Initialize resource interfaces
    this.conversations = new ConversationsResource(
      this.request.bind(this),
      this.toolToApiFormat.bind(this),
      this.handleToolExecution.bind(this),
      this.autoExecuteTools
    );

    this.flows = new FlowsResource(
      this.request.bind(this)
    );

    this.peers = new PeersResource(
      this.request.bind(this)
    );

    this.users = new UsersResource(
      this.request.bind(this)
    );

    this.channels = new ChannelsResource(
      this.request.bind(this)
    );

    this.contacts = new ContactsResource(
      this.request.bind(this)
    );
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
          'x-hook-id': this.hookId,
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

    if (this.onToolStart) {
      try {
        this.onToolStart(toolName, args);
      } catch (error) {
        console.error('Error in onToolStart callback:', error);
      }
    }

    try {
      const result = await tool.implementation(args);
      const toolResult: ToolResult = {
        executionId: '',
        success: true,
        output: typeof result === 'string' ? result : JSON.stringify(result),
      };

      if (this.onToolEnd) {
        try {
          this.onToolEnd(toolName, toolResult);
        } catch (error) {
          console.error('Error in onToolEnd callback:', error);
        }
      }

      return toolResult;
    } catch (error: any) {
      const toolResult: ToolResult = {
        executionId: '',
        success: false,
        output: '',
        error: error.message || 'Tool execution failed',
      };

      if (this.onToolEnd) {
        try {
          this.onToolEnd(toolName, toolResult);
        } catch (err) {
          console.error('Error in onToolEnd callback:', err);
        }
      }

      return toolResult;
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
      const resumeResponse = await this.conversations.resumeMessage({
        conversationId,
        messageId,
        toolResult,
      });

      // Check if there's another pending action (chaining multiple client tools)
      if (resumeResponse.status === 'client_tool_call' && resumeResponse.pendingAction) {
        currentPendingAction = resumeResponse.pendingAction;
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
}

export default CognipeerClient;
