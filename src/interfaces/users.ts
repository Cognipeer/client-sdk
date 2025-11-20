import type { User } from '../types';

/**
 * Users resource interface
 */
export interface IUsers {
  /**
   * Get authenticated user information
   * 
   * @example
   * ```typescript
   * const user = await client.users.get();
   * console.log(user.email, user.workspace.name);
   * ```
   */
  get(): Promise<User>;
}
