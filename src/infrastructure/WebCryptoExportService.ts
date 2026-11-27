/**
 * Infrastructure: WebCryptoExportService
 * Creates share links (data: URIs) from a workspace.
 * Implements the domain-level ExportService interface.
 */

import { ShareLink } from '../domain/value-objects/ShareLink';
import type { ExportService } from '../domain/services/ExportService';
import { Workspace } from '../domain/value-objects/Workspace';

export class WebCryptoExportService implements ExportService {
  export(workspace: Workspace): ShareLink {
    const json = JSON.stringify(workspace.toJSON());
    const uri = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(json)));
    return new ShareLink(uri);
  }
}
