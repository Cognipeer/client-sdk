import type { Peer } from '../types';
import type { IPeers } from '../interfaces';

/**
 * Peers resource implementation
 */
export class PeersResource implements IPeers {
  constructor(
    private request: <T>(endpoint: string, options?: RequestInit) => Promise<T>
  ) {}

  async get(): Promise<Peer> {
    return this.request<Peer>(
      '/sdk/peer',
      {
        method: 'GET',
      }
    );
  }
}
