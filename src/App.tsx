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

  const activeTab = tabs[activeIndex];

  const switchTab = useCallback((i: number) => {
    if (i < 0 || i >= tabs.length || i === activeIndex) return;
    setActiveIndex(i);
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
  }, [activeTab, activeIndex, tabs]);

  const decryptCurrent = useCallback(async () => {
    if (!activeTab.encrypted) {
      setStatus('Tab is not encrypted');
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

  return (
    <div className="app">
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
              {t.encrypted && <span className="lock">🔒</span>}
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
        />
      </div>

      <footer className="status-bar">
        <span className="status-text">{status}</span>
        <span className="divider">|</span>
        <span className="tab-info">
          Tab {activeIndex + 1} of {tabs.length}
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
