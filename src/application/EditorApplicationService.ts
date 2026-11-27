/**
 * Application Service: EditorApplicationService
 * Orchestrates domain operations for the editor use case layer.
 * Coordinates between repositories, domain services, and the UI.
 */

import { Tab } from '../domain/entities/Tab';
import { TabFactory } from '../domain/factories/TabFactory';
import type { TabRepository } from '../domain/services/TabRepository';
import type { EncryptionService } from '../domain/services/EncryptionService';
import type { ExportService } from '../domain/services/ExportService';
import type { ImportService } from '../domain/services/ImportService';
import { EncryptedContent } from '../domain/value-objects/EncryptedContent';
import { ShareLink } from '../domain/value-objects/ShareLink';
import { Workspace } from '../domain/value-objects/Workspace';

export class EditorApplicationService {
  private repository: TabRepository;
  private encryption: EncryptionService;
  private exportService: ExportService;
  private importService: ImportService;
  private factory: TabFactory;
  private tabs: Tab[] = [];
  private activeIndex = 0;

  constructor(
    repository: TabRepository,
    encryption: EncryptionService,
    exportService: ExportService,
    importService: ImportService,
    factory: TabFactory
  ) {
    this.repository = repository;
    this.encryption = encryption;
    this.exportService = exportService;
    this.importService = importService;
    this.factory = factory;
  }

  /** Initialize the service by loading persisted tabs. */
  async initialize(): Promise<void> {
    this.tabs = await this.repository.loadAll();
    if (this.tabs.length === 0) {
      this.tabs = [this.factory.createUntitled()];
      this.activeIndex = 0;
    } else {
      this.activeIndex = Math.min(this.activeIndex, this.tabs.length - 1);
    }
  }

  /** Get the current workspace snapshot (immutable). */
  getWorkspace(): Workspace {
    return new Workspace(
      this.tabs.map((t) => t.toData()),
      this.activeIndex
    );
  }

  /** Get the active tab. */
  getActiveTab(): Tab {
    return this.tabs[this.activeIndex];
  }

  /** Get the active tab index. */
  getActiveIndex(): number {
    return this.activeIndex;
  }

  /** Get total tab count. */
  getTabCount(): number {
    return this.tabs.length;
  }

  /** Switch to a different tab by index. */
  switchTab(index: number): boolean {
    if (index < 0 || index >= this.tabs.length || index === this.activeIndex) {
      return false;
    }
    this.activeIndex = index;
    return true;
  }

  /** Create a new untitled tab and make it active. */
  newTab(): void {
    const tab = this.factory.createUntitled();
    this.tabs.push(tab);
    this.activeIndex = this.tabs.length - 1;
    this.persist();
  }

  /** Close the tab at the given index. */
  closeTab(index: number): void {
    if (this.tabs.length === 1) {
      // Replace the only tab with a fresh one instead of removing it
      this.tabs[0] = this.factory.createUntitled();
      this.activeIndex = 0;
    } else {
      this.tabs.splice(index, 1);
      if (this.activeIndex >= this.tabs.length) {
        this.activeIndex = this.tabs.length - 1;
      }
    }
    this.persist();
  }

  /** Update the active tab's content. */
  setActiveContent(content: string): void {
    this.tabs[this.activeIndex].setContent(content);
    this.persist();
  }

  /** Rename the active tab. */
  renameActiveTab(newName: string): void {
    this.tabs[this.activeIndex].rename(newName);
    this.persist();
  }

  /** Encrypt the active tab with a password. */
  async encryptActiveTab(password: string): Promise<void> {
    const tab = this.tabs[this.activeIndex];
    const encrypted = await this.encryption.encrypt(tab.content, password);
    tab.encrypt(encrypted);
    this.persist();
  }

  /** Decrypt the active tab with a password. */
  async decryptActiveTab(password: string): Promise<boolean> {
    const tab = this.tabs[this.activeIndex];
    if (!tab.encrypted) return false;
    const encryptedContent = new EncryptedContent(tab.content, '', '');
    try {
      const plaintext = await this.encryption.decrypt(encryptedContent, password);
      tab.decrypt(plaintext);
      this.persist();
      return true;
    } catch {
      return false;
    }
  }

  /** Export the current workspace as a share link. */
  exportWorkspace(): ShareLink {
    return this.exportService.export(this.getWorkspace());
  }

  /** Import a workspace from a share link. Returns false if invalid. */
  importWorkspace(uri: string): boolean {
    const workspace = this.importService.import(uri);
    if (!workspace) return false;
    this.tabs = workspace.tabs.map((d) => this.factory.fromData(d));
    this.activeIndex = workspace.activeIndex;
    this.persist();
    return true;
  }

  /** Persist the current state to the repository. */
  private persist(): void {
    void this.repository.saveAll(this.tabs);
  }
}
