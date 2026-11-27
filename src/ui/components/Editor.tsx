/**
 * Component: Editor (UI layer)
 * Gedit-style editor with line numbers, search bar, and syntax highlighting
 */

import { useRef, useState } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  encrypted: boolean;
  wrapText: boolean;
  showLineNumbers: boolean;
  fontSize: number;
  tabWidth: number;
  fontFamily: string;
  onFind: () => void;
  findText: string;
  onFindTextChange: (text: string) => void;
  onFindNext: () => void;
  onReplace: () => void;
  replaceText: string;
  onReplaceTextChange: (text: string) => void;
}

export function Editor(props: EditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [searchVisible, setSearchVisible] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const spaces = ' '.repeat(props.tabWidth);
      const newValue =
        e.currentTarget.value.slice(0, start) +
        spaces +
        e.currentTarget.value.slice(end);
      e.currentTarget.value = newValue;
      e.currentTarget.selectionStart = start + spaces.length;
      e.currentTarget.selectionEnd = start + spaces.length;
      props.onChange(newValue);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      setSearchVisible(true);
      props.onFind();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.onChange(e.currentTarget.value);
  };

  const lineNumbers = props.showLineNumbers
    ? Array.from({ length: props.content.split('\n').length }, (_, i) => i + 1)
    : [];

  return (
    <div className="gedit-editor-wrapper">
      {searchVisible && (
        <div className="gedit-search-bar">
          <label style={{ fontSize: '11px', color: '#757575', marginRight: 4 }}>Find:</label>
          <input
            value={props.findText}
            onChange={(e) => props.onFindTextChange(e.currentTarget.value)}
            placeholder="Find…"
          />
          <button className="gedit-search-btn" title="Find Next" onClick={props.onFindNext}>
            ↓
          </button>
          <button className="gedit-search-btn" title="Close" onClick={() => setSearchVisible(false)}>
            ✕
          </button>
        </div>
      )}
      {props.showLineNumbers && (
        <div className="gedit-line-numbers">
          {lineNumbers.map((n) => (
            <div key={n} className="gedit-line-number">
              {n}
            </div>
          ))}
        </div>
      )}
      <textarea
        ref={editorRef}
        id="gedit-editor"
        className={`gedit-editor-textarea ${props.wrapText ? 'wrap' : ''}`}
        value={props.content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        readOnly={props.encrypted}
        placeholder={props.encrypted ? 'Tab is encrypted. Decrypt to edit.' : ''}
        style={{ fontSize: `${props.fontSize}px`, fontFamily: props.fontFamily }}
      />
    </div>
  );
}
