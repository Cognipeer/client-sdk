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
  ToolResult,
} from '../types';

/**
 * Conversations resource interface
 */
export interface IConversations {
  /**
   * Create a new conversation
   * 
   * @example
   * ```typescript
   * const response = await client.conversation.create({
   *   messages: [{ role: 'user', content: 'Hello!' }]
   * });
   * ```
   */
  create(options: CreateConversationOptions): Promise<CreateConversationResponse>;

  /**
   * Send a message to an existing conversation
   * 
   * @example
   * ```typescript
   * const response = await client.conversation.sendMessage({
   *   conversationId: 'conv-id',
   *   content: 'Follow-up message'
   * });
   * ```
   */
  sendMessage(options: SendMessageOptions): Promise<SendMessageResponse>;

  /**
   * Resume message execution with tool result
   * 
   * @example
   * ```typescript
   * const response = await client.conversation.resumeMessage({
   *   conversationId: 'conv-id',
   *   messageId: 'msg-id',
   *   toolResult: { executionId: 'exec-id', success: true, output: 'result' }
   * });
   * ```
   */
  resumeMessage(options: {
    conversationId: string;
    messageId: string;
    toolResult: ToolResult;
  }): Promise<ResumeMessageResponse>;

  /**
   * List conversations with pagination
   * 
   * @example
   * ```typescript
   * const { data, total } = await client.conversation.list({
   *   page: 1,
   *   limit: 10
   * });
   * ```
   */
  list(options?: ListConversationsOptions): Promise<ListConversationsResponse>;

  /**
   * Get a single conversation by ID
   * 
   * @example
   * ```typescript
   * const conversation = await client.conversation.get('conv-id');
   * ```
   */
  get(conversationId: string): Promise<Conversation>;

  /**
   * Get messages from a conversation
   * 
   * @example
   * ```typescript
   * const messages = await client.conversation.messages({
   *   conversationId: 'conv-id',
   *   messagesCount: 20
   * });
   * ```
   */
  messages(options: GetMessagesOptions): Promise<ConversationMessage[]>;
}
