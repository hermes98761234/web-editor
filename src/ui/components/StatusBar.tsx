/**
 * Component: StatusBar
 * Bottom status bar showing state, tab info, word count, and encryption badge.
 */

interface StatusBarProps {
  status: string;
  activeIndex: number;
  tabCount: number;
  wordCount: number;
  encrypted: boolean;
}

export function StatusBar(props: StatusBarProps) {
  return (
    <footer className="status-bar">
      <span className="status-text">{props.status}</span>
      <span className="divider">|</span>
      <span className="tab-info">
        Tab {props.activeIndex + 1} of {props.tabCount}
      </span>
      <span className="divider">|</span>
      <span className="word-count">{props.wordCount} words</span>
      {props.encrypted && <span className="badge">Encrypted</span>}
    </footer>
  );
}
