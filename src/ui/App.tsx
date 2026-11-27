/**
 * Component: App (UI layer) - with Editor component
 */

import { useState } from 'react';
import { Editor } from './components/Editor';

export default function App() {
  const [text, setText] = useState('Hello from gedit-web!');
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', height: '100vh', fontFamily: 'monospace' }}>
      <h1>Gedit Web</h1>
      <Editor
        content={text}
        onChange={setText}
        encrypted={false}
        wrapText={false}
        showLineNumbers={true}
        fontSize={13}
        tabWidth={4}
        fontFamily="monospace"
        onFind={() => {}}
        findText=""
        onFindTextChange={() => {}}
        onFindNext={() => {}}
      />
      <div>{text.length} characters</div>
    </div>
  );
}
