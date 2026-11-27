/**
 * Component: Menubar
 * Top menu bar — File, Edit, Settings, About — like a real desktop editor.
 */

import { EditorApplicationService } from '../../application/EditorApplicationService';

interface MenubarProps {
  app: EditorApplicationService;
  onNewTab: () => void;
  onCloseTab: () => void;
  onExport: () => void;
  onImport: () => void;
  onEncrypt: () => void;
  onDecrypt: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
}

export function Menubar(props: MenubarProps) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const mod = isMac ? '⌘' : 'Ctrl';

  return (
    <nav className="menubar" role="menubar" aria-label="Main menu">
      <div className="menu">
        <button type="button" className="menu-title">File</button>
        <div className="menu-dropdown" role="menu">
          <button type="button" className="menu-item" onClick={props.onNewTab}>
            <span className="menu-label">New tab</span>
            <span className="menu-shortcut">{mod}+N</span>
          </button>
          <button type="button" className="menu-item" onClick={props.onExport}>
            <span className="menu-label">Share workspace</span>
            <span className="menu-shortcut">{mod}+S</span>
          </button>
          <button type="button" className="menu-item" onClick={props.onImport}>
            <span className="menu-label">Import workspace</span>
            <span className="menu-shortcut">{mod}+O</span>
          </button>
          <div className="menu-separator" />
          <button type="button" className="menu-item" onClick={props.onEncrypt}>
            <span className="menu-label">Encrypt tab</span>
          </button>
          <button type="button" className="menu-item" onClick={props.onDecrypt}>
            <span className="menu-label">Decrypt tab</span>
          </button>
          <div className="menu-separator" />
          <button type="button" className="menu-item" onClick={props.onCloseTab}>
            <span className="menu-label">Close tab</span>
            <span className="menu-shortcut">{mod}+W</span>
          </button>
        </div>
      </div>

      <div className="menu">
        <button type="button" className="menu-title">Edit</button>
        <div className="menu-dropdown" role="menu">
          <button type="button" className="menu-item" onClick={props.onUndo}>
            <span className="menu-label">Undo</span>
            <span className="menu-shortcut">{mod}+Z</span>
          </button>
          <button type="button" className="menu-item" onClick={props.onRedo}>
            <span className="menu-label">Redo</span>
            <span className="menu-shortcut">{mod}+Shift+Z</span>
          </button>
          <div className="menu-separator" />
          <button type="button" className="menu-item" onClick={props.onCut}>
            <span className="menu-label">Cut</span>
            <span className="menu-shortcut">{mod}+X</span>
          </button>
          <button type="button" className="menu-item" onClick={props.onCopy}>
            <span className="menu-label">Copy</span>
            <span className="menu-shortcut">{mod}+C</span>
          </button>
          <button type="button" className="menu-item" onClick={props.onPaste}>
            <span className="menu-label">Paste</span>
            <span className="menu-shortcut">{mod}+V</span>
          </button>
          <button type="button" className="menu-item" onClick={props.onSelectAll}>
            <span className="menu-label">Select all</span>
            <span className="menu-shortcut">{mod}+A</span>
          </button>
        </div>
      </div>

      <div className="menu">
        <button type="button" className="menu-title">Settings</button>
        <div className="menu-dropdown" role="menu">
          <button type="button" className="menu-item">
            <span className="menu-label">Theme: dark</span>
          </button>
          <button type="button" className="menu-item">
            <span className="menu-label">Font size: default</span>
          </button>
          <button type="button" className="menu-item">
            <span className="menu-label">Wrap lines</span>
          </button>
        </div>
      </div>

      <div className="menu">
        <button type="button" className="menu-title">About</button>
        <div className="menu-dropdown" role="menu">
          <button type="button" className="menu-item menu-about">
            <span className="menu-label">Web Editor</span>
            <span className="menu-about-sub">
              Multi-tab text editor · save & share via data URI · AES-GCM encryption
            </span>
          </button>
          <div className="menu-separator" />
          <button
            type="button"
            className="menu-item"
            onClick={() => {
              window.open('https://github.com/hermes98761234/web-editor', '_blank');
            }}
          >
            <span className="menu-label">GitHub repo</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
