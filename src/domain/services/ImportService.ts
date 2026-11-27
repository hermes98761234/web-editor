/**
 * Domain Service: ImportService
 * Stateless operation for parsing a share link back into a workspace.
 */

import type { Workspace } from '../value-objects/Workspace';

export interface ImportService {
  /** Parse a share link (data: URI) into a Workspace. Returns null if invalid. */
  import(uri: string): Workspace | null;
}
