/**
 * Factory: TabFactory
 * Encapsulates complex tab creation with invariant enforcement.
 * All invariants are enforced at creation time.
 */

import type { TabData } from '../value-objects/Workspace';
import { Tab } from '../entities/Tab';

export class TabFactory {
  /** Create a new untitled tab with a generated id. */
  createUntitled(): Tab {
    return new Tab(crypto.randomUUID(), 'Untitled', '', false);
  }

  /** Create a tab from persisted data. Validates required fields. */
  fromData(data: TabData): Tab {
    if (!data.id || typeof data.id !== 'string') {
      throw new Error('Tab data must include a non-empty id');
    }
    return new Tab(
      data.id,
      data.name ?? 'Untitled',
      data.content ?? '',
      Boolean(data.encrypted)
    );
  }
}
