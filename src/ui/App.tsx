/**
 * Component: App (UI layer)
 * Gedit shell with Editor component
 */

import { useState, useCallback, useEffect } from 'react';
import { EditorApplicationService } from '../application/EditorApplicationService';
import { Editor } from './components/Editor';
import { LocalStorageTabRepository } from '../infrastructure/LocalStorageTabRepository';
import { WebCryptoEncryptionService } from '../infrastructure/WebCryptoEncryptionService';
import { WebCryptoExportService } from '../infrastructure/WebCryptoExportService';
import { WebCryptoImportService } from '../infrastructure/WebCryptoImportService';
import { TabFactory } from '../domain/factories/TabFactory';

export default function App() {
  const [app] = useState(() => {
    const repository = new LocalStorageTabRepository();
    const encryption = new WebCryptoEncryptionService();
    const exportService = new WebCryptoExportService();
    const importService = new WebCryptoImportService();
    const factory = new TabFactory();
    return new EditorApplicationService(repository, encryption, exportService, importService, factory);
  });

  const [initialized, setInitialized] = useState(false);
  const [status, setStatus] = useState('Initializing…');

  useEffect(() => {
    app.initialize().then(() => {
      setInitialized(true);
      setStatus('Ready');
    }).catch(() => {
      setInitialized(true);
      setStatus('Init failed');
    });
  }, []);

  if (!initialized) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#757575' }}>
        {status}
      </div>
    );
  }

  const activeTab = app.getActiveTab();

  const handleContentChange = useCallback((content: string) => {
    app.setActiveContent(content);
  }, [app]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '8px', background: '#e8e8e8', borderBottom: '1px solid #dcdcdc' }}>
        <strong>Gedit Web</strong> &nbsp;|&nbsp; {activeTab.name} &nbsp;|&nbsp; {status}
      </div>
      <Editor
        content={activeTab.content}
        onChange={handleContentChange}
        encrypted={activeTab.encrypted}
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
    </div>
  );
}
