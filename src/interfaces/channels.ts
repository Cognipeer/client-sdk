import type { Channel } from '../types';

/**
 * Channels resource interface
 */
export interface IChannels {
  /**
   * Get API channel information
   * 
   * @example
   * ```typescript
   * const channel = await client.channels.get();
   * console.log(channel.hookId, channel.isActive);
   * ```
   */
  get(): Promise<Channel>;
}
