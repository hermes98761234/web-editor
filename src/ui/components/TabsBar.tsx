/**
 * Component: TabsBar (UI layer)
 * Gedit-style tab bar for open files
 */

import type { TabData } from '../../domain/value-objects/Workspace';

interface TabsBarProps {
  tabs: ReadonlyArray<TabData>;
  activeIndex: number;
  onSwitch: (index: number) => void;
  onClose: (index: number) => void;
  onNewTab: () => void;
}

export function TabsBar(props: TabsBarProps) {
  const handleTabClose = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    props.onClose(index);
  };

  return (
    <div className="gedit-tabs-bar">
      {props.tabs.map((tab, i) => (
        <div
          key={tab.id}
          className={`gedit-tab ${i === props.activeIndex ? 'active' : ''} ${tab.content.trim().length > 0 ? 'modified' : ''}`}
          onClick={() => props.onSwitch(i)}
          title={tab.name}
        >
          {tab.encrypted ? '🔒 ' : ''}{tab.name}
          <button
            className="gedit-tab-close"
            onClick={(e) => handleTabClose(e, i)}
            aria-label={`Close ${tab.name}`}
          >
            ×
          </button>
        </div>
      ))}
      <div className="gedit-tab-spacer" />
      <button className="gedit-new-tab-btn" title="New Document" onClick={props.onNewTab}>
        +
      </button>
    </div>
  );
}
