/**
 * Component: BottomPanel (UI layer)
 * Gedit-style bottom panel (toggleable)
 */

export function BottomPanel() {
  return (
    <div className="gedit-bottom-panel">
      <div className="gedit-bottom-panel-header">
        <span style={{ color: '#757575' }}>Console</span>
      </div>
      <div className="gedit-bottom-panel-content">
        Welcome to gedit-web. Open a file or start typing to begin.
      </div>
      <div className="gedit-bottom-panel-toggle">─</div>
    </div>
  );
}
