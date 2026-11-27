/**
 * Component: Editor (UI layer)
 * Pure presentational editor — zero hooks, all state managed by App.
 * Renders textarea with line numbers gutter.
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
}

export function Editor(props: EditorProps) {
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
