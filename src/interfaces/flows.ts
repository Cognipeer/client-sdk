import type {
  ExecuteFlowOptions,
  ExecuteFlowResponse,
} from '../types';

/**
 * Flows (Apps) resource interface
 */
export interface IFlows {
  /**
   * Execute a flow/app
   * 
   * @example
   * ```typescript
   * const result = await client.flow.execute({
   *   flowId: 'flow-id',
   *   inputs: { document: 'base64-content' }
   * });
   * ```
   */
  execute(options: ExecuteFlowOptions): Promise<ExecuteFlowResponse>;
}
