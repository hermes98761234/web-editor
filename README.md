# Web Editor

A self-contained, multi-tab text editor that runs entirely in the browser. No login, no uploads, no build step — your data never leaves your device.

**Live:** https://hermes98761234.github.io/web-editor/

## Features

- **Multi-tab editing** — open several files at once, switch between them
- **Auto-save** — workspace is saved to browser `localStorage` automatically
- **Share via link** — export the whole workspace as a `data:` URI; anyone with the link can import it (works offline)
- **Import from link** — paste a `data:` URI to restore a workspace
- **Encryption** — encrypt/decrypt the active tab with a password (Web Crypto AES-GCM + PBKDF2)
- **Works offline** — single-page React + Vite + TypeScript app, no dependencies

## Usage

| Action | How |
|--------|-----|
| New tab | `+ New` |
| Switch tabs | click a tab |
| Close tab | `×` on a tab |
| Share workspace | `Share` → copies a `data:` link to clipboard |
| Import workspace | `Import` → paste a `data:` link |
| Encrypt active tab | `Encrypt` → enter password |
| Decrypt active tab | `Decrypt` → enter password |

## File layout

```
index.html   # application shell
src/App.tsx  # editor logic (tabs, storage, data URI, encryption)
src/App.css  # modern dark-theme styles (Hallmark tokens)
README.md
```

## Deploy (GitHub Pages)

```bash
git add .
git commit -m "message"
git push origin main
```
The `deploy.yml` workflow builds and publishes to GitHub Pages on every push to `main`.

## License

MIT