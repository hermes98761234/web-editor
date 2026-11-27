/**
 * Component: FindReplaceDialog (UI layer)
 * Gedit-style find and replace dialog
 */

interface FindReplaceDialogProps {
  open: boolean;
  onClose: () => void;
  findText: string;
  onFindTextChange: (text: string) => void;
  replaceText: string;
  onReplaceTextChange: (text: string) => void;
  onFindNext: (searchText: string) => void;
  onReplace: (findText: string, replaceText: string) => void;
  onReplaceAll: (findText: string, replaceText: string) => void;
}

export function FindReplaceDialog(props: FindReplaceDialogProps) {
  if (!props.open) return null;

  return (
    <div className="gedit-dialog-overlay" onClick={props.onClose}>
      <div className="gedit-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Find and Replace</h2>
        <div className="gedit-dialog-field">
          <label>Find:</label>
          <input
            value={props.findText}
            onChange={(e) => props.onFindTextChange(e.currentTarget.value)}
            autoFocus
          />
        </div>
        <div className="gedit-dialog-field">
          <label>Replace with:</label>
          <input
            value={props.replaceText}
            onChange={(e) => props.onReplaceTextChange(e.currentTarget.value)}
          />
        </div>
        <div className="gedit-dialog-actions">
          <button className="gedit-dialog-btn" onClick={props.onClose}>
            Close
          </button>
          <button className="gedit-dialog-btn" onClick={() => props.onFindNext(props.findText)}>
            Find Next
          </button>
          <button className="gedit-dialog-btn" onClick={() => props.onReplace(props.findText, props.replaceText)}>
            Replace
          </button>
          <button className="gedit-dialog-btn primary" onClick={() => props.onReplaceAll(props.findText, props.replaceText)}>
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
}
