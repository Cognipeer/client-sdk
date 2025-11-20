import type {
  CreateConversationOptions,
  CreateConversationResponse,
  SendMessageOptions,
  SendMessageResponse,
  ResumeMessageResponse,
  ListConversationsOptions,
  ListConversationsResponse,
  GetMessagesOptions,
  ConversationMessage,
  Conversation,
  ExecutableClientTool,
  PendingAction,
  ToolResult,
  ClientTool,
} from '../types';
import type { IConversations } from '../interfaces';

/**
 * Conversations resource implementation
 */
export class ConversationsResource implements IConversations {
  constructor(
    private request: <T>(endpoint: string, options?: RequestInit) => Promise<T>,
    private toolToApiFormat: (tool: ExecutableClientTool) => ClientTool,
    private handleToolExecution: (
      conversationId: string,
      messageId: string,
      pendingAction: PendingAction,
      clientTools: ExecutableClientTool[]
    ) => Promise<ResumeMessageResponse>,
    private autoExecuteTools: boolean
  ) {}

  async create(options: CreateConversationOptions): Promise<CreateConversationResponse> {
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

  async sendMessage(options: SendMessageOptions): Promise<SendMessageResponse> {
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

  async list(options: ListConversationsOptions = {}): Promise<ListConversationsResponse> {
    return this.request<ListConversationsResponse>(
      '/sdk/conversation/list',
      {
        method: 'POST',
        body: JSON.stringify(options),
      }
    );
  }

  async get(conversationId: string): Promise<Conversation> {
    return this.request<Conversation>(
      `/sdk/conversation/${conversationId}`,
      {
        method: 'GET',
      }
    );
  }

  async messages(options: GetMessagesOptions): Promise<ConversationMessage[]> {
    const { conversationId, messagesCount = 10 } = options;
    
    return this.request<ConversationMessage[]>(
      `/sdk/conversation/${conversationId}/message?messagesCount=${messagesCount}`,
      {
        method: 'GET',
      }
    );
  }
}
