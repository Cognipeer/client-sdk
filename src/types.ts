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
   * @default 'https://api.cognipeer.com/v1'
   */
  apiUrl?: string;
  
  /**
   * Base URL for webchat web application
   * Used for iframe, widget, and URL generation
   * @default 'https://app.cognipeer.com'
   */
  baseUrl?: string;
  
  /**
   * API authentication token (Personal Access Token with pat_ prefix)
   */
  token: string;
  
  /**
   * Hook ID for the API channel
   * Used to identify which peer/channel to use for conversations
   */
  hookId: string;
  
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

  /**
   * Callback when a client tool execution starts
   */
  onToolStart?: (toolName: string, args: any) => void;

  /**
   * Callback when a client tool execution ends
   */
  onToolEnd?: (toolName: string, result: ToolResult) => void;
}

/**
 * Options for creating a conversation
 */
export interface CreateConversationOptions {
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
   * Optional contact ID to associate with the message
   * Only used with API tokens (not PAT tokens)
   */
  contactId?: string;
  
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
   * Conversation title
   */
  title?: string;
  
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
   * Optional contact ID to filter conversations (required when using API token)
   * Not used with PAT tokens - PAT automatically filters by user
   */
  contactId?: string;
  
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

/**
 * Peer information
 */
export interface Peer {
  /**
   * Peer ID
   */
  _id: string;
  
  /**
   * Peer name
   */
  name: string;
  
  /**
   * Peer description
   */
  description?: string;
  
  /**
   * AI model ID
   */
  modelId: string;
  
  /**
   * System prompt
   */
  prompt: string;
  
  /**
   * Temperature setting (0-1)
   */
  temperature?: number;
  
  /**
   * Number of messages to include in history
   */
  messagesCount?: number;
  
  /**
   * Language setting
   */
  language?: string;
  
  /**
   * Content type
   */
  contentType?: string;
  
  /**
   * Datasource IDs
   */
  datasources?: string[];
  
  /**
   * Tool IDs
   */
  tools?: string[];
  
  /**
   * Creation timestamp
   */
  createdAt?: string;
  
  /**
   * Update timestamp
   */
  updatedAt?: string;
  
  /**
   * Additional properties
   */
  [key: string]: any;
}

/**
 * User information
 */
export interface User {
  /**
   * User ID
   */
  _id: string;
  
  /**
   * User email
   */
  email: string;
  
  /**
   * First name
   */
  firstName: string;
  
  /**
   * Last name
   */
  lastName: string;
  
  /**
   * Display name
   */
  displayName: string;
  
  /**
   * Workspace information
   */
  workspace: {
    /**
     * Workspace ID
     */
    _id: string;
    
    /**
     * Workspace name
     */
    name: string;
    
    /**
     * Workspace slug
     */
    slug: string;
    
    /**
     * Workspace plan
     */
    plan: string;
  };
  
  /**
   * User roles
   */
  roles: string[];
  
  /**
   * User groups
   */
  groups: string[];
  
  /**
   * Creation timestamp
   */
  createdAt: string;
  
  /**
   * User settings
   */
  settings: Record<string, any>;
}

/**
 * Channel information
 */
export interface Channel {
  /**
   * Channel ID
   */
  _id: string;
  
  /**
   * Channel name
   */
  name: string;
  
  /**
   * Hook ID
   */
  hookId: string;
  
  /**
   * Associated peer ID
   */
  peerId: string;
  
  /**
   * Channel type
   */
  channelType: string;
  
  /**
   * Gallery key
   */
  galleryKey: string;
  
  /**
   * Whether channel is active
   */
  isActive: boolean;
  
  /**
   * Custom prompt for this channel
   */
  prompt?: string;
  
  /**
   * Message history limit for this channel
   */
  messagesCount?: number;
  
  /**
   * Creation timestamp
   */
  createdAt: string;
  
  /**
   * Update timestamp
   */
  updatedAt: string;
  
  /**
   * Additional properties
   */
  [key: string]: any;
}

/**
 * Contact information
 */
export interface Contact {
  /**
   * Contact ID
   */
  _id: string;
  
  /**
   * Contact email address
   */
  email?: string;
  
  /**
   * Integration ID (external system identifier)
   */
  integrationId?: string;
  
  /**
   * Contact name
   */
  name?: string;
  
  /**
   * Contact phone number
   */
  phone?: string;
  
  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
  
  /**
   * Custom properties
   */
  properties?: Record<string, any>;
  
  /**
   * Workspace ID
   */
  workspaceId: string;
  
  /**
   * Associated peer ID
   */
  peerId?: string;
  
  /**
   * Contact tags
   */
  tags?: string[];
  
  /**
   * Contact status
   */
  status?: string;
  
  /**
   * Creation timestamp
   */
  createdDate?: string;
  
  /**
   * Last update timestamp
   */
  modifiedDate?: string;
  
  /**
   * Whether contact is deleted (soft delete)
   */
  deleted?: boolean;
  
  /**
   * Additional properties
   */
  [key: string]: any;
}

/**
 * Options for creating a contact
 */
export interface CreateContactOptions {
  /**
   * Contact email address
   */
  email?: string;
  
  /**
   * Integration ID (external system identifier)
   */
  integrationId?: string;
  
  /**
   * Contact name
   */
  name?: string;
  
  /**
   * Contact phone number
   */
  phone?: string;
  
  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
  
  /**
   * Custom properties
   */
  properties?: Record<string, any>;
  
  /**
   * Contact tags
   */
  tags?: string[];
  
  /**
   * Contact status
   */
  status?: string;
  
  /**
   * Additional fields
   */
  [key: string]: any;
}

/**
 * Options for getting a contact
 */
export interface GetContactOptions {
  /**
   * Find contact by email address
   */
  email?: string;
  
  /**
   * Find contact by integration ID
   */
  integrationId?: string;
}

/**
 * Options for updating a contact
 */
export interface UpdateContactOptions {
  /**
   * Find contact by email address
   */
  email?: string;
  
  /**
   * Find contact by integration ID
   */
  integrationId?: string;
  
  /**
   * Data to update
   */
  data: {
    /**
     * Update contact name
     */
    name?: string;
    
    /**
     * Update contact email
     */
    email?: string;
    
    /**
     * Update contact phone
     */
    phone?: string;
    
    /**
     * Update metadata
     */
    metadata?: Record<string, any>;
    
    /**
     * Update custom properties
     */
    properties?: Record<string, any>;
    
    /**
     * Update tags
     */
    tags?: string[];
    
    /**
     * Update status
     */
    status?: string;
    
    /**
     * Additional fields to update
     */
    [key: string]: any;
  };
}

/**
 * Options for listing contacts
 */
export interface ListContactsOptions {
  /**
   * Page number (starting from 1)
   */
  page?: number;
  
  /**
   * Number of results per page
   */
  limit?: number;
  
  /**
   * Filter criteria
   */
  filter?: Record<string, any>;
  
  /**
   * Sort options
   */
  sort?: Record<string, 1 | -1>;
}

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  /**
   * Whether the request was successful
   */
  success: boolean;
  
  /**
   * Array of items
   */
  data: T[];
  
  /**
   * Total number of items
   */
  total: number;
  
  /**
   * Current page number
   */
  page: number;
  
  /**
   * Items per page
   */
  limit: number;
}
