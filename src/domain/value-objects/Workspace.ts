/**
 * Value Object: Workspace
 * Immutable snapshot of the editor workspace — all tabs and the active index.
 * Attribute-based equality: two workspaces with the same tabs and index are equal.
 */

export type TabData = {
  id: string;
  name: string;
  content: string;
  encrypted: boolean;
};

export class Workspace {
  public readonly tabs: ReadonlyArray<TabData>;
  public readonly activeIndex: number;

  constructor(tabs: ReadonlyArray<TabData>, activeIndex: number) {
    this.tabs = tabs;
    this.activeIndex = activeIndex;
  }

  /** Create a new workspace with a different active tab index. */
  withActiveIndex(index: number): Workspace {
    return new Workspace(this.tabs, index);
  }

  /** Create a new workspace with updated tabs. */
  withTabs(tabs: ReadonlyArray<TabData>): Workspace {
    return new Workspace(tabs, this.activeIndex);
  }

  /** Attribute-based equality. */
  equals(other: Workspace): boolean {
    if (this.tabs.length !== other.tabs.length) return false;
    if (this.activeIndex !== other.activeIndex) return false;
    return this.tabs.every((t, i) => {
      const o = other.tabs[i];
      return (
        t.id === o.id &&
        t.name === o.name &&
        t.content === o.content &&
        t.encrypted === o.encrypted
      );
    });
  }

  /** Serialize to a plain JSON object for persistence or sharing. */
  toJSON() {
    return {
      tabs: this.tabs,
      activeIndex: this.activeIndex,
    };
  }

  /** Deserialize from a plain JSON object. */
  static fromJSON(raw: unknown): Workspace | null {
    if (!raw || typeof raw !== 'object') return null;
    const obj = raw as Record<string, unknown>;
    if (!Array.isArray(obj.tabs) || obj.tabs.length === 0) return null;
    const activeIndex = Number(obj.activeIndex);
    if (!Number.isInteger(activeIndex) || activeIndex < 0) return null;
    const tabs: TabData[] = obj.tabs.map((t: unknown) => {
      const tab = t as Record<string, unknown>;
      return {
        id: String(tab.id ?? crypto.randomUUID()),
        name: String(tab.name ?? 'Untitled'),
        content: String(tab.content ?? ''),
        encrypted: Boolean(tab.encrypted),
      };
    });
    const safeIndex = Math.min(activeIndex, tabs.length - 1);
    return new Workspace(tabs, safeIndex);
  }
}
