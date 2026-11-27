/**
 * Component: Editor (UI layer)
 * Gedit-style editor with line numbers, search bar, find with selection
 */

import { useRef, useState, useCallback } from 'react';

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
  onFindNext: (searchText: string) => void;
  onCursorChange?: (line: number, col: number) => void;
}

export function Editor(props: EditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [searchVisible, setSearchVisible] = useState(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
      if (props.onCursorChange) {
        const start = e.currentTarget.selectionStart;
        const textBefore = e.currentTarget.value.slice(0, start);
        const line = textBefore.split('\n').length;
        const col = textBefore.split('\n').pop()!.length + 1;
        props.onCursorChange(line, col);
      }
    },
    [props.tabWidth, props.onChange, props.onFind, props.onCursorChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.onChange(e.currentTarget.value);
    if (props.onCursorChange) {
      const start = e.currentTarget.selectionStart;
      const textBefore = e.currentTarget.value.slice(0, start);
      const line = textBefore.split('\n').length;
      const col = textBefore.split('\n').pop()!.length + 1;
      props.onCursorChange(line, col);
    }
  };

  const handleClick = useCallback(() => {
    if (props.onCursorChange && editorRef.current) {
      const start = editorRef.current.selectionStart;
      const textBefore = editorRef.current.value.slice(0, start);
      const line = textBefore.split('\n').length;
      const col = textBefore.split('\n').pop()!.length + 1;
      props.onCursorChange(line, col);
    }
  }, [props.onCursorChange]);

  const handleSelect = useCallback(() => {
    if (props.onCursorChange && editorRef.current) {
      const start = editorRef.current.selectionStart;
      const textBefore = editorRef.current.value.slice(0, start);
      const line = textBefore.split('\n').length;
      const col = textBefore.split('\n').pop()!.length + 1;
      props.onCursorChange(line, col);
    }
  }, [props.onCursorChange]);

  const handleFindNext = useCallback(() => {
    if (props.findText) {
      props.onFindNext(props.findText);
    }
  }, [props.findText, props.onFindNext]);

  const lineNumbers = props.showLineNumbers
    ? Array.from({ length: props.content.split('\n').length }, (_, i) => i + 1)
    : [];

  return (
    <div className="gedit-editor-wrapper">
      {searchVisible && (
        <div className="gedit-search-bar">
          <label style={{ fontSize: '11px', color: '#757575', marginRight: 4 }}>
            Find:
          </label>
          <input
            value={props.findText}
            onChange={(e) => props.onFindTextChange(e.currentTarget.value)}
            placeholder="Find…"
            autoFocus
          />
          <button
            className="gedit-search-btn"
            title="Find Next"
            onClick={handleFindNext}
          >
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
        onClick={handleClick}
        onSelect={handleSelect}
        spellCheck={false}
        readOnly={props.encrypted}
        placeholder={props.encrypted ? 'Tab is encrypted. Decrypt to edit.' : ''}
        style={{ fontSize: `${props.fontSize}px`, fontFamily: props.fontFamily }}
      />
    </div>
  );
}
