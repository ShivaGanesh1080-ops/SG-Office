import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './components/dashboard/Dashboard';
import { DocumentEditor } from './components/apps/DocumentEditor';
import { SpreadsheetApp } from './components/apps/SpreadsheetApp';
import { PresentationApp } from './components/apps/PresentationApp';
import { EmailApp } from './components/apps/EmailApp';
import { CalendarApp } from './components/apps/CalendarApp';
import { NotesApp } from './components/apps/NotesApp';
import { CodeEditorApp } from './components/apps/CodeEditorApp';
import { WhiteboardApp } from './components/apps/WhiteboardApp';
import { AIChat } from './components/ai/AIChat';
import { AIPanelSlider } from './components/ai/AIPanelSlider';
import { SettingsApp } from './components/apps/SettingsApp';
import { CommandPalette } from './components/common/CommandPalette';
import { useStore } from './store/useStore';
import { Toaster } from 'react-hot-toast';

function App() {
  const { currentApp, aiPanelOpen, searchOpen } = useStore();

  const renderApp = () => {
    switch (currentApp) {
      case 'document':
        return <DocumentEditor />;
      case 'spreadsheet':
        return <SpreadsheetApp />;
      case 'presentation':
        return <PresentationApp />;
      case 'email':
        return <EmailApp />;
      case 'calendar':
        return <CalendarApp />;
      case 'notes':
        return <NotesApp />;
      case 'code-editor':
        return <CodeEditorApp />;
      case 'whiteboard':
        return <WhiteboardApp />;
      case 'ai-chat':
        return <AIChat />;
      case 'settings':
        return <SettingsApp />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--nova-bg)' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          {renderApp()}
        </main>
      </div>
      {aiPanelOpen && <AIPanelSlider />}
      {searchOpen && <CommandPalette />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--nova-surface)',
            color: 'var(--nova-text)',
            border: '1px solid var(--nova-border)',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
}

export default App;
