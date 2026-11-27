/**
 * Infrastructure: WebCryptoImportService
 * Parses a share link (data: URI) back into a workspace.
 * Implements the domain-level ImportService interface.
 */

import { Workspace } from '../domain/value-objects/Workspace';
import type { ImportService } from '../domain/services/ImportService';

export class WebCryptoImportService implements ImportService {
  import(uri: string): Workspace | null {
    let input = uri.trim();
    if (!input) return null;
    try {
      if (!input.startsWith('data:')) return null;
      const comma = input.indexOf(',');
      if (comma === -1) return null;
      const meta = input.slice(5, comma);
      const data = input.slice(comma + 1);
      const isBase64 = meta.includes(';base64');
      let decoded = isBase64 ? atob(data) : decodeURIComponent(data);
      if (meta.includes('charset=utf-8') || !isBase64) {
        decoded = decodeURIComponent(escape(decoded));
      }
      const parsed = JSON.parse(decoded);
      return Workspace.fromJSON(parsed);
    } catch {
      return null;
    }
  }
}
