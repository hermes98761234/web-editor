/* Web Editor — multi-tab text editor, runs entirely in the browser.
 * Features:
 *   - Multiple tabs, each an independent file
 *   - Auto-save to browser localStorage
 *   - Share entire workspace as a data: URI (copy link -> paste anywhere)
 *   - Import workspace from a data: URI
 *   - Encrypt / decrypt the active tab with a password (Web Crypto AES-GCM)
 */

const STORAGE_KEY = 'web-editor-tabs';

// ---------- State ----------
let tabs = [];        // { id, name, content, encrypted }
let activeIndex = 0;
let modified = false; // whether active tab has unsaved changes (in-memory only)
let encryptPassword = null; // cached for session

// ---------- DOM ----------
const tabListEl = document.getElementById('tab-list');
const editorEl = document.getElementById('editor');
const statusEl = document.getElementById('status');
const tabInfoEl = document.getElementById('tab-info');
const encryptBadgeEl = document.getElementById('encrypt-badge');

const btnNew = document.getElementById('btn-new');
const btnShare = document.getElementById('btn-share');
const btnImport = document.getElementById('btn-import');
const btnEncrypt = document.getElementById('btn-encrypt');
const btnDecrypt = document.getElementById('btn-decrypt');

const dlgImport = document.getElementById('dlg-import');
const dlgPassword = document.getElementById('dlg-password');
const importInput = document.getElementById('import-input');
const pwdInput = document.getElementById('pwd-input');

// ---------- Storage ----------
function loadTabs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        tabs = parsed.map(t => ({
          id: t.id || crypto.randomUUID(),
          name: t.name || 'Untitled',
          content: t.content ?? '',
          encrypted: !!t.encrypted,
        }));
        activeIndex = Math.min(parsed.activeIndex ?? 0, tabs.length - 1);
        return;
      }
    }
  } catch (e) {
    console.warn('Failed to load tabs', e);
  }
  tabs = [{ id: crypto.randomUUID(), name: 'Untitled', content: '', encrypted: false }];
  activeIndex = 0;
}

function saveTabs() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tabs,
      activeIndex,
    }));
  } catch (e) {
    console.warn('Failed to save tabs', e);
    setStatus('Storage full or unavailable — changes not persisted', 'warn');
  }
}

// ---------- Tab rendering ----------
function renderTabs() {
  tabListEl.innerHTML = '';
  tabs.forEach((t, i) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `tab ${i === activeIndex ? 'active' : ''}`;
    el.innerHTML = `
      <span class="tab-name">${escapeHtml(t.name)}</span>
      <button type="button" class="tab-close" aria-label="Close tab">${t.encrypted ? '🔒' : '×'}</button>
    `;
    el.addEventListener('click', () => switchTab(i));
    el.querySelector('.tab-close').addEventListener('click', (ev) => {
      ev.stopPropagation();
      closeTab(i);
    });
    tabListEl.appendChild(el);
  });
  updateEditor();
  updateTabInfo();
}

function updateEditor() {
  const t = tabs[activeIndex];
  editorEl.value = t.content;
  editorEl.disabled = false;
  editorEl.focus();
  modified = false;
  updateEncryptBadge();
}

function updateTabInfo() {
  tabInfoEl.textContent = `Tab ${activeIndex + 1} of ${tabs.length}`;
  statusEl.textContent = tabs[activeIndex].encrypted ? 'Encrypted' : 'Ready';
}

function updateEncryptBadge() {
  encryptBadgeEl.classList.toggle('hidden', !tabs[activeIndex].encrypted);
}

function setStatus(msg, kind = 'info') {
  statusEl.textContent = msg;
  statusEl.className = kind === 'warn' ? 'warn' : '';
}

// ---------- Actions ----------
function switchTab(i) {
  if (i < 0 || i >= tabs.length || i === activeIndex) return;
  activeIndex = i;
  saveTabs();
  renderTabs();
}

function newTab() {
  const t = { id: crypto.randomUUID(), name: 'Untitled', content: '', encrypted: false };
  tabs.push(t);
  activeIndex = tabs.length - 1;
  saveTabs();
  renderTabs();
}

function closeTab(i) {
  if (tabs.length === 1) {
    // clear the only tab instead of removing it
    tabs[0] = { id: crypto.randomUUID(), name: 'Untitled', content: '', encrypted: false };
    activeIndex = 0;
  } else {
    tabs.splice(i, 1);
    if (activeIndex >= tabs.length) activeIndex = tabs.length - 1;
  }
  saveTabs();
  renderTabs();
}

function renameCurrent(name) {
  if (!name.trim()) return;
  tabs[activeIndex].name = name.trim();
  saveTabs();
  renderTabs();
}

// ---------- Editor input ----------
editorEl.addEventListener('input', () => {
  tabs[activeIndex].content = editorEl.value;
  modified = true;
  saveTabs();
  renderTabs(); // re-render to show modified dot
});

// ---------- Share / Import (data: URI) ----------
async function exportShareLink() {
  const payload = { tabs, activeIndex };
  const json = JSON.stringify(payload);
  const uri = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(json)));
  copyToClipboard(uri);
  setStatus('Workspace link copied to clipboard', 'info');
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

function importFromUri(uriText) {
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
      const parsed = JSON.parse(decoded);
      if (parsed && Array.isArray(parsed.tabs) && parsed.tabs.length) {
        tabs = parsed.tabs.map(t => ({
          id: t.id || crypto.randomUUID(),
          name: t.name || 'Untitled',
          content: t.content ?? '',
          encrypted: !!t.encrypted,
        }));
        activeIndex = Math.min(parsed.activeIndex ?? 0, tabs.length - 1);
        saveTabs();
        renderTabs();
        setStatus('Workspace imported from link', 'info');
        return;
      }
    }
    setStatus('Invalid share link', 'warn');
  } catch (e) {
    console.error(e);
    setStatus('Failed to import link', 'warn');
  }
}

// ---------- Encryption (Web Crypto AES-GCM) ----------
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptCurrent() {
  const pwd = await promptPassword('Enter password to encrypt this tab');
  if (!pwd) return;
  try {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(pwd, salt);
    const enc = new TextEncoder();
    const cipher = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(tabs[activeIndex].content)
    );
    const combined = new Uint8Array(salt.length + iv.length + cipher.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(cipher), salt.length + iv.length);
    tabs[activeIndex].content = btoa(String.fromCharCode(...combined));
    tabs[activeIndex].encrypted = true;
    encryptPassword = pwd;
    saveTabs();
    renderTabs();
    setStatus('Tab encrypted', 'info');
  } catch (e) {
    console.error(e);
    setStatus('Encryption failed', 'warn');
  }
}

async function decryptCurrent() {
  const t = tabs[activeIndex];
  if (!t.encrypted) {
    setStatus('Tab is not encrypted', 'info');
    return;
  }
  const pwd = await promptPassword('Enter password to decrypt this tab');
  if (!pwd) return;
  try {
    const data = atob(t.content);
    const bytes = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) bytes[i] = data.charCodeAt(i);
    const salt = bytes.slice(0, 16);
    const iv = bytes.slice(16, 28);
    const cipher = bytes.slice(28);
    const key = await deriveKey(pwd, salt);
    const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    t.content = new TextDecoder().decode(dec);
    t.encrypted = false;
    saveTabs();
    renderTabs();
    setStatus('Tab decrypted', 'info');
  } catch (e) {
    console.error(e);
    setStatus('Decryption failed — wrong password?', 'warn');
  }
}

function promptPassword(title) {
  return new Promise((resolve) => {
    dlgPassword.querySelector('#pwd-title').textContent = title;
    pwdInput.value = '';
    const ok = dlgPassword.querySelector('#pwd-ok');
    const cancel = dlgPassword.querySelector('#pwd-cancel');

    const cleanup = () => {
      dlgPassword.close();
      ok.replaceWith(ok.cloneNode(false));
      cancel.replaceWith(cancel.cloneNode(false));
    };

    dlgPassword.showModal();

    ok.addEventListener('click', () => { cleanup(); resolve(pwdInput.value); }, { once: true });
    cancel.addEventListener('click', () => { cleanup(); resolve(null); }, { once: true });
    dlgPassword.addEventListener('close', () => { cleanup(); resolve(null); }, { once: true });
  });
}

// ---------- Dialog wiring ----------
btnNew.addEventListener('click', newTab);
btnShare.addEventListener('click', exportShareLink);
btnImport.addEventListener('click', () => {
  importInput.value = '';
  dlgImport.showModal();
});
btnEncrypt.addEventListener('click', encryptCurrent);
btnDecrypt.addEventListener('click', decryptCurrent);

document.getElementById('dlg-cancel').addEventListener('click', () => dlgImport.close());
document.getElementById('dlg-ok').addEventListener('click', () => {
  importFromUri(importInput.value);
  dlgImport.close();
});

document.getElementById('pwd-cancel').addEventListener('click', () => dlgPassword.close());
document.getElementById('pwd-ok').addEventListener('click', () => dlgPassword.close());

// ---------- Init ----------
loadTabs();
renderTabs();
setStatus(`${tabs.length} tab(s) loaded from browser storage`);
