/**
 * OpenAI-compatible tool definition for client-side function calling
 */
export interface ClientTool {
  /**
   * Type of the tool (must be 'function')
   */
  type: 'function';
  
  /**
   * Function definition
   */
  function: {
    /**
     * Name of the function
     */
    name: string;
    
    /**
     * Description of what the function does
     */
    description?: string;
    
    /**
     * JSON Schema describing the function parameters
     */
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

/**
 * Client tool with executable implementation
 */
export interface ExecutableClientTool extends ClientTool {
  /**
   * The actual function implementation
   */
  implementation: (...args: any[]) => Promise<any> | any;
}

/**
 * Pending action when AI requests a client tool execution
 */
export interface PendingAction {
  /**
   * Unique execution ID for this tool call
   */
  executionId: string;
  
  /**
   * Name of the tool to execute
   */
  toolName: string;
  
  /**
   * Arguments to pass to the tool
   */
  args: Record<string, any>;
  
  /**
   * Timestamp of when the action was requested
   */
  timestamp?: string;
}

/**
 * Result of a client tool execution
 */
export interface ToolResult {
  /**
   * Execution ID matching the pending action
   */
  executionId: string;
  
  /**
   * Whether the execution was successful
   */
  success: boolean;
  
  /**
   * Output from the tool (must be string)
   */
  output: string;
  
  /**
   * Error message if execution failed
   */
  error?: string;
}

/**
 * Tool log entry returned by the API
 */
export interface ToolLog {
  name: string;
  input: any;
  output: any;
  status?: string;
  error?: string;
}

/**
 * Message role type
 */
export type MessageRole = 'user' | 'ai';

/**
 * Message in a conversation
 */
export interface Message {
  /**
   * Role of the message sender
   */
  role: MessageRole;
  
  /**
   * Content of the message
   */
  content: string;
}

/**
 * Response format options
 */
export type ResponseFormat = 'text' | 'json';

/**
 * Configuration options for the Cognipeer client
 */
export interface CognipeerClientConfig {
  /**
   * API base URL for SDK endpoints
   * @default 'https://api.cognipeer.com'
   */
  apiUrl?: string;
  
  /**
   * Base URL for webchat web application
   * Used for iframe, widget, and URL generation
   * @default 'https://app.cognipeer.com'
   */
  baseUrl?: string;
  
  /**
   * API authentication token
   */
  token: string;
  
  /**
   * Custom fetch implementation (useful for Node.js < 18)
   */
  fetch?: typeof fetch;
  
  /**
   * Whether to automatically execute client tools
   * @default true
   */
  autoExecuteTools?: boolean;
  
  /**
   * Maximum number of automatic tool executions per request
   * @default 10
   */
  maxToolExecutions?: number;
  
  /**
   * Request timeout in milliseconds
   * @default 60000
   */
  timeout?: number;
}

/**
 * Options for creating a conversation
 */
export interface CreateConversationOptions {
  /**
   * ID of the peer (AI agent) to use
   */
  peerId: string;
  
  /**
   * Optional user ID to associate with the conversation
   */
  userId?: string;
  
  /**
   * Optional contact ID to associate with the conversation
   */
  contactId?: string;
  
  /**
   * Optional initial messages to include in the conversation
   */
  messages?: Message[];
  
  /**
   * Client-side tools available for the AI to call
   */
  clientTools?: ExecutableClientTool[];
  
  /**
   * Response format (text or json)
   * @default 'text'
   */
  response_format?: ResponseFormat;
  
  /**
   * JSON schema for structured output (when response_format is 'json')
   */
  response_schema?: Record<string, any>;
  
  /**
   * Additional context to include in the request
   */
  additionalContext?: string;
  
  /**
   * Version of the peer to use
   * @default 'latest'
   */
  version?: string;
}

/**
 * Response from creating a conversation
 */
export interface CreateConversationResponse {
  /**
   * ID of the created conversation
   */
  conversationId: string;
  
  /**
   * ID of the peer used
   */
  peerId: string;
  
  /**
   * Optional user ID
   */
  userId?: string;
  
  /**
   * Optional contact ID
   */
  contactId?: string;
  
  /**
   * Whether the conversation was just created
   */
  created: boolean;
  
  /**
   * Content of the AI response (if messages were provided)
   */
  content?: string;
  
  /**
   * Structured output (if response_format is 'json')
   */
  output?: any;
  
  /**
   * Tools used during the conversation
   */
  tools?: ToolLog[];
  
  /**
   * ID of the last message
   */
  messageId?: string;
  
  /**
   * Status of the message
   */
  status?: string;
  
  /**
   * Pending action if waiting for client tool execution
   */
  pendingAction?: PendingAction;
}

/**
 * Options for sending a message to a conversation
 */
export interface SendMessageOptions {
  /**
   * ID of the conversation
   */
  conversationId: string;
  
  /**
   * Content of the message
   */
  content: string;
  
  /**
   * Client-side tools available for the AI to call
   */
  clientTools?: ExecutableClientTool[];
  
  /**
   * Response format (text or json)
   * @default 'text'
   */
  response_format?: ResponseFormat;
  
  /**
   * JSON schema for structured output (when response_format is 'json')
   */
  response_schema?: Record<string, any>;
  
  /**
   * Additional context to include in the request
   */
  additionalContext?: string;
  
  /**
   * Version of the peer to use
   * @default 'latest'
   */
  version?: string;
}

/**
 * Response from sending a message
 */
export interface SendMessageResponse {
  /**
   * ID of the conversation
   */
  conversationId: string;
  
  /**
   * Content of the AI response
   */
  content?: string;
  
  /**
   * Structured output (if response_format is 'json')
   */
  output?: any;
  
  /**
   * Tools used during the conversation
   */
  tools?: ToolLog[];
  
  /**
   * ID of the message
   */
  messageId: string;
  
  /**
   * Status of the message
   */
  status: string;
  
  /**
   * Pending action if waiting for client tool execution
   */
  pendingAction?: PendingAction;
}

/**
 * Response from resuming a message with tool result
 */
export interface ResumeMessageResponse {
  /**
   * ID of the conversation
   */
  conversationId: string;
  
  /**
   * Content of the AI response
   */
  content: string;
  
  /**
   * Tools used during the conversation
   */
  tools?: ToolLog[];
  
  /**
   * ID of the message
   */
  messageId: string;
  
  /**
   * Status of the message
   */
  status: string;
}

/**
 * Conversation object
 */
export interface Conversation {
  /**
   * Conversation ID
   */
  _id: string;
  
  /**
   * Peer ID
   */
  peerId: string;
  
  /**
   * User ID
   */
  userId?: string;
  
  /**
   * Contact ID
   */
  contactId?: string;
  
  /**
   * Source of the conversation
   */
  source: string;
  
  /**
   * Creation timestamp
   */
  createdAt: string;
  
  /**
   * Update timestamp
   */
  updatedAt: string;
  
  /**
   * Populated peer object
   */
  peer?: any;
}

/**
 * Options for listing conversations
 */
export interface ListConversationsOptions {
  /**
   * Filter criteria
   */
  filter?: Record<string, any>;
  
  /**
   * Page number (1-indexed)
   * @default 1
   */
  page?: number;
  
  /**
   * Number of items per page
   * @default 10
   */
  limit?: number;
  
  /**
   * Sort criteria
   */
  sort?: Record<string, 1 | -1>;
}

/**
 * Response from listing conversations
 */
export interface ListConversationsResponse {
  /**
   * List of conversations
   */
  data: Conversation[];
  
  /**
   * Total number of conversations
   */
  total: number;
  
  /**
   * Current page
   */
  page: number;
  
  /**
   * Items per page
   */
  limit: number;
}

/**
 * Options for getting conversation messages
 */
export interface GetMessagesOptions {
  /**
   * ID of the conversation
   */
  conversationId: string;
  
  /**
   * Number of messages to retrieve
   * @default 10
   */
  messagesCount?: number;
}

/**
 * Message object from API
 */
export interface ConversationMessage {
  /**
   * Message ID
   */
  _id: string;
  
  /**
   * Conversation ID
   */
  conversationId: string;
  
  /**
   * Message type
   */
  type: 'user' | 'ai';
  
  /**
   * Message content
   */
  content: string;
  
  /**
   * Message status
   */
  status?: string;
  
  /**
   * Creation timestamp
   */
  createdAt: string;
  
  /**
   * Tool logs
   */
  toolLogs?: ToolLog[];
}

/**
 * Options for executing a flow
 */
export interface ExecuteFlowOptions {
  /**
   * ID of the flow to execute
   */
  flowId: string;
  
  /**
   * Input data for the flow
   */
  inputs: Record<string, any>;
  
  /**
   * Version of the flow to use
   * @default 'latest'
   */
  version?: string;
}

/**
 * Response from executing a flow
 */
export interface ExecuteFlowResponse {
  /**
   * Whether the flow execution was successful
   */
  success: boolean;
  
  /**
   * Outputs from the flow
   */
  outputs?: Record<string, any>;
  
  /**
   * Error message if execution failed
   */
  error?: string;
  
  /**
   * Additional data returned by the flow
   */
  [key: string]: any;
}

/**
 * API Error response
 */
export interface ApiError {
  /**
   * Error message
   */
  message: string;
  
  /**
   * HTTP status code
   */
  statusCode: number;
  
  /**
   * Additional error details
   */
  details?: any;
}
