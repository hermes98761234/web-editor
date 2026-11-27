/**
 * Value Object: ShareLink
 * Immutable representation of a shareable data: URI for a workspace.
 */

export class ShareLink {
  public readonly uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  /** Attribute-based equality. */
  equals(other: ShareLink): boolean {
    return this.uri === other.uri;
  }
}
