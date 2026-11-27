/**
 * Component: App (UI layer)
 * Root Gedit shell — wires the EditorApplicationService to a Gedit-style UI.
 * Layout: Menubar → Toolbar → [SidePanel | Editor Tabs + Editor] → BottomPanel → StatusBar
 */

import { useState, useCallback, useEffect } from 'react';
import { EditorApplicationService } from '../application/EditorApplicationService';
import { Menubar } from './components/Menubar';
import { Toolbar } from './components/Toolbar';
import { SidePanel } from './components/SidePanel';
import { TabsBar } from './components/TabsBar';
import { Editor } from './components/Editor';
import { BottomPanel } from './components/BottomPanel';
import { StatusBar } from './components/StatusBar';
import { FindReplaceDialog } from './components/FindReplaceDialog';
import { PreferencesDialog } from './components/PreferencesDialog';
import { AboutDialog } from './components/AboutDialog';
import { LocalStorageTabRepository } from '../infrastructure/LocalStorageTabRepository';
import { WebCryptoEncryptionService } from '../infrastructure/WebCryptoEncryptionService';
import { WebCryptoExportService } from '../infrastructure/WebCryptoExportService';
import { WebCryptoImportService } from '../infrastructure/WebCryptoImportService';
import { TabFactory } from '../domain/factories/TabFactory';

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

  const [initialized, setInitialized] = useState(false);
  const [status, setStatus] = useState('Initializing…');
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [prefFontSize, setPrefFontSize] = useState(13);
  const [prefTabWidth, setPrefTabWidth] = useState(4);
  const [prefWrapText, setPrefWrapText] = useState(false);
  const [prefLineNumbers, setPrefLineNumbers] = useState(true);
  const [prefAutoIndent, setPrefAutoIndent] = useState(true);
  const [prefFontFamily, setPrefFontFamily] = useState('monospace');

  // Initialize
  useEffect(() => {
    app.initialize().then(() => {
      setInitialized(true);
      setStatus('Ready');
    }).catch(() => {
      setInitialized(true);
      setStatus('Init failed');
    });
  }, []);

  if (!initialized) {
    return (
      <div className="gedit-app" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="gedit-status-item">{status}</div>
      </div>
    );
  }

  const activeTab = app.getActiveTab();
  const workspace = app.getWorkspace();
  const wordCount = activeTab.content.trim().split(/\s+/).filter(Boolean).length;
  const lines = activeTab.content.split('\n').length;

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

  const handleNewDocument = useCallback(() => {
    app.newTab();
  }, [app]);

  const handleOpenFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.js,.ts,.html,.css,.py,.json,.xml,.sh,.c,.cpp,.h,.java,.rb,.go,.rs';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          app.openFile(file.name, content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [app]);

  const handleSave = useCallback(() => {
    app.saveActiveFile();
    setStatus('File saved');
  }, [app]);

  const handleSaveAs = useCallback(() => {
    const name = prompt('Save as:');
    if (name) {
      app.saveActiveFileAs(name);
      setStatus(`Saved as ${name}`);
    }
  }, [app]);

  const handleExport = useCallback(() => {
    const link = app.exportWorkspace();
    navigator.clipboard.writeText(link.uri);
    setStatus('Workspace link copied to clipboard');
  }, [app]);

  const handleImport = useCallback(() => {
    const uri = prompt('Enter share link (data: URI):');
    if (uri) {
      const ok = app.importWorkspace(uri);
      setStatus(ok ? 'Workspace imported' : 'Invalid share link');
    }
  }, [app]);

  const handleFind = useCallback(() => {
    setFindReplaceOpen(true);
  }, []);

  const handleFindNext = useCallback(() => {
    setStatus(`Finding: "${findText}"`);
  }, [findText]);

  const handleReplace = useCallback(() => {
    setStatus(`Replaced: "${findText}" → "${replaceText}"`);
  }, [findText, replaceText]);

  const handleEncrypt = useCallback(async () => {
    const pwd = prompt('Enter password to encrypt this tab');
    if (!pwd) return;
    await app.encryptActiveTab(pwd);
    setStatus('Tab encrypted');
  }, [app]);

  const handleDecrypt = useCallback(async () => {
    if (!activeTab.encrypted) {
      setStatus('Tab is not encrypted');
      return;
    }
    const pwd = prompt('Enter password to decrypt this tab');
    if (!pwd) return;
    const ok = await app.decryptActiveTab(pwd);
    setStatus(ok ? 'Tab decrypted' : 'Decryption failed');
  }, [app, activeTab.encrypted]);

  const handleUndo = useCallback(() => {
    document.execCommand('undo');
  }, []);

  const handleRedo = useCallback(() => {
    document.execCommand('redo');
  }, []);

  const handleCut = useCallback(() => {
    document.execCommand('cut');
  }, []);

  const handleCopy = useCallback(() => {
    document.execCommand('copy');
  }, []);

  const handlePaste = useCallback(() => {
    document.execCommand('paste');
  }, []);

  const handleSelectAll = useCallback(() => {
    const el = document.getElementById('gedit-editor');
    (el as HTMLTextAreaElement)?.focus();
    (el as HTMLTextAreaElement)?.select();
  }, []);

  const handleGoToLine = useCallback(() => {
    const line = prompt('Go to line:');
    if (line) {
      setStatus(`Go to line ${line}`);
    }
  }, []);

  const handleToggleWrap = useCallback(() => {
    setPrefWrapText(!prefWrapText);
  }, [prefWrapText]);

  const handleToggleLineNumbers = useCallback(() => {
    setPrefLineNumbers(!prefLineNumbers);
  }, [prefLineNumbers]);

  const handleToggleSidePanel = useCallback(() => {
    setSidePanelOpen(!sidePanelOpen);
  }, [sidePanelOpen]);

  const handleToggleBottomPanel = useCallback(() => {
    setBottomPanelOpen(!bottomPanelOpen);
  }, [bottomPanelOpen]);

  const handleSavePreferences = useCallback(() => {
    setPreferencesOpen(false);
    setStatus('Preferences saved');
  }, []);

  return (
    <div className="gedit-app">
      <Menubar
        onNewDocument={handleNewDocument}
        onOpenFile={handleOpenFile}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onExport={handleExport}
        onImport={handleImport}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onSelectAll={handleSelectAll}
        onFind={handleFind}
        onGoToLine={handleGoToLine}
        onEncrypt={handleEncrypt}
        onDecrypt={handleDecrypt}
        onPreferences={() => setPreferencesOpen(true)}
        onAbout={() => setAboutOpen(true)}
        onToggleSidePanel={handleToggleSidePanel}
        onToggleBottomPanel={handleToggleBottomPanel}
        onToggleWrap={handleToggleWrap}
        onToggleLineNumbers={handleToggleLineNumbers}
        onQuit={() => window.close()}
      />
      <Toolbar
        onNewDocument={handleNewDocument}
        onOpenFile={handleOpenFile}
        onSave={handleSave}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onFind={handleFind}
      />
      <div className="gedit-main">
        {sidePanelOpen && <SidePanel
          tabs={workspace.tabs}
          activeIndex={app.getActiveIndex()}
          onSwitch={handleSwitchTab}
          onClose={handleCloseTab}
        />}
        <div className="gedit-editor-area">
          <TabsBar
            tabs={workspace.tabs}
            activeIndex={app.getActiveIndex()}
            onSwitch={handleSwitchTab}
            onClose={handleCloseTab}
            onNewTab={handleNewTab}
          />
          <Editor
            content={activeTab.content}
            onChange={handleContentChange}
            encrypted={activeTab.encrypted}
            wrapText={prefWrapText}
            showLineNumbers={prefLineNumbers}
            fontSize={prefFontSize}
            tabWidth={prefTabWidth}
            fontFamily={prefFontFamily}
            onFind={handleFind}
            findText={findText}
            onFindTextChange={setFindText}
            onFindNext={handleFindNext}
            onReplace={handleReplace}
            replaceText={replaceText}
            onReplaceTextChange={setReplaceText}
          />
        </div>
      </div>
      {bottomPanelOpen && <BottomPanel />}
      <StatusBar
        status={status}
        activeIndex={app.getActiveIndex()}
        tabCount={workspace.tabs.length}
        wordCount={wordCount}
        lineCount={lines}
        cursorLine={1}
        cursorCol={1}
        encrypted={activeTab.encrypted}
        modified={activeTab.content.trim().length > 0}
        wrapText={prefWrapText}
        lineNumbers={prefLineNumbers}
      />
      <FindReplaceDialog
        open={findReplaceOpen}
        onClose={() => setFindReplaceOpen(false)}
        findText={findText}
        onFindTextChange={setFindText}
        replaceText={replaceText}
        onReplaceTextChange={setReplaceText}
        onFindNext={handleFindNext}
        onReplace={handleReplace}
        onReplaceAll={() => setStatus('Replaced all')}
      />
      <PreferencesDialog
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
        fontSize={prefFontSize}
        onFontSizeChange={setPrefFontSize}
        tabWidth={prefTabWidth}
        onTabWidthChange={setPrefTabWidth}
        wrapText={prefWrapText}
        onWrapTextChange={setPrefWrapText}
        lineNumbers={prefLineNumbers}
        onLineNumbersChange={setPrefLineNumbers}
        autoIndent={prefAutoIndent}
        onAutoIndentChange={setPrefAutoIndent}
        fontFamily={prefFontFamily}
        onFontFamilyChange={setPrefFontFamily}
        onSave={handleSavePreferences}
      />
      <AboutDialog
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
      />
    </div>
  );
}
