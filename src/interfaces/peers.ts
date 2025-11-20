import type { Peer } from '../types';

/**
 * Peers resource interface
 */
export interface IPeers {
  /**
   * Get peer information for the API channel
   * 
   * @example
   * ```typescript
   * const peer = await client.peers.get();
   * console.log(peer.name, peer.modelId);
   * ```
   */
  get(): Promise<Peer>;
}
