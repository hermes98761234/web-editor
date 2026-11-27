/**
 * Component: Dialogs
 * Import and password dialogs.
 */

interface DialogsProps {
  importOpen: boolean;
  onImportClose: () => void;
  onImportSubmit: (uri: string) => void;
  importValue: string;
  onImportChange: (value: string) => void;
  pwdOpen: boolean;
  onPwdClose: () => void;
  onPwdSubmit: (password: string) => void;
  onPwdCancel: () => void;
  pwdTitle: string;
  pwdValue: string;
  onPwdChange: (value: string) => void;
}

export function Dialogs(props: DialogsProps) {
  return (
    <>
      {/* Import dialog */}
      {props.importOpen && (
        <dialog className="dlg" open onClose={props.onImportClose}>
          <form method="dialog">
            <h3>Import from link</h3>
            <p>Paste a data: URI or encrypted share link:</p>
            <textarea
              value={props.importValue}
              onChange={(e) => props.onImportChange(e.target.value)}
              rows={4}
            />
            <div className="dlg-actions">
              <button type="button" onClick={props.onImportClose}>
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  props.onImportSubmit(props.importValue);
                }}
              >
                Import
              </button>
            </div>
          </form>
        </dialog>
      )}

      {/* Password dialog */}
      {props.pwdOpen && (
        <dialog className="dlg" open onClose={props.onPwdClose}>
          <form method="dialog">
            <h3>{props.pwdTitle}</h3>
            <input
              type="password"
              value={props.pwdValue}
              onChange={(e) => props.onPwdChange(e.target.value)}
              placeholder="Password"
              autoFocus
            />
            <div className="dlg-actions">
              <button type="button" onClick={props.onPwdCancel}>
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  props.onPwdSubmit(props.pwdValue);
                }}
              >
                OK
              </button>
            </div>
          </form>
        </dialog>
      )}
    </>
  );
}
