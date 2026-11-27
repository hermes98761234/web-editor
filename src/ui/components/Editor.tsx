/**
 * Component: Editor (UI layer)
 * Gedit-style editor - pure presentational, no hooks
 */

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
  return (
    <div className="gedit-editor-wrapper">
      <textarea
        id="gedit-editor"
        className={`gedit-editor-textarea ${props.wrapText ? 'wrap' : ''}`}
        value={props.content}
        onChange={(e) => props.onChange(e.currentTarget.value)}
        spellCheck={false}
        readOnly={props.encrypted}
        placeholder={props.encrypted ? 'Tab is encrypted. Decrypt to edit.' : ''}
        style={{ fontSize: `${props.fontSize}px`, fontFamily: props.fontFamily }}
      />
    </div>
  );
}
