import type { User } from '../types';
import type { IUsers } from '../interfaces';

/**
 * Users resource implementation
 */
export class UsersResource implements IUsers {
  constructor(
    private request: <T>(endpoint: string, options?: RequestInit) => Promise<T>
  ) {}

  async get(): Promise<User> {
    return this.request<User>(
      '/sdk/user',
      {
        method: 'GET',
      }
    );
  }
}
