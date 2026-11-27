/**
 * Component: Toolbar (UI layer)
 * Gedit-style toolbar with icons for common actions
 */

interface ToolbarProps {
  onNewDocument: () => void;
  onOpenFile: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onFind: () => void;
}

export function Toolbar(props: ToolbarProps) {
  return (
    <div className="gedit-toolbar">
      <button className="gedit-toolbar-btn" title="New Document" onClick={props.onNewDocument}>
        📄
      </button>
      <button className="gedit-toolbar-btn" title="Open" onClick={props.onOpenFile}>
        📂
      </button>
      <button className="gedit-toolbar-btn" title="Save" onClick={props.onSave}>
        💾
      </button>
      <div className="gedit-toolbar-separator" />
      <button className="gedit-toolbar-btn" title="Undo" onClick={props.onUndo}>
        ↩️
      </button>
      <button className="gedit-toolbar-btn" title="Redo" onClick={props.onRedo}>
        ↪️
      </button>
      <div className="gedit-toolbar-separator" />
      <button className="gedit-toolbar-btn" title="Cut" onClick={props.onCut}>
        ✂️
      </button>
      <button className="gedit-toolbar-btn" title="Copy" onClick={props.onCopy}>
        📋
      </button>
      <button className="gedit-toolbar-btn" title="Paste" onClick={props.onPaste}>
        📋
      </button>
      <div className="gedit-toolbar-separator" />
      <button className="gedit-toolbar-btn" title="Find" onClick={props.onFind}>
        🔍
      </button>
    </div>
  );
}
