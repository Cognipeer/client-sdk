/**
 * Webchat configuration and types
 * 
 * This module provides TypeScript types for the Cognipeer Webchat integration
 */

/**
 * Position options for the webchat widget
 */
export type WebchatPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

/**
 * Theme configuration for webchat
 */
export interface WebchatTheme {
  /**
   * Primary color (hex)
   * @default '#00b5a5'
   */
  primary?: string;
  
  /**
   * Header background color (hex)
   * @default '#ffffff'
   */
  headerBG?: string;
  
  /**
   * Main background color (hex)
   * @default '#ffffff'
   */
  mainBG?: string;
  
  /**
   * Footer background color (hex)
   * @default '#ffffff'
   */
  footerBG?: string;
  
  /**
   * Black color (hex)
   * @default '#222'
   */
  black?: string;
  
  /**
   * White color (hex)
   * @default '#fff'
   */
  white?: string;
  
  /**
   * Border radius
   * @default '7px'
   */
  radius?: string;
  
  /**
   * Font family
   * @default 'Helvetica, Arial, sans-serif'
   */
  fontFamily?: string;
}

/**
 * Logo configuration for webchat
 */
export interface WebchatLogo {
  /**
   * Logo image URL
   */
  src?: string;
  
  /**
   * Logo width in pixels
   * @default 135
   */
  width?: number;
  
  /**
   * Logo height in pixels
   * @default 30
   */
  height?: number;
  
  /**
   * Alt text for logo
   * @default 'Logo'
   */
  alt?: string;
}

/**
 * Contact information for webchat
 */
export interface WebchatContact {
  /**
   * Contact email
   */
  email?: string;
  
  /**
   * Contact name
   */
  name?: string;
  
  /**
   * Contact phone
   */
  phone?: string;
  
  /**
   * Additional contact metadata
   */
  [key: string]: any;
}

/**
 * Configuration for creating a webchat instance
 */
export interface WebchatConfig {
  /**
   * Hook ID for the webchat channel
   */
  hookId: string;
  
  /**
   * API base URL
   * @default 'https://api.cognipeer.com/v1'
   */
  apiUrl?: string;
  
  /**
   * Theme customization
   */
  theme?: WebchatTheme;
  
  /**
   * Logo customization
   */
  logo?: WebchatLogo;
  
  /**
   * Contact information to pre-fill
   */
  contact?: WebchatContact;
  
  /**
   * Additional context to pass with each message
   */
  context?: Record<string, any>;
  
  /**
   * Parameters to pass to the peer
   */
  params?: Record<string, any>;
  
  /**
   * Welcome message to display
   */
  welcomeMessage?: string;
  
  /**
   * Placeholder for message input
   */
  messageInputPlaceholder?: string;
  
  /**
   * Show "Powered by Cognipeer" badge
   * @default false
   */
  showPoweredBy?: boolean;
  
  /**
   * Initial prompts to show as quick actions
   */
  initialPrompts?: string[];
  
  /**
   * Allow file attachments
   * @default false
   */
  allowAttachments?: boolean;
  
  /**
   * Maximum number of attachments
   * @default 5
   */
  maxAttachments?: number;
  
  /**
   * Center title text (shown when no messages)
   */
  centerTitle?: string;
  
  /**
   * Center description text (shown when no messages)
   */
  centerText?: string;
}

/**
 * Configuration for iframe embedding
 */
export interface WebchatIframeConfig extends WebchatConfig {
  /**
   * DOM element ID to mount the iframe
   */
  containerId: string;
  
  /**
   * Iframe width
   * @default '100%'
   */
  width?: string;
  
  /**
   * Iframe height
   * @default '600px'
   */
  height?: string;
  
  /**
   * Custom iframe styles
   */
  style?: Partial<CSSStyleDeclaration>;
}

/**
 * Configuration for floating widget
 */
export interface WebchatWidgetConfig extends WebchatConfig {
  /**
   * Widget position on screen
   * @default 'bottom-right'
   */
  position?: WebchatPosition;
  
  /**
   * Custom icon for the widget button
   */
  icon?: string;
  
  /**
   * Widget button size in pixels
   * @default 60
   */
  size?: number;
  
  /**
   * Initially open the chat
   * @default false
   */
  autoOpen?: boolean;
  
  /**
   * Widget button background color (hex)
   */
  buttonColor?: string;
  
  /**
   * Widget button icon color (hex)
   */
  iconColor?: string;
  
  /**
   * Z-index for the widget
   * @default 9999
   */
  zIndex?: number;
}

/**
 * Webchat event types
 */
export type WebchatEventType = 
  | 'ready'
  | 'open'
  | 'close'
  | 'message-sent'
  | 'message-received'
  | 'conversation-created'
  | 'tool-call'
  | 'error';

/**
 * Base event structure
 */
export interface WebchatEvent {
  /**
   * Event type
   */
  type: WebchatEventType;
  
  /**
   * Timestamp of the event
   */
  timestamp: number;
}

/**
 * Event when webchat is ready
 */
export interface WebchatReadyEvent extends WebchatEvent {
  type: 'ready';
}

/**
 * Event when webchat is opened
 */
export interface WebchatOpenEvent extends WebchatEvent {
  type: 'open';
}

/**
 * Event when webchat is closed
 */
export interface WebchatCloseEvent extends WebchatEvent {
  type: 'close';
}

/**
 * Event when a message is sent
 */
export interface WebchatMessageSentEvent extends WebchatEvent {
  type: 'message-sent';
  data: {
    content: string;
    conversationId?: string;
  };
}

/**
 * Event when a message is received
 */
export interface WebchatMessageReceivedEvent extends WebchatEvent {
  type: 'message-received';
  data: {
    content: string;
    conversationId: string;
    messageId: string;
  };
}

/**
 * Event when a conversation is created
 */
export interface WebchatConversationCreatedEvent extends WebchatEvent {
  type: 'conversation-created';
  data: {
    conversationId: string;
    contactId?: string;
  };
}

/**
 * Event when AI requests a client tool execution
 */
export interface WebchatToolCallEvent extends WebchatEvent {
  type: 'tool-call';
  data: {
    conversationId: string;
    messageId: string;
    executionId: string;
    toolName: string;
    args: Record<string, any>;
  };
}

/**
 * Event when an error occurs
 */
export interface WebchatErrorEvent extends WebchatEvent {
  type: 'error';
  data: {
    message: string;
    code?: string;
  };
}

/**
 * Union type of all webchat events
 */
export type WebchatEventData = 
  | WebchatReadyEvent
  | WebchatOpenEvent
  | WebchatCloseEvent
  | WebchatMessageSentEvent
  | WebchatMessageReceivedEvent
  | WebchatConversationCreatedEvent
  | WebchatToolCallEvent
  | WebchatErrorEvent;

/**
 * Event listener callback
 */
export type WebchatEventListener<T extends WebchatEventData = WebchatEventData> = (event: T) => void;

/**
 * URL generation options
 */
export interface WebchatUrlOptions {
  /**
   * Contact information
   */
  contact?: WebchatContact;
  
  /**
   * Additional context
   */
  context?: Record<string, any>;
  
  /**
   * Parameters
   */
  params?: Record<string, any>;
  
  /**
   * Theme override (will be base64 encoded)
   */
  theme?: WebchatTheme;
  
  /**
   * Force new conversation
   * @default false
   */
  forceNew?: boolean;
}

/**
 * Tool result for responding to tool call events
 */
export interface WebchatToolResult {
  /**
   * Execution ID from the tool call event
   */
  executionId: string;
  
  /**
   * Whether the tool execution was successful
   */
  success: boolean;
  
  /**
   * Tool output (must be string)
   */
  output: string;
  
  /**
   * Error message if failed
   */
  error?: string;
}
