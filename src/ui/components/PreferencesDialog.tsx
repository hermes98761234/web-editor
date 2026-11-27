/**
 * Component: PreferencesDialog (UI layer)
 * Gedit-style preferences dialog
 */

interface PreferencesDialogProps {
  open: boolean;
  onClose: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  tabWidth: number;
  onTabWidthChange: (width: number) => void;
  wrapText: boolean;
  onWrapTextChange: (wrap: boolean) => void;
  lineNumbers: boolean;
  onLineNumbersChange: (show: boolean) => void;
  autoIndent: boolean;
  onAutoIndentChange: (indent: boolean) => void;
  fontFamily: string;
  onFontFamilyChange: (family: string) => void;
  onSave: () => void;
}

export function PreferencesDialog(props: PreferencesDialogProps) {
  if (!props.open) return null;

  return (
    <div className="gedit-dialog-overlay" onClick={props.onClose}>
      <div className="gedit-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Preferences</h2>
        <div className="gedit-dialog-field">
          <label>Font Size</label>
          <input
            type="number"
            min="8" max="72"
            value={props.fontSize}
            onChange={(e) => props.onFontSizeChange(parseInt(e.currentTarget.value) || 13)}
          />
        </div>
        <div className="gedit-dialog-field">
          <label>Tab Width (spaces)</label>
          <input
            type="number"
            min="2" max="8"
            value={props.tabWidth}
            onChange={(e) => props.onTabWidthChange(parseInt(e.currentTarget.value) || 4)}
          />
        </div>
        <div className="gedit-dialog-field">
          <label>Font Family</label>
          <select
            value={props.fontFamily}
            onChange={(e) => props.onFontFamilyChange(e.currentTarget.value)}
          >
            <option value="monospace">Monospace</option>
            <option value="'Courier New'">Courier New</option>
            <option value="Consolas">Consolas</option>
            <option value="Menlo">Menlo</option>
            <option value="'Lucida Console'">Lucida Console</option>
          </select>
        </div>
        <div className="gedit-checkbox">
          <input
            type="checkbox"
            checked={props.wrapText}
            onChange={() => props.onWrapTextChange(!props.wrapText)}
          />
          Wrap text
        </div>
        <div className="gedit-checkbox">
          <input
            type="checkbox"
            checked={props.lineNumbers}
            onChange={() => props.onLineNumbersChange(!props.lineNumbers)}
          />
          Show line numbers
        </div>
        <div className="gedit-checkbox">
          <input
            type="checkbox"
            checked={props.autoIndent}
            onChange={() => props.onAutoIndentChange(!props.autoIndent)}
          />
          Auto indent
        </div>
        <div className="gedit-dialog-actions">
          <button className="gedit-dialog-btn" onClick={props.onClose}>
            Cancel
          </button>
          <button className="gedit-dialog-btn primary" onClick={props.onSave}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
