/**
 * Infrastructure: LocalStorageTabRepository
 * Persists tabs to browser localStorage.
 * Implements the domain-level TabRepository interface.
 */

import { Tab } from '../domain/entities/Tab';
import type { TabRepository } from '../domain/services/TabRepository';
import { TabFactory } from '../domain/factories/TabFactory';
import type { TabData } from '../domain/value-objects/Workspace';

const STORAGE_KEY = 'web-editor-tabs';

export class LocalStorageTabRepository implements TabRepository {
  private readonly factory: TabFactory;

  constructor() {
    this.factory = new TabFactory();
  }

  async loadAll(): Promise<Tab[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.tabs)) return [];
      return parsed.tabs.map((d: unknown) => this.factory.fromData(d as TabData));
    } catch {
      return [];
    }
  }

  async saveAll(tabs: ReadonlyArray<Tab>): Promise<void> {
    const payload = {
      tabs: tabs.map((t) => t.toData()),
      activeIndex: 0,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  async save(tab: Tab): Promise<void> {
    // localStorage persists all tabs at once; single-tab save is a no-op here
    void tab;
  }
}
