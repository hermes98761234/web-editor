/**
 * Component: App (UI layer)
 * Minimal test to isolate hook issue
 */

import { useState } from 'react';

export default function App() {
  const [text, setText] = useState('Hello, world!');
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', height: '100vh', fontFamily: 'monospace' }}>
      <h1>Gedit Web</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: '100%', height: '400px', fontFamily: 'monospace', fontSize: '14px' }}
      />
      <div>{text.length} characters</div>
    </div>
  );
}
