/**
 * Component: Menubar (UI layer)
 * Gedit-style menu bar: File, Edit, View, Search, Tools, Documents, Help
 */

import { useState } from 'react';

interface MenubarProps {
  onNewDocument: () => void;
  onOpenFile: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onExport: () => void;
  onImport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onFind: () => void;
  onGoToLine: () => void;
  onEncrypt: () => void;
  onDecrypt: () => void;
  onPreferences: () => void;
  onAbout: () => void;
  onToggleSidePanel: () => void;
  onToggleBottomPanel: () => void;
  onToggleWrap: () => void;
  onToggleLineNumbers: () => void;
  onQuit: () => void;
}

export function Menubar(props: MenubarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  const closeAll = () => setOpenMenu(null);

  return (
    <>
      <nav className="gedit-menubar" role="menubar">
        <button
          className="gedit-menu-title"
          aria-expanded={openMenu === 'file'}
          onClick={() => toggleMenu('file')}
          onMouseEnter={() => setOpenMenu('file')}
        >
          File
        </button>
        <div className={`gedit-dropdown ${openMenu === 'file' ? 'gedit-dropdown-open' : ''}`} role="menu">
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onNewDocument(); closeAll(); }}>
            New<span className="gedit-shortcut">Ctrl+N</span>
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onOpenFile(); closeAll(); }}>
            Open<span className="gedit-shortcut">Ctrl+O</span>
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onSave(); closeAll(); }}>
            Save<span className="gedit-shortcut">Ctrl+S</span>
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onSaveAs(); closeAll(); }}>
            Save As…<span className="gedit-shortcut">Ctrl+Shift+S</span>
          </button>
          <div className="gedit-menu-separator" />
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onExport(); closeAll(); }}>
            Export Workspace<span className="gedit-shortcut">Ctrl+E</span>
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onImport(); closeAll(); }}>
            Import Workspace<span className="gedit-shortcut">Ctrl+I</span>
          </button>
          <div className="gedit-menu-separator" />
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onQuit(); closeAll(); }}>
            Quit<span className="gedit-shortcut">Ctrl+Q</span>
          </button>
        </div>

        <button
          className="gedit-menu-title"
          aria-expanded={openMenu === 'edit'}
          onClick={() => toggleMenu('edit')}
          onMouseEnter={() => setOpenMenu('edit')}
        >
          Edit
        </button>
        <div className={`gedit-dropdown ${openMenu === 'edit' ? 'gedit-dropdown-open' : ''}`} role="menu">
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onUndo(); closeAll(); }}>
            Undo<span className="gedit-shortcut">Ctrl+Z</span>
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onRedo(); closeAll(); }}>
            Redo<span className="gedit-shortcut">Ctrl+Y</span>
          </button>
          <div className="gedit-menu-separator" />
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onCut(); closeAll(); }}>
            Cut<span className="gedit-shortcut">Ctrl+X</span>
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onCopy(); closeAll(); }}>
            Copy<span className="gedit-shortcut">Ctrl+C</span>
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onPaste(); closeAll(); }}>
            Paste<span className="gedit-shortcut">Ctrl+V</span>
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onSelectAll(); closeAll(); }}>
            Select All<span className="gedit-shortcut">Ctrl+A</span>
          </button>
        </div>

        <button
          className="gedit-menu-title"
          aria-expanded={openMenu === 'view'}
          onClick={() => toggleMenu('view')}
          onMouseEnter={() => setOpenMenu('view')}
        >
          View
        </button>
        <div className={`gedit-dropdown ${openMenu === 'view' ? 'gedit-dropdown-open' : ''}`} role="menu">
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onToggleSidePanel(); closeAll(); }}>
            Side Panel<span className="gedit-shortcut">F9</span>
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onToggleBottomPanel(); closeAll(); }}>
            Bottom Panel<span className="gedit-shortcut">F10</span>
          </button>
          <div className="gedit-menu-separator" />
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onToggleWrap(); closeAll(); }}>
            Wrap Text<span className="gedit-shortcut">Ctrl+W</span>
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onToggleLineNumbers(); closeAll(); }}>
            Line Numbers<span className="gedit-shortcut">Ctrl+L</span>
          </button>
        </div>

        <button
          className="gedit-menu-title"
          aria-expanded={openMenu === 'search'}
          onClick={() => toggleMenu('search')}
          onMouseEnter={() => setOpenMenu('search')}
        >
          Search
        </button>
        <div className={`gedit-dropdown ${openMenu === 'search' ? 'gedit-dropdown-open' : ''}`} role="menu">
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onFind(); closeAll(); }}>
            Find…<span className="gedit-shortcut">Ctrl+F</span>
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { closeAll(); }}>
            Find and Replace…<span className="gedit-shortcut">Ctrl+H</span>
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onGoToLine(); closeAll(); }}>
            Go to Line<span className="gedit-shortcut">Ctrl+G</span>
          </button>
        </div>

        <button
          className="gedit-menu-title"
          aria-expanded={openMenu === 'tools'}
          onClick={() => toggleMenu('tools')}
          onMouseEnter={() => setOpenMenu('tools')}
        >
          Tools
        </button>
        <div className={`gedit-dropdown ${openMenu === 'tools' ? 'gedit-dropdown-open' : ''}`} role="menu">
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onEncrypt(); closeAll(); }}>
            Encrypt Tab
          </button>
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onDecrypt(); closeAll(); }}>
            Decrypt Tab
          </button>
          <div className="gedit-menu-separator" />
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onPreferences(); closeAll(); }}>
            Preferences…<span className="gedit-shortcut">Ctrl+P</span>
          </button>
        </div>

        <button
          className="gedit-menu-title"
          aria-expanded={openMenu === 'docs'}
          onClick={() => toggleMenu('docs')}
          onMouseEnter={() => setOpenMenu('docs')}
        >
          Documents
        </button>
        <div className={`gedit-dropdown ${openMenu === 'docs' ? 'gedit-dropdown-open' : ''}`} role="menu">
          <button className="gedit-menu-item" role="menuitem" onClick={() => { closeAll(); }}>
            Close Tab<span className="gedit-shortcut">Ctrl+W</span>
          </button>
        </div>

        <button
          className="gedit-menu-title"
          aria-expanded={openMenu === 'help'}
          onClick={() => toggleMenu('help')}
          onMouseEnter={() => setOpenMenu('help')}
        >
          Help
        </button>
        <div className={`gedit-dropdown ${openMenu === 'help' ? 'gedit-dropdown-open' : ''}`} role="menu">
          <button className="gedit-menu-item" role="menuitem" onClick={() => { props.onAbout(); closeAll(); }}>
            About gedit-web
          </button>
        </div>
      </nav>

      {openMenu !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} onClick={closeAll} />
      )}
    </>
  );
}
