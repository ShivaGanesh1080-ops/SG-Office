import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './components/dashboard/Dashboard';
import { DocumentEditor } from './components/apps/DocumentEditor';
import { SpreadsheetApp } from './components/apps/SpreadsheetApp';
import { PresentationApp } from './components/apps/PresentationApp';
import { GmailApp } from './components/apps/GmailApp';
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

  // These full-featured apps have their own authentic Microsoft/Google/IDE headers:
  const hasAppHeader = [
    'document',
    'spreadsheet',
    'presentation',
    'email',
    'code-editor',
  ].includes(currentApp || '');

  const renderApp = () => {
    switch (currentApp) {
      case 'document':
        return <DocumentEditor />;
      case 'spreadsheet':
        return <SpreadsheetApp />;
      case 'presentation':
        return <PresentationApp />;
      case 'email':
        return <GmailApp />;
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#f3f2f1] text-[#201f1e]">
      {/* 1. Left Sidebar: Independent Full-Height Navigation Rail */}
      <Sidebar />

      {/* 2. Right Workspace: Clean, unstacked layout */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {!hasAppHeader && <TopBar />}
        <main className="flex-1 overflow-hidden min-w-0 relative">
          {renderApp()}
        </main>
      </div>

      {/* Slide-in Yella AI Assistant */}
      {aiPanelOpen && <AIPanelSlider />}

      {/* Command Palette */}
      {searchOpen && <CommandPalette />}

      {/* Toast Notifications */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#201f1e',
            border: '1px solid #edebe9',
            borderRadius: '8px',
            fontSize: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        }}
      />
    </div>
  );
}

export default App;
