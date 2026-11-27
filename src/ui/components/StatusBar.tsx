/**
 * Component: StatusBar (UI layer)
 * Gedit-style status bar with line/column, encoding, mode, etc.
 */

interface StatusBarProps {
  status: string;
  activeIndex: number;
  tabCount: number;
  wordCount: number;
  lineCount: number;
  cursorLine: number;
  cursorCol: number;
  encrypted: boolean;
  modified: boolean;
  wrapText: boolean;
  lineNumbers: boolean;
}

export function StatusBar(props: StatusBarProps) {
  return (
    <div className="gedit-status-bar">
      <div className="gedit-status-item">{props.status}</div>
      <div className="gedit-status-separator" />
      <div className="gedit-status-item">
        L{props.cursorLine} C{props.cursorCol}
      </div>
      <div className="gedit-status-separator" />
      <div className="gedit-status-item">{props.wordCount} words</div>
      <div className="gedit-status-separator" />
      <div className="gedit-status-item">{props.lineCount} lines</div>
      <div className="gedit-status-separator" />
      <div className="gedit-status-item">
        {props.tabCount} tab{props.tabCount !== 1 ? 's' : ''}
      </div>
      <div className="gedit-status-separator" />
      <div className="gedit-status-item">
        {props.encrypted ? <span className="gedit-status-mode">Enc</span> : <span className="gedit-status-mode">Plain</span>}
      </div>
      <div className="gedit-status-separator" />
      <div className="gedit-status-item">
        {props.modified ? '● Modified' : 'Saved'}
      </div>
      <div className="gedit-status-separator" />
      <div className="gedit-status-item">
        {props.wrapText ? 'Wrap: On' : 'Wrap: Off'}
      </div>
    </div>
  );
}
