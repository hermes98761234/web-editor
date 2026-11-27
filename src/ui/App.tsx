/**
 * Component: App (UI layer)
 * Root React component. Wires the EditorApplicationService to the UI.
 * No domain logic lives here — it only handles presentation and user input.
 */

import { useState, useCallback, useEffect } from 'react';
import { EditorApplicationService } from '../application/EditorApplicationService';
import { Menubar } from './components/Menubar';
import { TabsBar } from './components/TabsBar';
import { Editor } from './components/Editor';
import { StatusBar } from './components/StatusBar';
import { Dialogs } from './components/Dialogs';
import { LocalStorageTabRepository } from '../infrastructure/LocalStorageTabRepository';
import { WebCryptoEncryptionService } from '../infrastructure/WebCryptoEncryptionService';
import { WebCryptoExportService } from '../infrastructure/WebCryptoExportService';
import { WebCryptoImportService } from '../infrastructure/WebCryptoImportService';
import { TabFactory } from '../domain/factories/TabFactory';
import './App.css';

export default function App() {
  // Dependency injection: compose infrastructure + domain + application layers
  const [app] = useState(() => {
    const repository = new LocalStorageTabRepository();
    const encryption = new WebCryptoEncryptionService();
    const exportService = new WebCryptoExportService();
    const importService = new WebCryptoImportService();
    const factory = new TabFactory();
    return new EditorApplicationService(repository, encryption, exportService, importService, factory);
  });

  const [status, setStatus] = useState('Initializing…');
  const [importOpen, setImportOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdTitle, setPwdTitle] = useState('Enter password');
  const [pwdValue, setPwdValue] = useState('');
  const [importValue, setImportValue] = useState('');

  // Initialize the application service (load persisted tabs)
  useEffect(() => {
    app.initialize().then(() => setStatus('Ready')).catch(() => setStatus('Init failed'));
  }, []);

  const activeTab = app.getActiveTab();
  const wordCount = activeTab.content.trim().split(/\s+/).filter(Boolean).length;

  const handleContentChange = useCallback((content: string) => {
    app.setActiveContent(content);
  }, [app]);

  const handleSwitchTab = useCallback((index: number) => {
    app.switchTab(index);
  }, [app]);

  const handleCloseTab = useCallback((index: number) => {
    app.closeTab(index);
  }, [app]);

  const handleNewTab = useCallback(() => {
    app.newTab();
  }, [app]);

  const handleExport = useCallback(() => {
    const link = app.exportWorkspace();
    navigator.clipboard.writeText(link.uri).then(() => {
      setStatus('Workspace link copied to clipboard');
    });
  }, [app]);

  const handleImportOpen = useCallback(() => {
    setImportValue('');
    setImportOpen(true);
  }, []);

  const handleImportSubmit = useCallback((uri: string) => {
    const ok = app.importWorkspace(uri);
    setImportOpen(false);
    setStatus(ok ? 'Workspace imported from link' : 'Invalid share link');
  }, [app]);

  const handleEncrypt = useCallback(async () => {
    const pwd = await promptPassword('Enter password to encrypt this tab');
    if (!pwd) return;
    await app.encryptActiveTab(pwd);
    setStatus('Tab encrypted');
  }, [app]);

  const handleDecrypt = useCallback(async () => {
    if (!activeTab.encrypted) {
      setStatus('Tab is not encrypted');
      return;
    }
    const pwd = await promptPassword('Enter password to decrypt this tab');
    if (!pwd) return;
    const ok = await app.decryptActiveTab(pwd);
    setStatus(ok ? 'Tab decrypted' : 'Decryption failed — wrong password?');
  }, [app, activeTab.encrypted]);

  function promptPassword(title: string): Promise<string | null> {
    return new Promise((resolve) => {
      setPwdTitle(title);
      setPwdValue('');
      setPwdOpen(true);
      (window as any).__pwdResolve = resolve;
    });
  }

  return (
    <div className="app">
      <Menubar
        app={app}
        onNewTab={handleNewTab}
        onCloseTab={() => handleCloseTab(app.getActiveIndex())}
        onExport={handleExport}
        onImport={handleImportOpen}
        onEncrypt={handleEncrypt}
        onDecrypt={handleDecrypt}
        onUndo={() => {
          document.execCommand('undo');
        }}
        onRedo={() => document.execCommand('redo')}
        onCut={() => document.execCommand('cut')}
        onCopy={() => document.execCommand('copy')}
        onPaste={() => document.execCommand('paste')}
        onSelectAll={() => {
          const el = document.getElementById('editor');
          (el as HTMLTextAreaElement)?.focus();
          (el as HTMLTextAreaElement)?.select();
        }}
      />
      <header className="toolbar">
        <div className="brand">Web Editor</div>
        <div className="toolbar-right">
          <button onClick={handleNewTab} title="New tab">
            + New
          </button>
          <button onClick={handleExport} title="Share as link (data URI)">
            Share
          </button>
          <button onClick={handleImportOpen} title="Import from link">
            Import
          </button>
          <button onClick={handleEncrypt} title="Encrypt current tab">
            Encrypt
          </button>
          <button onClick={handleDecrypt} title="Decrypt current tab">
            Decrypt
          </button>
        </div>
      </header>

      <TabsBar
        tabs={app.getWorkspace().tabs}
        activeIndex={app.getActiveIndex()}
        onSwitch={handleSwitchTab}
        onClose={handleCloseTab}
      />

      <Editor content={activeTab.content} onChange={handleContentChange} />

      <StatusBar
        status={status}
        activeIndex={app.getActiveIndex()}
        tabCount={app.getTabCount()}
        wordCount={wordCount}
        encrypted={activeTab.encrypted}
      />

      <Dialogs
        importOpen={importOpen}
        onImportClose={() => setImportOpen(false)}
        onImportSubmit={handleImportSubmit}
        importValue={importValue}
        onImportChange={setImportValue}
        pwdOpen={pwdOpen}
        onPwdClose={() => {
          setPwdOpen(false);
          (window as any).__pwdResolve?.(null);
        }}
        onPwdSubmit={(password) => {
          setPwdOpen(false);
          (window as any).__pwdResolve?.(password);
        }}
        onPwdCancel={() => {
          setPwdOpen(false);
          (window as any).__pwdResolve?.(null);
        }}
        pwdTitle={pwdTitle}
        pwdValue={pwdValue}
        onPwdChange={setPwdValue}
      />
    </div>
  );
}
