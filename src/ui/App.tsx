/**
 * Component: App (UI layer) - minimal test
 */

import { useState } from 'react';

export default function App() {
  const [text, setText] = useState('Hello from gedit-web!');
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', height: '100vh', fontFamily: 'monospace' }}>
      <h1>Gedit Web</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        style={{ width: '100%', height: '400px', fontFamily: 'monospace', fontSize: '14px' }}
      />
      <div>{text.length} characters</div>
    </div>
  );
}
