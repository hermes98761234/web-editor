/**
 * Component: App (UI layer)
 * Root Gedit shell — all state and DOM operations here.
 * Editor is pure presentational (zero hooks).
 * ALL hooks are called before any conditional return (Rules of Hooks).
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
  // Dependency injection
  const [app] = useState(() => {
    const repository = new LocalStorageTabRepository();
    const encryption = new WebCryptoEncryptionService();
    const exportService = new WebCryptoExportService();
    const importService = new WebCryptoImportService();
    const factory = new TabFactory();
    return new EditorApplicationService(repository, encryption, exportService, importService, factory);
  });

  // All useState hooks
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

  const [undoStack, setUndoStack] = useState<string[]>(['']);
  const [undoIndex, setUndoIndex] = useState(0);

  // All useEffect hooks (before any conditional return)
  useEffect(() => {
    app.initialize().then(() => {
      setInitialized(true);
      setStatus('Ready');
    }).catch(() => {
      setInitialized(true);
      setStatus('Init failed');
    });
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const content = app.getActiveTab().content;
    setUndoStack([content]);
    setUndoIndex(0);
  }, [app, initialized]);

  // Compute derived values with fallback for uninitialized state
  // (done before early return so hooks below have stable dependencies)
  const activeTab = initialized ? app.getActiveTab() : { content: '', encrypted: false, name: 'Untitled', id: '' };
  const workspace = initialized ? app.getWorkspace() : { tabs: [], activeIndex: 0 };
  const wordCount = activeTab.content.trim().split(/\s+/).filter(Boolean).length;
  const lines = activeTab.content.split('\n').length;

  // All useCallback hooks (before any conditional return)
  const handleContentChange = useCallback((content: string) => {
    app.setActiveContent(content);
    setUndoStack((prev) => {
      const next = prev.slice(0, undoIndex + 1);
      next.push(content);
      return next;
    });
    setUndoIndex((prev) => prev + 1);
  }, [app, undoIndex]);

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

  const handleFindNext = useCallback((searchText: string) => {
    const el = document.getElementById('gedit-editor') as HTMLTextAreaElement;
    if (!el || !searchText) return;
    el.focus();
    const text = el.value;
    const lowerText = text.toLowerCase();
    const lowerSearch = searchText.toLowerCase();
    const startPos = el.selectionEnd;
    let pos = lowerText.indexOf(lowerSearch, startPos);
    if (pos === -1) {
      pos = lowerText.indexOf(lowerSearch);
    }
    if (pos !== -1) {
      el.setSelectionRange(pos, pos + searchText.length);
      el.scrollTop = el.scrollHeight * (pos / text.length);
    } else {
      setStatus(`No match found for "${searchText}"`);
    }
  }, []);

  const handleReplace = useCallback((searchText: string, replaceText: string) => {
    const el = document.getElementById('gedit-editor') as HTMLTextAreaElement;
    if (!el || !searchText) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end);
    if (selected === searchText) {
      const newValue = el.value.slice(0, start) + replaceText + el.value.slice(end);
      el.value = newValue;
      el.selectionStart = start;
      el.selectionEnd = start + replaceText.length;
      app.setActiveContent(newValue);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      handleFindNext(searchText);
    }
  }, [app, handleFindNext]);

  const handleReplaceAll = useCallback((searchText: string, replaceText: string) => {
    if (!searchText) return;
    const el = document.getElementById('gedit-editor') as HTMLTextAreaElement;
    if (!el) return;
    const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const newValue = el.value.replace(regex, replaceText);
    if (newValue !== el.value) {
      el.value = newValue;
      app.setActiveContent(newValue);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      setStatus(`Replaced all occurrences of "${searchText}"`);
    }
  }, [app]);

  const handleUndo = useCallback(() => {
    if (undoIndex > 0) {
      const newIndex = undoIndex - 1;
      const content = undoStack[newIndex];
      app.setActiveContent(content);
      setUndoIndex(newIndex);
      const el = document.getElementById('gedit-editor');
      (el as HTMLTextAreaElement)?.focus();
      setStatus('Undo');
    }
  }, [app, undoStack, undoIndex]);

  const handleRedo = useCallback(() => {
    if (undoIndex < undoStack.length - 1) {
      const newIndex = undoIndex + 1;
      const content = undoStack[newIndex];
      app.setActiveContent(content);
      setUndoIndex(newIndex);
      const el = document.getElementById('gedit-editor');
      (el as HTMLTextAreaElement)?.focus();
      setStatus('Redo');
    }
  }, [app, undoStack, undoIndex]);

  const handleCut = useCallback(() => {
    const el = document.getElementById('gedit-editor') as HTMLTextAreaElement;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) return;
    const selected = el.value.slice(start, end);
    navigator.clipboard.writeText(selected);
    const newValue = el.value.slice(0, start) + el.value.slice(end);
    el.value = newValue;
    el.selectionStart = start;
    el.selectionEnd = start;
    app.setActiveContent(newValue);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, [app]);

  const handleCopy = useCallback(() => {
    const el = document.getElementById('gedit-editor') as HTMLTextAreaElement;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) return;
    navigator.clipboard.writeText(el.value.slice(start, end));
  }, []);

  const handlePaste = useCallback(async () => {
    const el = document.getElementById('gedit-editor') as HTMLTextAreaElement;
    if (!el) return;
    const text = await navigator.clipboard.readText();
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newValue = el.value.slice(0, start) + text + el.value.slice(end);
    el.value = newValue;
    el.selectionStart = start + text.length;
    el.selectionEnd = start + text.length;
    app.setActiveContent(newValue);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, [app]);

  const handleSelectAll = useCallback(() => {
    const el = document.getElementById('gedit-editor') as HTMLTextAreaElement;
    el?.focus();
    el?.select();
  }, []);

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

  const handleGoToLine = useCallback(() => {
    const line = prompt('Go to line:');
    if (!line) return;
    const lineNum = parseInt(line, 10);
    if (isNaN(lineNum) || lineNum < 1 || lineNum > lines) {
      setStatus(`Invalid line number (1-${lines})`);
      return;
    }
    const el = document.getElementById('gedit-editor') as HTMLTextAreaElement;
    if (!el) return;
    const textLines = activeTab.content.split('\n');
    let offset = 0;
    for (let i = 0; i < lineNum - 1; i++) {
      offset += textLines[i].length + 1;
    }
    el.focus();
    el.setSelectionRange(offset, offset);
    setStatus(`Line ${lineNum}`);
  }, [activeTab.content, lines]);

  const handleToggleWrap = useCallback(() => {
    setPrefWrapText((prev) => !prev);
  }, []);

  const handleToggleLineNumbers = useCallback(() => {
    setPrefLineNumbers((prev) => !prev);
  }, []);

  const handleToggleSidePanel = useCallback(() => {
    setSidePanelOpen((prev) => !prev);
  }, []);

  const handleToggleBottomPanel = useCallback(() => {
    setBottomPanelOpen((prev) => !prev);
  }, []);

  const handleSavePreferences = useCallback(() => {
    setPreferencesOpen(false);
    setStatus('Preferences saved');
  }, []);

  // Early return for uninitialized state (ALL hooks above are called every render)
  if (!initialized) {
    return (
      <div className="gedit-app" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="gedit-status-item">{status}</div>
      </div>
    );
  }

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
        onFindNext={(text: string) => handleFindNext(text)}
        onReplace={(findTxt: string, replTxt: string) => handleReplace(findTxt, replTxt)}
        onReplaceAll={(findTxt: string, replTxt: string) => handleReplaceAll(findTxt, replTxt)}
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
