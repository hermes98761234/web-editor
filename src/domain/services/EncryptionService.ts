/**
 * Domain Service: EncryptionService
 * Stateless operation for encrypting and decrypting tab content.
 * Domain interfaces know nothing about the external crypto system.
 */

import { EncryptedContent } from '../value-objects/EncryptedContent';

export interface EncryptionService {
  /** Encrypt plaintext with a password, returning an EncryptedContent value object. */
  encrypt(plaintext: string, password: string): Promise<EncryptedContent>;

  /** Decrypt an EncryptedContent value object with a password. */
  decrypt(encrypted: EncryptedContent, password: string): Promise<string>;
}
