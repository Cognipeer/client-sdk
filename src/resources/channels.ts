import type { Channel } from '../types';
import type { IChannels } from '../interfaces';

/**
 * Channels resource implementation
 */
export class ChannelsResource implements IChannels {
  constructor(
    private request: <T>(endpoint: string, options?: RequestInit) => Promise<T>
  ) {}

  async get(): Promise<Channel> {
    return this.request<Channel>(
      '/sdk/channel',
      {
        method: 'GET',
      }
    );
  }
}
