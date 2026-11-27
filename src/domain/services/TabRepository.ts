/**
 * Repository interface: TabRepository
 * Collection-like interface for tab persistence.
 * Domain layer defines the interface; infrastructure implements it.
 * Only Aggregate roots (tabs) go through a repository.
 */

import { Tab } from '../entities/Tab';

export interface TabRepository {
  /** Load all persisted tabs. Returns empty array if none exist. */
  loadAll(): Promise<Tab[]>;

  /** Persist all tabs. Replaces any existing data. */
  saveAll(tabs: ReadonlyArray<Tab>): Promise<void>;

  /** Persist a single tab (upsert by id). */
  save(tab: Tab): Promise<void>;
}
