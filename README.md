# Web Editor

A self-contained, multi-tab text editor that runs entirely in the browser. No login, no uploads, no build step — your data never leaves your device.

## Features

- **Multi-tab editing** — open several files at once, switch between them
- **Auto-save** — workspace is saved to browser `localStorage` automatically
- **Share via link** — export the whole workspace as a `data:` URI; anyone with the link can import it (works offline)
- **Import from link** — paste a `data:` URI to restore a workspace
- **Encryption** — encrypt/decrypt the active tab with a password (Web Crypto AES-GCM + PBKDF2)
- **Works offline** — single HTML file, no dependencies

## Usage

Open `index.html` in any modern browser, or visit the GitHub Pages deployment.

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
index.html   # application UI
style.css    # styles
app.js       # editor logic (tabs, storage, data URI, encryption)
README.md
```

## Deploy (GitHub Pages)

```bash
git add .
git commit -m "Initial release"
git push origin main
```
Then enable GitHub Pages in repo settings (source: `main` branch, `/root` folder).

## License

MIT