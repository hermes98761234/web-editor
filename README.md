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
| New tab | `+ New` or File → New tab (`⌘/Ctrl+N`) |
| Switch tabs | click a tab |
| Close tab | `×` on a tab or File → Close tab (`⌘/Ctrl+W`) |
| Share workspace | `Share` or File → Share (`⌘/Ctrl+S`) |
| Import workspace | `Import` or File → Import (`⌘/Ctrl+O`) |
| Encrypt active tab | `Encrypt` or File → Encrypt tab |
| Decrypt active tab | `Decrypt` or File → Decrypt tab |
| Undo / Redo / Cut / Copy / Paste | Edit menu (`⌘/Ctrl+Z`, `⌘/Ctrl+Shift+Z`, `⌘/Ctrl+X`, `⌘/Ctrl+C`, `⌘/Ctrl+V`) |
| Select all | Edit → Select all (`⌘/Ctrl+A`) |
| Settings | Settings menu |
| About / GitHub link | About menu |

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