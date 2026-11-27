/**
 * Value Object: EncryptedContent
 * Immutable representation of encrypted tab content.
 * Holds the ciphertext along with the salt and IV needed for decryption.
 */

export class EncryptedContent {
  public readonly ciphertext: string; // base64-encoded ciphertext + salt + iv
  public readonly salt: string; // base64-encoded salt
  public readonly iv: string; // base64-encoded initialization vector

  constructor(ciphertext: string, salt: string, iv: string) {
    this.ciphertext = ciphertext;
    this.salt = salt;
    this.iv = iv;
  }

  /** Attribute-based equality. */
  equals(other: EncryptedContent): boolean {
    return (
      this.ciphertext === other.ciphertext &&
      this.salt === other.salt &&
      this.iv === other.iv
    );
  }
}
