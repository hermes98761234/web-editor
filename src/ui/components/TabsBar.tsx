/**
 * Component: TabsBar
 * Tab strip for switching between editor tabs.
 */

import type { TabData } from '../../domain/value-objects/Workspace';

interface TabsBarProps {
  tabs: ReadonlyArray<TabData>;
  activeIndex: number;
  onSwitch: (index: number) => void;
  onClose: (index: number) => void;
}

export function TabsBar(props: TabsBarProps) {
  return (
    <div className="tabs-bar" role="tablist" aria-label="Editor tabs">
      <div id="tab-list">
        {props.tabs.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${i === props.activeIndex ? 'active' : ''} ${
              t.encrypted ? 'tab-encrypted' : ''
            }`}
            onClick={() => props.onSwitch(i)}
          >
            <span className="tab-name">{t.name}</span>
            {t.encrypted && <span className="tab-lock" title="Encrypted tab">Enc</span>}
            <button
              type="button"
              className="tab-close"
              aria-label="Close tab"
              onClick={(e) => {
                e.stopPropagation();
                props.onClose(i);
              }}
            >
              ×
            </button>
          </button>
        ))}
      </div>
      <div className="tabs-spacer" />
    </div>
  );
}
