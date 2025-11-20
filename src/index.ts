/**
 * Cognipeer AI SDK
 * 
 * Official JavaScript/TypeScript SDK for building conversational AI applications
 * with client-side tool execution support.
 * 
 * @packageDocumentation
 */

export { CognipeerClient } from './client';
export { CognipeerWebchat } from './webchat';
export * from './types';
export * from './interfaces';
export type {
  WebchatConfig,
  WebchatIframeConfig,
  WebchatWidgetConfig,
  WebchatUrlOptions,
  WebchatEventData,
  WebchatEventListener,
  WebchatEventType,
  WebchatToolResult,
  WebchatPosition,
  WebchatTheme,
  WebchatLogo,
  WebchatContact,
  ClientTool,
} from './webchat-types';
export { CognipeerClient as default } from './client';
