import { useStore } from '../../store/useStore';
import { AppType } from '../../types';
import {
  LayoutGrid,
  FileText,
  Table2,
  Presentation,
  Mail,
  Calendar,
  StickyNote,
  Code2,
  PenTool,
  MessageSquareText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';

interface NavItem {
  id: AppType;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  bgLight: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Office 365', sublabel: 'Home Portal', icon: <LayoutGrid size={18} />, color: '#0078d4', bgLight: '#deecf9' },
  { id: 'document', label: 'Word', sublabel: 'Document Editor', icon: <FileText size={18} />, color: '#185abd', bgLight: '#e8f0fe' },
  { id: 'spreadsheet', label: 'Excel', sublabel: 'Spreadsheets', icon: <Table2 size={18} />, color: '#107c41', bgLight: '#e6f4ea' },
  { id: 'presentation', label: 'PowerPoint', sublabel: 'Slide Decks', icon: <Presentation size={18} />, color: '#c43e1c', bgLight: '#fce8e6' },
  { id: 'email', label: 'Outlook', sublabel: 'Mail & Contacts', icon: <Mail size={18} />, color: '#0078d4', bgLight: '#deecf9' },
  { id: 'calendar', label: 'Calendar', sublabel: 'Events & Plans', icon: <Calendar size={18} />, color: '#0078d4', bgLight: '#deecf9' },
  { id: 'notes', label: 'OneNote', sublabel: 'Notebooks', icon: <StickyNote size={18} />, color: '#7719aa', bgLight: '#f3e8ff' },
  { id: 'code-editor', label: 'DevStudio', sublabel: 'Code Sandbox', icon: <Code2 size={18} />, color: '#008272', bgLight: '#e6f6f4' },
  { id: 'whiteboard', label: 'Whiteboard', sublabel: 'Freehand Canvas', icon: <PenTool size={18} />, color: '#d83b01', bgLight: '#fdf3ed' },
  { id: 'ai-chat', label: 'Copilot AI', sublabel: 'Intelligent Copilot', icon: <Sparkles size={18} />, color: '#8a44f8', bgLight: '#f3e8ff' },
];

export function Sidebar() {
  const { currentApp, setCurrentApp, sidebarCollapsed, toggleSidebar } = useStore();
  const activeApp = currentApp || 'dashboard';

  return (
    <div
      className={`flex flex-col h-full bg-white border-r border-[#edebe9] transition-all duration-200 select-none z-20 ${
        sidebarCollapsed ? 'w-[52px]' : 'w-[200px]'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 h-[48px] border-b border-[#edebe9]">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-md copilot-gradient flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
            SG
          </div>
          {!sidebarCollapsed && (
            <div className="leading-tight truncate">
              <span className="font-bold text-xs text-[#201f1e] block tracking-tight">SG-Office 365</span>
              <span className="text-[10px] text-[#605e5c] block">Enterprise AI</span>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c]"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* App Navigation Rail */}
      <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeApp === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentApp(item.id === 'dashboard' ? null : item.id)}
              className={`flex items-center gap-2.5 w-full p-2 rounded-md text-xs font-medium transition-all relative ${
                isActive
                  ? 'bg-[#f3f2f1] text-[#201f1e] font-semibold'
                  : 'text-[#605e5c] hover:bg-[#faf9f8] hover:text-[#201f1e]'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? `${item.label} (${item.sublabel})` : undefined}
            >
              {/* App Icon */}
              <div
                className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                style={{
                  background: isActive ? item.bgLight : 'transparent',
                  color: item.color,
                }}
              >
                {item.icon}
              </div>

              {!sidebarCollapsed && (
                <div className="text-left flex-1 truncate">
                  <span className="block leading-none">{item.label}</span>
                  <span className="text-[10px] text-[#8a8886] font-normal leading-tight">{item.sublabel}</span>
                </div>
              )}

              {/* Active Bar indicator */}
              {isActive && (
                <div
                  className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                  style={{ background: item.color }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Rail: Settings & Expand */}
      <div className="p-1.5 border-t border-[#edebe9] space-y-0.5">
        <button
          onClick={() => setCurrentApp('settings')}
          className={`flex items-center gap-2.5 w-full p-2 rounded-md text-xs text-[#605e5c] hover:bg-[#f3f2f1] hover:text-[#201f1e] transition-colors ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
          title={sidebarCollapsed ? 'Settings' : undefined}
        >
          <Settings size={18} className="text-[#605e5c]" />
          {!sidebarCollapsed && <span>Settings</span>}
        </button>

        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full p-2 rounded-md text-xs text-[#605e5c] hover:bg-[#f3f2f1]"
            title="Expand Sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
