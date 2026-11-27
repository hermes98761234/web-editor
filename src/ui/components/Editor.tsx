/**
 * Component: Editor
 * The plain-text editing area for the active tab.
 */

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function Editor(props: EditorProps) {
  return (
    <div className="editor-area">
      <textarea
        id="editor"
        spellCheck={false}
        wrap="soft"
        value={props.content}
        onChange={(e) => props.onChange(e.target.value)}
        aria-label="File content"
      />
    </div>
  );
}
