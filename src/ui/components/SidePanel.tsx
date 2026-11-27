/**
 * Component: SidePanel (UI layer)
 * Gedit-style side panel with integrated file browser
 */

interface SidePanelProps {
  tabs: ReadonlyArray<{ id: string; name: string; content: string; encrypted: boolean }>;
  activeIndex: number;
  onSwitch: (index: number) => void;
  onClose: (index: number) => void;
}

export function SidePanel(props: SidePanelProps) {
  const files = [
    { name: 'documents', icon: '📁' },
    { name: 'projects', icon: '📁' },
    { name: 'downloads', icon: '📁' },
    { name: 'README.md', icon: '📄' },
    { name: 'main.js', icon: '📄' },
    { name: 'styles.css', icon: '📄' },
    { name: 'config.json', icon: '📄' },
  ];

  return (
    <aside className="gedit-side-panel">
      <div className="gedit-side-panel-header">Files</div>
      <div className="gedit-side-panel-content">
        {files.map((f) => (
          <div
            key={f.name}
            className="gedit-file-item"
            onClick={() => {}}
          >
            <span className="gedit-file-icon">{f.icon}</span>
            <span className="gedit-file-name">{f.name}</span>
          </div>
        ))}
        <div style={{ marginTop: 16, padding: '4px 8px', fontSize: '11px', color: '#757575' }}>
          Open Tabs:
        </div>
        {props.tabs.map((tab, i) => (
          <div
            key={tab.id}
            className={`gedit-file-item ${i === props.activeIndex ? 'active' : ''}`}
            onClick={() => props.onSwitch(i)}
          >
            <span className="gedit-file-icon">{tab.encrypted ? '🔒' : '📄'}</span>
            <span className="gedit-file-name">{tab.name}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
