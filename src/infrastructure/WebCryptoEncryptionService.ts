/**
 * Infrastructure: WebCryptoEncryptionService
 * Encrypts/decrypts using the Web Crypto API (AES-GCM + PBKDF2).
 * Implements the domain-level EncryptionService interface.
 */

import { EncryptedContent } from '../domain/value-objects/EncryptedContent';
import type { EncryptionService } from '../domain/services/EncryptionService';

const ITERATIONS = 200000;
const KEY_LENGTH = 256;

export class WebCryptoEncryptionService implements EncryptionService {
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: ITERATIONS, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(plaintext: string, password: string): Promise<EncryptedContent> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt);
    const enc = new TextEncoder();
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plaintext)
    );
    const combined = new Uint8Array(salt.length + iv.length + cipher.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(cipher), salt.length + iv.length);
    const encoded = btoa(String.fromCharCode(...combined));
    return new EncryptedContent(
      encoded,
      btoa(String.fromCharCode(...salt)),
      btoa(String.fromCharCode(...iv))
    );
  }

  async decrypt(encrypted: EncryptedContent, password: string): Promise<string> {
    // Reconstruct salt and iv from the base64-encoded combined content.
    // The combined format is: salt(16) + iv(12) + ciphertext, all base64-encoded together.
    const combined = atob(encrypted.ciphertext);
    const bytes = new Uint8Array(combined.length);
    for (let i = 0; i < combined.length; i++) {
      bytes[i] = combined.charCodeAt(i);
    }
    const salt = bytes.slice(0, 16) as Uint8Array;
    const iv = bytes.slice(16, 28) as Uint8Array;
    const cipher: Uint8Array<ArrayBuffer> = bytes.slice(28) as Uint8Array<ArrayBuffer>;
    const key = await this.deriveKey(password, salt);
    const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv.buffer as ArrayBuffer }, key, cipher);
    return new TextDecoder().decode(dec);
  }
}
