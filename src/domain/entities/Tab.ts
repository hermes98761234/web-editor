/**
 * Entity: Tab
 * Identity-based equality — two tabs with the same id are the same tab,
 * regardless of whether their name or content has changed.
 * Encapsulates tab lifecycle behavior, not just data.
 */

import type { EncryptedContent } from '../value-objects/EncryptedContent';
import type { TabData } from '../value-objects/Workspace';

export type TabProps = {
  id: string;
  name: string;
  content: string;
  encrypted: boolean;
};

export class Tab {
  public readonly id: string;
  private _content: string;
  private _name: string;
  private _encrypted: boolean;

  constructor(id: string, name: string, content: string, encrypted: boolean = false) {
    this.id = id;
    this._name = name.trim() || 'Untitled';
    this._content = content;
    this._encrypted = encrypted;
  }

  get name(): string {
    return this._name;
  }

  get content(): string {
    return this._content;
  }

  get encrypted(): boolean {
    return this._encrypted;
  }

  /** Rename the tab. Name cannot be empty. */
  rename(newName: string): void {
    const trimmed = newName.trim();
    if (!trimmed) throw new Error('Tab name cannot be empty');
    this._name = trimmed;
  }

  /** Replace content. Content can be empty. */
  setContent(content: string): void {
    this._content = content;
  }

  /** Mark the tab as encrypted using an EncryptedContent value object. */
  encrypt(encryptedContent: EncryptedContent): void {
    this._content = encryptedContent.ciphertext;
    this._encrypted = true;
  }

  /** Decrypt the tab content back to plaintext. */
  decrypt(plaintext: string): void {
    this._content = plaintext;
    this._encrypted = false;
  }

  /** Identity-based equality. */
  equals(other: Tab): boolean {
    return this.id === other.id;
  }

  /** Convert to plain data for serialization. */
  toData(): TabData {
    return {
      id: this.id,
      name: this._name,
      content: this._content,
      encrypted: this._encrypted,
    };
  }
}
