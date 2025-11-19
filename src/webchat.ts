import type {
  WebchatConfig,
  WebchatIframeConfig,
  WebchatWidgetConfig,
  WebchatUrlOptions,
  WebchatEventData,
  WebchatEventListener,
  WebchatEventType,
  WebchatToolResult,
  WebchatPosition,
  ClientTool,
} from './webchat-types';

/**
 * Cognipeer Webchat Client
 * 
 * Provides multiple integration methods for embedding Cognipeer webchat:
 * 1. Iframe embed
 * 2. URL generation with event handling
 * 3. Floating widget
 * 
 * @example
 * ```typescript
 * // Iframe embed
 * const webchat = new CognipeerWebchat({
 *   hookId: 'your-hook-id',
 *   containerId: 'chat-container'
 * });
 * webchat.mount();
 * 
 * // URL generation
 * const url = webchat.generateUrl({ context: { userId: '123' } });
 * 
 * // Floating widget
 * CognipeerWebchat.createWidget({
 *   hookId: 'your-hook-id',
 *   position: 'bottom-right'
 * });
 * ```
 */
export class CognipeerWebchat {
  private readonly hookId: string;
  private readonly config: WebchatConfig;
  private readonly baseUrl: string;
  private iframe?: HTMLIFrameElement;
  private eventListeners: Map<WebchatEventType, Set<WebchatEventListener>>;
  private messageListener?: (event: MessageEvent) => void;
  private clientTools: Map<string, ClientTool>;

  constructor(config: WebchatConfig) {
    if (!config.hookId) {
      throw new Error('hookId is required for CognipeerWebchat');
    }

    this.hookId = config.hookId;
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://app.cognipeer.com';
    this.eventListeners = new Map();
    this.clientTools = new Map();

    // Register client tools if provided
    if (config.tools && Array.isArray(config.tools)) {
      config.tools.forEach(tool => this.registerTool(tool));
    }

    // Setup postMessage listener for iframe communication
    if (typeof window !== 'undefined') {
      this.setupMessageListener();
    }
  }

  /**
   * Setup message listener for iframe communication
   */
  private setupMessageListener(): void {
    this.messageListener = (event: MessageEvent) => {
      // Verify origin for security
      if (!event.origin.includes('cognipeer.com') && !event.origin.includes('localhost')) {
        return;
      }

      const data = event.data;
      if (!data || typeof data !== 'object' || !data.type) {
        return;
      }

      // Handle tool-call events automatically
      if (data.type === 'tool-call' && data.data) {
        this.handleToolCall(data.data);
      }

      // Emit event to listeners
      this.emit(data.type, data);
    };

    window.addEventListener('message', this.messageListener);
  }

  /**
   * Handle tool call from the AI
   */
  private async handleToolCall(toolCallData: any): Promise<void> {
    const { executionId, toolName, args } = toolCallData;
    
    const tool = this.clientTools.get(toolName);
    if (!tool) {
      console.warn(`[Webchat] Client tool '${toolName}' not found. Available tools:`, Array.from(this.clientTools.keys()));
      this.sendToolResult({
        executionId,
        success: false,
        output: '',
        error: `Tool '${toolName}' not found on client`
      });
      return;
    }

    try {
      console.log(`[Webchat] Executing client tool: ${toolName}`, args);
      const result = await tool.execute(args);
      const output = typeof result === 'string' ? result : JSON.stringify(result);
      console.log(`[Webchat] Tool execution successful, sending result:`, { executionId, outputLength: output.length });
      
      this.sendToolResult({
        executionId,
        success: true,
        output
      });
    } catch (error: any) {
      console.error(`[Webchat] Client tool '${toolName}' execution failed:`, error);
      this.sendToolResult({
        executionId,
        success: false,
        output: '',
        error: error.message || 'Tool execution failed'
      });
    }
  }

  /**
   * Register a client-side tool
   * 
   * @example
   * ```typescript
   * webchat.registerTool({
   *   name: 'get_current_time',
   *   description: 'Get the current time',
   *   execute: async () => {
   *     return new Date().toISOString();
   *   }
   * });
   * ```
   */
  registerTool(tool: ClientTool): void {
    if (!tool.name || !tool.description || typeof tool.execute !== 'function') {
      throw new Error('Invalid tool definition. Required: name, description, execute function');
    }
    
    this.clientTools.set(tool.name, tool);
    console.log(`[Webchat] Registered client tool: ${tool.name}`);
    
    // Only notify iframe if it's already mounted and ready
    // For widget mode, tools are passed via URL on iframe creation
    if (this.iframe && this.iframe.contentWindow) {
      this.postMessage({
        type: 'register-client-tool',
        data: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      });
    }
  }

  /**
   * Unregister a client-side tool
   */
  unregisterTool(toolName: string): void {
    this.clientTools.delete(toolName);
    console.log(`[Webchat] Unregistered client tool: ${toolName}`);
    
    // Only notify iframe if it's mounted
    if (this.iframe && this.iframe.contentWindow) {
      this.postMessage({
        type: 'unregister-client-tool',
        data: { name: toolName }
      });
    }
  }

  /**
   * Generate webchat URL with optional parameters
   * 
   * @example
   * ```typescript
   * const url = webchat.generateUrl({
   *   contact: { email: 'user@example.com' },
   *   context: { userId: '123' },
   *   params: { source: 'landing-page' }
   * });
   * ```
   */
  generateUrl(options?: WebchatUrlOptions): string {
    const params = new URLSearchParams();

    if (options?.contact) {
      params.append('contact', JSON.stringify(options.contact));
    }

    if (options?.context || this.config.context) {
      const context = { ...this.config.context, ...options?.context };
      params.append('context', JSON.stringify(context));
    }

    if (options?.params || this.config.params) {
      const urlParams = { ...this.config.params, ...options?.params };
      params.append('params', JSON.stringify(urlParams));
    }

    if (options?.theme) {
      const themeJson = JSON.stringify(options.theme);
      const themeBase64 = btoa(themeJson);
      params.append('override', themeBase64);
    }

    if (options?.forceNew) {
      params.append('forceNew', 'true');
    }

    // Add client tools if any are registered
    if (this.clientTools.size > 0) {
      const toolDefinitions = Array.from(this.clientTools.values()).map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      }));
      params.append('clientTools', JSON.stringify(toolDefinitions));
    }

    const queryString = params.toString();
    const url = `${this.baseUrl}/webchat/${this.hookId}`;
    
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Mount webchat as an iframe in a container element
   * 
   * @example
   * ```typescript
   * const webchat = new CognipeerWebchat({
   *   hookId: 'your-hook-id',
   *   containerId: 'chat-container',
   *   width: '100%',
   *   height: '600px'
   * });
   * 
   * webchat.mount();
   * ```
   */
  mount(iframeConfig?: Partial<WebchatIframeConfig>): HTMLIFrameElement {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('mount() can only be called in a browser environment');
    }

    const config = { ...this.config, ...iframeConfig } as WebchatIframeConfig;
    
    if (!config.containerId) {
      throw new Error('containerId is required for mounting iframe');
    }

    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error(`Container element with id '${config.containerId}' not found`);
    }

    // Create iframe
    this.iframe = document.createElement('iframe');
    this.iframe.src = this.generateUrl();
    this.iframe.style.width = config.width || '100%';
    this.iframe.style.height = config.height || '600px';
    this.iframe.style.border = 'none';
    this.iframe.style.borderRadius = config.theme?.radius || '8px';
    this.iframe.allow = 'microphone; camera'; // For potential voice features

    // Apply custom styles
    if (config.style) {
      Object.assign(this.iframe.style, config.style);
    }

    // Add loading attribute for better performance
    this.iframe.loading = 'lazy';

    // Clear container and append iframe
    container.innerHTML = '';
    container.appendChild(this.iframe);

    return this.iframe;
  }

  /**
   * Unmount and destroy the iframe
   */
  unmount(): void {
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
      this.iframe = undefined;
    }
  }

  /**
   * Add event listener
   * 
   * @example
   * ```typescript
   * webchat.on('message-received', (event) => {
   *   console.log('New message:', event.data.content);
   * });
   * 
   * webchat.on('tool-call', async (event) => {
   *   const result = await myFunction(event.data.args);
   *   webchat.sendToolResult({
   *     executionId: event.data.executionId,
   *     success: true,
   *     output: JSON.stringify(result)
   *   });
   * });
   * ```
   */
  on<T extends WebchatEventData>(
    eventType: T['type'],
    listener: WebchatEventListener<T>
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener as WebchatEventListener);
  }

  /**
   * Remove event listener
   */
  off<T extends WebchatEventData>(
    eventType: T['type'],
    listener: WebchatEventListener<T>
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener as WebchatEventListener);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit(eventType: WebchatEventType, data: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const event: WebchatEventData = {
        type: eventType,
        timestamp: Date.now(),
        ...data,
      } as WebchatEventData;

      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in webchat event listener (${eventType}):`, error);
        }
      });
    }
  }

  /**
   * Send a message to the webchat iframe
   */
  private postMessage(message: any): void {
    if (this.iframe && this.iframe.contentWindow) {
      try {
        this.iframe.contentWindow.postMessage(message, '*');
        console.log('[Webchat SDK] Message sent to iframe:', message.type);
      } catch (error) {
        console.error('[Webchat SDK] Failed to send message to iframe:', error);
      }
    } else {
      console.warn('[Webchat SDK] Cannot send message - iframe not ready:', { 
        hasIframe: !!this.iframe, 
        hasContentWindow: !!(this.iframe && this.iframe.contentWindow),
        messageType: message.type 
      });
    }
  }

  /**
   * Send tool execution result back to webchat
   * 
   * @example
   * ```typescript
   * webchat.on('tool-call', async (event) => {
   *   try {
   *     const result = await executeMyTool(event.data.args);
   *     webchat.sendToolResult({
   *       executionId: event.data.executionId,
   *       success: true,
   *       output: JSON.stringify(result)
   *     });
   *   } catch (error) {
   *     webchat.sendToolResult({
   *       executionId: event.data.executionId,
   *       success: false,
   *       output: '',
   *       error: error.message
   *     });
   *   }
   * });
   * ```
   */
  sendToolResult(result: WebchatToolResult): void {
    console.log('[Webchat SDK] Sending tool result to iframe:', { 
      hasIframe: !!this.iframe, 
      hasContentWindow: !!(this.iframe && this.iframe.contentWindow),
      executionId: result.executionId 
    });
    this.postMessage({
      type: 'tool-result',
      data: result,
    });
  }

  /**
   * Send a message to the chat
   */
  sendMessage(content: string): void {
    this.postMessage({
      type: 'send-message',
      data: { content },
    });
  }

  /**
   * Open the chat (for widget mode)
   */
  open(): void {
    this.postMessage({ type: 'open' });
  }

  /**
   * Close the chat (for widget mode)
   */
  close(): void {
    this.postMessage({ type: 'close' });
  }

  /**
   * Start a new conversation
   */
  newConversation(): void {
    this.postMessage({ type: 'new-conversation' });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.unmount();
    
    if (this.messageListener && typeof window !== 'undefined') {
      window.removeEventListener('message', this.messageListener);
    }
    
    this.eventListeners.clear();
  }

  /**
   * Create a floating widget on the page
   * 
   * @example
   * ```typescript
   * const widget = CognipeerWebchat.createWidget({
   *   hookId: 'your-hook-id',
   *   position: 'bottom-right',
   *   buttonColor: '#00b5a5',
   *   autoOpen: false
   * });
   * 
   * // Later destroy it
   * widget.destroy();
   * ```
   */
  static createWidget(config: WebchatWidgetConfig): CognipeerWebchat {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      throw new Error('createWidget() can only be called in a browser environment');
    }

    const position = config.position || 'bottom-right';
    const size = config.size || 60;
    const buttonColor = config.buttonColor || config.theme?.primary || '#00b5a5';
    const iconColor = config.iconColor || '#ffffff';
    const zIndex = config.zIndex || 9999;

    // Create container
    const container = document.createElement('div');
    container.id = `cognipeer-webchat-widget-${config.hookId}`;
    container.style.cssText = `
      position: fixed;
      ${getPositionStyles(position)}
      z-index: ${zIndex};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    `;

    // Create button
    const button = document.createElement('button');
    button.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${buttonColor};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      outline: none;
    `;
    
    // Define icons
    const chatIcon = config.icon || `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" 
              fill="${iconColor}"/>
      </svg>
    `;
    
    const closeIcon = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="${iconColor}" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    
    // Set initial icon
    button.innerHTML = chatIcon;

    // Add hover effect
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
    });
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });

    // Create chat window
    const chatWindow = document.createElement('div');
    chatWindow.style.cssText = `
      position: absolute;
      ${getPositionStyles(position, true)}
      width: 380px;
      height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: -1;
    `;

    // Remove the old close button as we'll use the main button for closing now

    // Append to container
    container.appendChild(button);
    container.appendChild(chatWindow);
    document.body.appendChild(container);

    // Create webchat instance
    const webchat = new CognipeerWebchat(config);

    // Toggle chat window
    let isOpen = false;
    const toggle = () => {
      isOpen = !isOpen;
      if (isOpen) {
        chatWindow.style.display = 'flex';
        chatWindow.style.zIndex = '1';
        button.innerHTML = closeIcon;
        
        // Mount iframe if not already mounted
        if (!webchat.iframe) {
          const iframe = document.createElement('iframe');
          iframe.src = webchat.generateUrl();
          iframe.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
          `;
          chatWindow.appendChild(iframe);
          webchat.iframe = iframe;
        }
        
        webchat.emit('open', {});
      } else {
        chatWindow.style.display = 'none';
        chatWindow.style.zIndex = '-1';
        button.innerHTML = chatIcon;
        webchat.emit('close', {});
      }
    };

    button.addEventListener('click', toggle);

    // Auto-open if configured
    if (config.autoOpen) {
      setTimeout(toggle, 500);
    }

    // Override destroy to clean up widget
    const originalDestroy = webchat.destroy.bind(webchat);
    webchat.destroy = () => {
      originalDestroy();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };

    return webchat;
  }
}

/**
 * Get position styles based on position configuration
 */
function getPositionStyles(position: WebchatPosition, isWindow = false): string {
  const offset = isWindow ? '80px' : '20px';
  const windowOffset = '20px';

  switch (position) {
    case 'bottom-right':
      return isWindow 
        ? `bottom: ${offset}; right: ${windowOffset};`
        : `bottom: ${offset}; right: ${offset};`;
    case 'bottom-left':
      return isWindow
        ? `bottom: ${offset}; left: ${windowOffset};`
        : `bottom: ${offset}; left: ${offset};`;
    case 'top-right':
      return isWindow
        ? `top: ${offset}; right: ${windowOffset};`
        : `top: ${offset}; right: ${offset};`;
    case 'top-left':
      return isWindow
        ? `top: ${offset}; left: ${windowOffset};`
        : `top: ${offset}; left: ${offset};`;
    default:
      return `bottom: ${offset}; right: ${offset};`;
  }
}
