import { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';

const STORAGE_KEY = 'web-editor-tabs';

type Tab = {
  id: string;
  name: string;
  content: string;
  encrypted: boolean;
};

type Workspace = {
  tabs: Tab[];
  activeIndex: number;
};

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: crypto.randomUUID(), name: 'Untitled', content: '', encrypted: false },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState('Ready');
  const [importOpen, setImportOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdTitle, setPwdTitle] = useState('Enter password');
  const [pwdValue, setPwdValue] = useState('');
  const pwdResolver = useRef<((v: string | null) => void) | null>(null);
  const [importValue, setImportValue] = useState('');
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Menu dropdown state
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Workspace = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.tabs) && parsed.tabs.length) {
          setTabs(
            parsed.tabs.map((t) => ({
              id: t.id || crypto.randomUUID(),
              name: t.name || 'Untitled',
              content: t.content ?? '',
              encrypted: !!t.encrypted,
            }))
          );
          setActiveIndex(Math.min(parsed.activeIndex ?? 0, parsed.tabs.length - 1));
          setStatus(`${parsed.tabs.length} tab(s) loaded from browser storage`);
        }
      }
    } catch (e) {
      console.warn('Failed to load tabs', e);
    }
  }, []);

  // Persist whenever tabs or activeIndex change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tabs, activeIndex })
      );
    } catch (e) {
      console.warn('Failed to save tabs', e);
      setStatus('Storage full or unavailable — changes not persisted');
    }
  }, [tabs, activeIndex]);

  // Close menus when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[role="menu"]')) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const activeTab = tabs[activeIndex];

  const switchTab = useCallback((i: number) => {
    if (i < 0 || i >= tabs.length || i === activeIndex) return;
    setActiveIndex(i);
    setOpenMenu(null);
  }, [tabs.length, activeIndex]);

  const newTab = useCallback(() => {
    const t: Tab = {
      id: crypto.randomUUID(),
      name: 'Untitled',
      content: '',
      encrypted: false,
    };
    setTabs([...tabs, t]);
    setActiveIndex(tabs.length);
    setOpenMenu(null);
  }, [tabs.length]);

  const closeTab = useCallback((i: number) => {
    if (tabs.length === 1) {
      setTabs([{ id: crypto.randomUUID(), name: 'Untitled', content: '', encrypted: false }]);
      setActiveIndex(0);
    } else {
      const next = tabs.filter((_, idx) => idx !== i);
      setTabs(next);
      setActiveIndex(Math.min(activeIndex, next.length - 1));
    }
    setOpenMenu(null);
  }, [tabs, activeIndex]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTabs(
      tabs.map((t, idx) =>
        idx === activeIndex ? { ...t, content: e.target.value } : t
      )
    );
  }, [tabs, activeIndex]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Workspace link copied to clipboard');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setStatus('Workspace link copied to clipboard');
    }
    setOpenMenu(null);
  };

  const exportShareLink = useCallback(() => {
    const payload: Workspace = { tabs, activeIndex };
    const json = JSON.stringify(payload);
    const uri = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(json)));
    copyToClipboard(uri);
  }, [tabs, activeIndex]);

  const importFromUri = useCallback((uriText: string) => {
    let uri = uriText.trim();
    if (!uri) return;
    try {
      if (uri.startsWith('data:')) {
        const comma = uri.indexOf(',');
        const meta = uri.slice(5, comma);
        const data = uri.slice(comma + 1);
        const isBase64 = meta.includes(';base64');
        let decoded = isBase64 ? atob(data) : decodeURIComponent(data);
        if (meta.includes('charset=utf-8') || !isBase64) {
          decoded = decodeURIComponent(escape(decoded));
        }
        const parsed: Workspace = JSON.parse(decoded);
        if (parsed && Array.isArray(parsed.tabs) && parsed.tabs.length) {
          setTabs(
            parsed.tabs.map((t) => ({
              id: t.id || crypto.randomUUID(),
              name: t.name || 'Untitled',
              content: t.content ?? '',
              encrypted: !!t.encrypted,
            }))
          );
          setActiveIndex(Math.min(parsed.activeIndex ?? 0, parsed.tabs.length - 1));
          setImportOpen(false);
          setStatus('Workspace imported from link');
          setOpenMenu(null);
          return;
        }
      }
      setStatus('Invalid share link');
    } catch {
      setStatus('Failed to import link');
    }
  }, [setImportOpen]);

  // ---- Encryption (Web Crypto AES-GCM + PBKDF2) ----
  async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  const encryptCurrent = useCallback(async () => {
    const pwd = await promptPassword('Enter password to encrypt this tab');
    if (!pwd) return;
    try {
      const saltRaw = crypto.getRandomValues(new Uint8Array(16));
      const ivRaw = crypto.getRandomValues(new Uint8Array(12));
      const salt: Uint8Array<ArrayBuffer> = new Uint8Array<ArrayBuffer>(saltRaw.buffer as ArrayBuffer, saltRaw.byteOffset, saltRaw.byteLength);
      const iv: Uint8Array<ArrayBuffer> = new Uint8Array<ArrayBuffer>(ivRaw.buffer as ArrayBuffer, ivRaw.byteOffset, ivRaw.byteLength);
      const key = await deriveKey(pwd, salt);
      const enc = new TextEncoder();
      const cipher = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        enc.encode(activeTab.content)
      );
      const combined: Uint8Array<ArrayBuffer> = new Uint8Array(salt.length + iv.length + cipher.byteLength) as Uint8Array<ArrayBuffer>;
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(cipher), salt.length + iv.length);
      const encoded = btoa(String.fromCharCode(...combined));
      setTabs(
        tabs.map((t, idx) =>
          idx === activeIndex ? { ...t, content: encoded, encrypted: true } : t
        )
      );
      setStatus('Tab encrypted');
    } catch {
      setStatus('Encryption failed');
    }
    setOpenMenu(null);
  }, [activeTab, activeIndex, tabs]);

  const decryptCurrent = useCallback(async () => {
    if (!activeTab.encrypted) {
      setStatus('Tab is not encrypted');
      setOpenMenu(null);
      return;
    }
    const pwd = await promptPassword('Enter password to decrypt this tab');
    if (!pwd) return;
    try {
      const data = atob(activeTab.content);
      const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(data.length) as Uint8Array<ArrayBuffer>;
      for (let i = 0; i < data.length; i++) bytes[i] = data.charCodeAt(i);
      const salt: Uint8Array<ArrayBuffer> = bytes.slice(0, 16);
      const iv: Uint8Array<ArrayBuffer> = bytes.slice(16, 28);
      const cipher: Uint8Array<ArrayBuffer> = bytes.slice(28);
      const key = await deriveKey(pwd, salt);
      const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
      setTabs(
        tabs.map((t, idx) =>
          idx === activeIndex
            ? { ...t, content: new TextDecoder().decode(dec), encrypted: false }
            : t
        )
      );
      setStatus('Tab decrypted');
    } catch {
      setStatus('Decryption failed — wrong password?');
    }
    setOpenMenu(null);
  }, [activeTab, activeIndex, tabs]);

  function promptPassword(title: string): Promise<string | null> {
    return new Promise((resolve) => {
      pwdResolver.current = resolve;
      setPwdTitle(title);
      setPwdValue('');
      setPwdOpen(true);
    });
  }

  const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c] || c));

  const menuItem = (label: string, shortcut: string | null, onClick: () => void) => (
    <button
      type="button"
      className="menu-item"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <span className="menu-label">{label}</span>
      {shortcut && <span className="menu-shortcut">{shortcut}</span>}
    </button>
  );

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const mod = isMac ? '⌘' : 'Ctrl';

  return (
    <div className="app">
      {/* Top menu bar — real editor style */}
      <nav className="menubar" role="menubar" aria-label="Main menu">
        <div className="menu">
          <button
            type="button"
            className={`menu-title ${openMenu === 'file' ? 'menu-open' : ''}`}
            aria-haspopup="true"
            aria-expanded={openMenu === 'file'}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === 'file' ? null : 'file');
            }}
          >
            File
          </button>
          {openMenu === 'file' && (
            <div className="menu-dropdown" role="menu">
              {menuItem('New tab', `${mod}+N`, newTab)}
              {menuItem('Share workspace', `${mod}+S`, exportShareLink)}
              {menuItem('Import workspace', `${mod}+O`, () => setImportOpen(true))}
              <div className="menu-separator" />
              {menuItem('Encrypt tab', null, encryptCurrent)}
              {menuItem('Decrypt tab', null, decryptCurrent)}
              <div className="menu-separator" />
              {menuItem('Close tab', `${mod}+W`, () => closeTab(activeIndex))}
            </div>
          )}
        </div>

        <div className="menu">
          <button
            type="button"
            className={`menu-title ${openMenu === 'edit' ? 'menu-open' : ''}`}
            aria-haspopup="true"
            aria-expanded={openMenu === 'edit'}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === 'edit' ? null : 'edit');
            }}
          >
            Edit
          </button>
          {openMenu === 'edit' && (
            <div className="menu-dropdown" role="menu">
              {menuItem('Undo', `${mod}+Z`, () => { editorRef.current?.focus(); document.execCommand('undo'); setOpenMenu(null); })}
              {menuItem('Redo', `${mod}+Shift+Z`, () => { editorRef.current?.focus(); document.execCommand('redo'); setOpenMenu(null); })}
              <div className="menu-separator" />
              {menuItem('Cut', `${mod}+X`, () => { editorRef.current?.focus(); document.execCommand('cut'); setOpenMenu(null); })}
              {menuItem('Copy', `${mod}+C`, () => { editorRef.current?.focus(); document.execCommand('copy'); setOpenMenu(null); })}
              {menuItem('Paste', `${mod}+V`, () => { editorRef.current?.focus(); document.execCommand('paste'); setOpenMenu(null); })}
              {menuItem('Select all', `${mod}+A`, () => { editorRef.current?.focus(); editorRef.current?.select(); setOpenMenu(null); })}
            </div>
          )}
        </div>

        <div className="menu">
          <button
            type="button"
            className={`menu-title ${openMenu === 'settings' ? 'menu-open' : ''}`}
            aria-haspopup="true"
            aria-expanded={openMenu === 'settings'}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === 'settings' ? null : 'settings');
            }}
          >
            Settings
          </button>
          {openMenu === 'settings' && (
            <div className="menu-dropdown" role="menu">
              {menuItem('Theme: dark', null, () => { setStatus('Theme: dark'); setOpenMenu(null); })}
              {menuItem('Font size: default', null, () => { setStatus('Font size: default'); setOpenMenu(null); })}
              {menuItem('Wrap lines', null, () => { setStatus('Wrap lines toggled'); setOpenMenu(null); })}
            </div>
          )}
        </div>

        <div className="menu">
          <button
            type="button"
            className={`menu-title ${openMenu === 'about' ? 'menu-open' : ''}`}
            aria-haspopup="true"
            aria-expanded={openMenu === 'about'}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === 'about' ? null : 'about');
            }}
          >
            About
          </button>
          {openMenu === 'about' && (
            <div className="menu-dropdown" role="menu">
              <div className="menu-item menu-about">
                <span className="menu-label">Web Editor</span>
                <span className="menu-about-sub">Multi-tab text editor · save & share via data URI · AES-GCM encryption</span>
              </div>
              <div className="menu-separator" />
              {menuItem('GitHub repo', null, () => { window.open('https://github.com/hermes98761234/web-editor', '_blank'); setOpenMenu(null); })}
            </div>
          )}
        </div>
      </nav>

      <header className="toolbar">
        <div className="brand">Web Editor</div>
        <div className="toolbar-right">
          <button onClick={newTab} title="New tab">
            + New
          </button>
          <button onClick={exportShareLink} title="Share as link (data URI)">
            Share
          </button>
          <button onClick={() => setImportOpen(true)} title="Import from link">
            Import
          </button>
          <button onClick={encryptCurrent} title="Encrypt current tab">
            Encrypt
          </button>
          <button onClick={decryptCurrent} title="Decrypt current tab">
            Decrypt
          </button>
        </div>
      </header>

      <div className="tabs-bar" role="tablist" aria-label="Editor tabs">
        <div id="tab-list">
          {tabs.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className={`tab ${i === activeIndex ? 'active' : ''} ${
                t.encrypted ? 'tab-encrypted' : ''
              }`}
              onClick={() => switchTab(i)}
            >
              <span className="tab-name">{escapeHtml(t.name)}</span>
              {t.encrypted && <span className="tab-lock" title="Encrypted tab">Enc</span>}
              <button
                type="button"
                className="tab-close"
                aria-label="Close tab"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(i);
                }}
              >
                ×
              </button>
            </button>
          ))}
        </div>
        <div className="tabs-spacer" />
      </div>

      <div className="editor-area">
        <textarea
          id="editor"
          spellCheck={false}
          wrap="soft"
          value={activeTab.content}
          onChange={handleContentChange}
          aria-label="File content"
          ref={editorRef}
        />
      </div>

      <footer className="status-bar">
        <span className="status-text">{status}</span>
        <span className="divider">|</span>
        <span className="tab-info">
          Tab {activeIndex + 1} of {tabs.length}
        </span>
        <span className="divider">|</span>
        <span className="word-count">
          {activeTab.content.trim().split(/\s+/).filter(Boolean).length} words
        </span>
        {activeTab.encrypted && <span className="badge">Encrypted</span>}
      </footer>

      {/* Import dialog */}
      {importOpen && (
        <dialog className="dlg" open onClose={() => setImportOpen(false)}>
          <form method="dialog">
            <h3>Import from link</h3>
            <p>Paste a data: URI or encrypted share link:</p>
            <textarea
              value={importValue}
              onChange={(e) => setImportValue(e.target.value)}
              rows={4}
            />
            <div className="dlg-actions">
              <button type="button" onClick={() => setImportOpen(false)}>
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  importFromUri(importValue);
                }}
              >
                Import
              </button>
            </div>
          </form>
        </dialog>
      )}

      {/* Password dialog */}
      {pwdOpen && (
        <dialog className="dlg" open onClose={() => setPwdOpen(false)}>
          <form method="dialog">
            <h3>{pwdTitle}</h3>
            <input
              type="password"
              value={pwdValue}
              onChange={(e) => setPwdValue(e.target.value)}
              placeholder="Password"
              autoFocus
            />
            <div className="dlg-actions">
              <button
                type="button"
                onClick={() => {
                  setPwdOpen(false);
                  const r = pwdResolver.current;
                  pwdResolver.current = null;
                  r?.(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  setPwdOpen(false);
                  const r = pwdResolver.current;
                  pwdResolver.current = null;
                  r?.(pwdValue);
                }}
              >
                OK
              </button>
            </div>
          </form>
        </dialog>
      )}
    </div>
  );
}

