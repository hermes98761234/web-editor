/**
 * Component: Editor (UI layer)
 * Gedit-style editor
 */

import { useRef, useCallback } from 'react';

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
    },
    [props.tabWidth, props.onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.onChange(e.currentTarget.value);
  };

  const lineNumbers = props.showLineNumbers
    ? Array.from({ length: props.content.split('\n').length }, (_, i) => i + 1)
    : [];

  return (
    <div className="gedit-editor-wrapper">
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
