/**
 * Cognipeer Webchat - Standalone Browser Bundle
 * 
 * This file can be loaded directly in the browser via script tag:
 * <script src="https://cdn.cognipeer.com/webchat.js"></script>
 * 
 * It exposes the CognipeerWebchat class globally.
 */

(function (global) {
  'use strict';

  // Type definitions are included in the main package
  // This is a browser-compatible version

  class CognipeerWebchat {
    constructor(config) {
      if (!config.hookId) {
        throw new Error('hookId is required for CognipeerWebchat');
      }

      this.hookId = config.hookId;
      this.config = config;
      this.baseUrl = config.baseUrl || 'https://app.cognipeer.com';
      this.eventListeners = new Map();
      this.clientTools = new Map();
      this.iframe = null;

      // Register client tools if provided
      if (config.tools && Array.isArray(config.tools)) {
        config.tools.forEach(tool => this.registerTool(tool));
      }

      if (typeof window !== 'undefined') {
        this.setupMessageListener();
      }
    }

    setupMessageListener() {
      this.messageListener = (event) => {
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

        this.emit(data.type, data);
      };

      window.addEventListener('message', this.messageListener);
    }

    handleToolCall(toolCallData) {
      const executionId = toolCallData.executionId;
      const toolName = toolCallData.toolName;
      const args = toolCallData.args;
      
      const tool = this.clientTools.get(toolName);
      if (!tool) {
        console.warn('[Webchat] Client tool "' + toolName + '" not found. Available tools:', Array.from(this.clientTools.keys()));
        this.sendToolResult({
          executionId: executionId,
          success: false,
          output: '',
          error: 'Tool "' + toolName + '" not found on client'
        });
        return;
      }

      console.log('[Webchat] Executing client tool: ' + toolName, args);
      
      this.emit('tool-execution-start', {
        executionId: executionId,
        toolName: toolName,
        args: args
      });
      
      Promise.resolve(tool.execute(args))
        .then(function(result) {
          const output = typeof result === 'string' ? result : JSON.stringify(result);
          console.log('[Webchat] Tool execution successful, sending result:', { executionId: executionId, outputLength: output.length });
          
          this.emit('tool-execution-end', {
            executionId: executionId,
            toolName: toolName,
            success: true,
            output: output
          });

          this.sendToolResult({
            executionId: executionId,
            success: true,
            output: output
          });
        }.bind(this))
        .catch(function(error) {
          console.error('[Webchat] Client tool "' + toolName + '" execution failed:', error);
          
          this.emit('tool-execution-end', {
            executionId: executionId,
            toolName: toolName,
            success: false,
            error: error.message || 'Tool execution failed'
          });

          this.sendToolResult({
            executionId: executionId,
            success: false,
            output: '',
            error: error.message || 'Tool execution failed'
          });
        }.bind(this));
    }

    registerTool(tool) {
      if (!tool.name || !tool.description || typeof tool.execute !== 'function') {
        throw new Error('Invalid tool definition. Required: name, description, execute function');
      }
      
      this.clientTools.set(tool.name, tool);
      console.log('[Webchat] Registered client tool: ' + tool.name);
      
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

    unregisterTool(toolName) {
      this.clientTools.delete(toolName);
      console.log('[Webchat] Unregistered client tool: ' + toolName);
      
      // Only notify iframe if it's mounted
      if (this.iframe && this.iframe.contentWindow) {
        this.postMessage({
          type: 'unregister-client-tool',
          data: { name: toolName }
        });
      }
    }

    generateUrl(options) {
      options = options || {};
      const params = new URLSearchParams();

      if (options.contact) {
        params.append('contact', JSON.stringify(options.contact));
      }

      if (options.context || this.config.context) {
        const context = Object.assign({}, this.config.context, options.context);
        params.append('context', JSON.stringify(context));
      }

      if (options.params || this.config.params) {
        const urlParams = Object.assign({}, this.config.params, options.params);
        params.append('params', JSON.stringify(urlParams));
      }

      if (options.theme) {
        const themeJson = JSON.stringify(options.theme);
        const themeBase64 = btoa(themeJson);
        params.append('override', themeBase64);
      }

      if (options.forceNew) {
        params.append('forceNew', 'true');
      }

      // Add client tools if any are registered
      if (this.clientTools.size > 0) {
        const toolDefinitions = [];
        this.clientTools.forEach(function(tool) {
          toolDefinitions.push({
            type: 'function',
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters
            }
          });
        });
        params.append('clientTools', JSON.stringify(toolDefinitions));
      }

      const queryString = params.toString();
      const url = this.baseUrl + '/webchat/' + this.hookId;
      
      return queryString ? url + '?' + queryString : url;
    }

    mount(iframeConfig) {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error('mount() can only be called in a browser environment');
      }

      const config = Object.assign({}, this.config, iframeConfig);
      
      if (!config.containerId) {
        throw new Error('containerId is required for mounting iframe');
      }

      const container = document.getElementById(config.containerId);
      if (!container) {
        throw new Error('Container element with id "' + config.containerId + '" not found');
      }

      this.iframe = document.createElement('iframe');
      this.iframe.src = this.generateUrl();
      this.iframe.style.width = config.width || '100%';
      this.iframe.style.height = config.height || '600px';
      this.iframe.style.border = 'none';
      this.iframe.style.borderRadius = (config.theme && config.theme.radius) || '8px';
      this.iframe.allow = 'microphone; camera';

      if (config.style) {
        Object.assign(this.iframe.style, config.style);
      }

      this.iframe.loading = 'lazy';

      container.innerHTML = '';
      container.appendChild(this.iframe);

      return this.iframe;
    }

    unmount() {
      if (this.iframe && this.iframe.parentNode) {
        this.iframe.parentNode.removeChild(this.iframe);
        this.iframe = null;
      }
    }

    on(eventType, listener) {
      if (!this.eventListeners.has(eventType)) {
        this.eventListeners.set(eventType, new Set());
      }
      this.eventListeners.get(eventType).add(listener);
    }

    off(eventType, listener) {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        listeners.delete(listener);
      }
    }

    emit(eventType, data) {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        const event = Object.assign({
          type: eventType,
          timestamp: Date.now()
        }, data);

        listeners.forEach(function(listener) {
          try {
            listener(event);
          } catch (error) {
            console.error('Error in webchat event listener (' + eventType + '):', error);
          }
        });
      }
    }

    postMessage(message) {
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

    sendToolResult(result) {
      console.log('[Webchat SDK] Sending tool result to iframe:', { 
        hasIframe: !!this.iframe, 
        hasContentWindow: !!(this.iframe && this.iframe.contentWindow),
        executionId: result.executionId 
      });
      this.postMessage({
        type: 'tool-result',
        data: result
      });
    }

    sendMessage(content) {
      this.postMessage({
        type: 'send-message',
        data: { content: content }
      });
    }

    open() {
      this.postMessage({ type: 'open' });
    }

    close() {
      this.postMessage({ type: 'close' });
    }

    newConversation() {
      this.postMessage({ type: 'new-conversation' });
    }

    destroy() {
      this.unmount();
      
      if (this.messageListener && typeof window !== 'undefined') {
        window.removeEventListener('message', this.messageListener);
      }
      
      this.eventListeners.clear();
    }

    static createWidget(config) {
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        throw new Error('createWidget() can only be called in a browser environment');
      }

      const position = config.position || 'bottom-right';
      const size = config.size || 60;
      const buttonColor = config.buttonColor || (config.theme && config.theme.primary) || '#00b5a5';
      const iconColor = config.iconColor || '#ffffff';
      const zIndex = config.zIndex || 9999;

      const container = document.createElement('div');
      container.id = 'cognipeer-webchat-widget-' + config.hookId;
      container.style.cssText = 
        'position: fixed;' +
        getPositionStyles(position) +
        'z-index: ' + zIndex + ';' +
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;';

      const button = document.createElement('button');
      button.style.cssText =
        'width: ' + size + 'px;' +
        'height: ' + size + 'px;' +
        'border-radius: 50%;' +
        'background: ' + buttonColor + ';' +
        'border: none;' +
        'cursor: pointer;' +
        'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);' +
        'display: flex;' +
        'align-items: center;' +
        'justify-content: center;' +
        'transition: all 0.3s ease;' +
        'outline: none;';
      
      var chatIcon = config.icon || 
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="' + iconColor + '"/>' +
        '</svg>';
      
      var closeIcon = 
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M18 6L6 18M6 6L18 18" stroke="' + iconColor + '" stroke-width="2" stroke-linecap="round"/>' +
        '</svg>';
      
      button.innerHTML = chatIcon;

      button.addEventListener('mouseenter', function() {
        button.style.transform = 'scale(1.05)';
        button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
      });
      button.addEventListener('mouseleave', function() {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      });

      const chatWindow = document.createElement('div');
      chatWindow.style.cssText =
        'position: absolute;' +
        getPositionStyles(position, true) +
        'width: 380px;' +
        'height: 600px;' +
        'background: white;' +
        'border-radius: 12px;' +
        'box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);' +
        'display: none;' +
        'flex-direction: column;' +
        'overflow: hidden;' +
        'z-index: -1;';

      container.appendChild(button);
      container.appendChild(chatWindow);
      document.body.appendChild(container);

      const webchat = new CognipeerWebchat(config);

      let isOpen = false;
      const toggle = function() {
        isOpen = !isOpen;
        if (isOpen) {
          chatWindow.style.display = 'flex';
          chatWindow.style.zIndex = '1';
          button.innerHTML = closeIcon;
          
          if (!webchat.iframe) {
            const iframe = document.createElement('iframe');
            iframe.src = webchat.generateUrl();
            iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
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

      if (config.autoOpen) {
        setTimeout(toggle, 500);
      }

      const originalDestroy = webchat.destroy.bind(webchat);
      webchat.destroy = function() {
        originalDestroy();
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      };

      return webchat;
    }
  }

  function getPositionStyles(position, isWindow) {
    const offset = isWindow ? '80px' : '20px';
    const windowOffset = '20px';

    switch (position) {
      case 'bottom-right':
        return isWindow 
          ? 'bottom: ' + offset + '; right: ' + windowOffset + ';'
          : 'bottom: ' + offset + '; right: ' + offset + ';';
      case 'bottom-left':
        return isWindow
          ? 'bottom: ' + offset + '; left: ' + windowOffset + ';'
          : 'bottom: ' + offset + '; left: ' + offset + ';';
      case 'top-right':
        return isWindow
          ? 'top: ' + offset + '; right: ' + windowOffset + ';'
          : 'top: ' + offset + '; right: ' + offset + ';';
      case 'top-left':
        return isWindow
          ? 'top: ' + offset + '; left: ' + windowOffset + ';'
          : 'top: ' + offset + '; left: ' + offset + ';';
      default:
        return 'bottom: ' + offset + '; right: ' + offset + ';';
    }
  }

  // Export to global scope
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CognipeerWebchat;
  } else {
    global.CognipeerWebchat = CognipeerWebchat;
  }

})(typeof window !== 'undefined' ? window : this);
