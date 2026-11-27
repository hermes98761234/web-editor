/**
 * Component: AboutDialog (UI layer)
 * Gedit-style about dialog
 */

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AboutDialog(props: AboutDialogProps) {
  if (!props.open) return null;

  return (
    <div className="gedit-dialog-overlay" onClick={props.onClose}>
      <div className="gedit-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>About gedit-web</h2>
        <p>
          gedit-web is a web-based text editor inspired by GNOME gedit.
        </p>
        <p>
          Features include tabbed editing, find and replace, encryption, and
          data: URI workspace sharing.
        </p>
        <div className="gedit-dialog-actions">
          <button className="gedit-dialog-btn primary" onClick={props.onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
