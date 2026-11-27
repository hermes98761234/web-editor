/**
 * Domain Service: ExportService
 * Stateless operation for creating share links from a workspace.
 */

import { ShareLink } from '../value-objects/ShareLink';
import type { Workspace } from '../value-objects/Workspace';

export interface ExportService {
  /** Create a share link (data: URI) from a workspace. */
  export(workspace: Workspace): ShareLink;
}
