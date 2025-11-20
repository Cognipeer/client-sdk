import type {
  Contact,
  CreateContactOptions,
  GetContactOptions,
  UpdateContactOptions,
  ListContactsOptions,
  PaginatedResponse,
} from '../types';
import type { IContacts } from '../interfaces';

/**
 * Contacts resource implementation
 */
export class ContactsResource implements IContacts {
  private request: (path: string, options?: any) => Promise<any>;

  constructor(request: (path: string, options?: any) => Promise<any>) {
    this.request = request;
  }

  async create(options: CreateContactOptions): Promise<Contact> {
    const response = await this.request('/sdk/contact', {
      method: 'POST',
      body: JSON.stringify(options),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to create contact');
    }

    return response.data;
  }

  async get(options: GetContactOptions): Promise<Contact> {
    if (!options.email && !options.integrationId) {
      throw new Error('Either email or integrationId is required');
    }

    const params = new URLSearchParams();
    if (options.email) params.append('email', options.email);
    if (options.integrationId) params.append('integrationId', options.integrationId);

    const response = await this.request(`/sdk/contact?${params.toString()}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get contact');
    }

    return response.data;
  }

  async update(options: UpdateContactOptions): Promise<Contact> {
    if (!options.email && !options.integrationId) {
      throw new Error('Either email or integrationId is required');
    }

    if (!options.data || Object.keys(options.data).length === 0) {
      throw new Error('Data object with fields to update is required');
    }

    const response = await this.request('/sdk/contact', {
      method: 'PATCH',
      body: JSON.stringify({
        email: options.email,
        integrationId: options.integrationId,
        data: options.data,
      }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to update contact');
    }

    return response.data;
  }

  async list(options: ListContactsOptions = {}): Promise<PaginatedResponse<Contact>> {
    const { page = 1, limit = 10, filter = {}, sort } = options;

    const response = await this.request('/sdk/contact/list', {
      method: 'POST',
      body: JSON.stringify({ page, limit, filter, sort }),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to list contacts');
    }

    return {
      success: response.success,
      data: response.data,
      total: response.total,
      page: response.page,
      limit: response.limit,
    };
  }
}
