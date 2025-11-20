import type {
  Contact,
  CreateContactOptions,
  GetContactOptions,
  UpdateContactOptions,
  ListContactsOptions,
  PaginatedResponse,
} from '../types';

/**
 * Contacts resource interface
 */
export interface IContacts {
  /**
   * Create a new contact
   * @param options - Contact creation options
   * @returns Created contact
   */
  create(options: CreateContactOptions): Promise<Contact>;

  /**
   * Get a contact by email or integrationId
   * @param options - Search options (email or integrationId)
   * @returns Contact if found
   */
  get(options: GetContactOptions): Promise<Contact>;

  /**
   * Update a contact by email or integrationId
   * @param options - Update options with identifier and data
   * @returns Updated contact
   */
  update(options: UpdateContactOptions): Promise<Contact>;

  /**
   * List contacts with pagination
   * @param options - List options with pagination and filtering
   * @returns Paginated list of contacts
   */
  list(options?: ListContactsOptions): Promise<PaginatedResponse<Contact>>;
}

