import type {
  ExecuteFlowOptions,
  ExecuteFlowResponse,
} from '../types';
import type { IFlows } from '../interfaces';

/**
 * Flows (Apps) resource implementation
 */
export class FlowsResource implements IFlows {
  constructor(
    private request: <T>(endpoint: string, options?: RequestInit) => Promise<T>
  ) {}

  async execute(options: ExecuteFlowOptions): Promise<ExecuteFlowResponse> {
    const { flowId, inputs, version = 'latest' } = options;

    return this.request<ExecuteFlowResponse>(
      `/sdk/flow/${flowId}/execute?version=${version}`,
      {
        method: 'POST',
        body: JSON.stringify(inputs),
      }
    );
  }
}
