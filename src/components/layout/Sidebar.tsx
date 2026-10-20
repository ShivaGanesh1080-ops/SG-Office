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
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
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
  { id: 'dashboard', label: 'Office Home', sublabel: 'Dashboard', icon: <LayoutGrid size={18} />, color: '#185abd', bgLight: '#e8f0fe' },
  { id: 'document', label: 'Word', sublabel: 'Documents', icon: <FileText size={18} />, color: '#185abd', bgLight: '#e8f0fe' },
  { id: 'spreadsheet', label: 'Excel', sublabel: 'Spreadsheets', icon: <Table2 size={18} />, color: '#107c41', bgLight: '#e6f4ea' },
  { id: 'presentation', label: 'PowerPoint', sublabel: 'Slide Decks', icon: <Presentation size={18} />, color: '#c43e1c', bgLight: '#fce8e6' },
  { id: 'email', label: 'Gmail', sublabel: 'Google Mail', icon: <Mail size={18} />, color: '#ea4335', bgLight: '#fce8e6' },
  { id: 'calendar', label: 'Calendar', sublabel: 'Schedules', icon: <Calendar size={18} />, color: '#1a73e8', bgLight: '#e8f0fe' },
  { id: 'notes', label: 'OneNote', sublabel: 'Notes', icon: <StickyNote size={18} />, color: '#7719aa', bgLight: '#f3e8ff' },
  { id: 'code-editor', label: 'DevStudio', sublabel: 'Code Sandbox', icon: <Code2 size={18} />, color: '#008272', bgLight: '#e6f6f4' },
  { id: 'whiteboard', label: 'Whiteboard', sublabel: 'Vector Canvas', icon: <PenTool size={18} />, color: '#d83b01', bgLight: '#fdf3ed' },
  { id: 'ai-chat', label: 'Yella AI', sublabel: 'Personal Copilot', icon: <Sparkles size={18} />, color: '#8a44f8', bgLight: '#f3e8ff' },
];

export function Sidebar() {
  const { currentApp, setCurrentApp, sidebarCollapsed, toggleSidebar } = useStore();
  const activeApp = currentApp || 'dashboard';

  return (
    <div
      className={`flex flex-col h-full bg-white border-r border-[#edebe9] transition-all duration-150 select-none z-20 flex-shrink-0 ${
        sidebarCollapsed ? 'w-[48px]' : 'w-[165px]'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2.5 h-[42px] border-b border-[#edebe9]">
        <div
          onClick={() => setCurrentApp(null)}
          className="flex items-center gap-2 overflow-hidden cursor-pointer"
          title="Return to Office Home"
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-[11px] shadow-xs flex-shrink-0">
            SG
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-xs text-[#201f1e] truncate tracking-tight">SG-Office</span>
          )}
        </div>
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c]"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* App Nav Items */}
      <nav className="flex-1 py-1.5 px-1 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeApp === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentApp(item.id === 'dashboard' ? null : item.id)}
              className={`flex items-center gap-2 w-full p-1.5 rounded-md text-xs font-medium transition-all relative ${
                isActive
                  ? 'bg-[#f3f2f1] text-[#201f1e] font-semibold'
                  : 'text-[#605e5c] hover:bg-[#faf9f8] hover:text-[#201f1e]'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? `${item.label} (${item.sublabel})` : undefined}
            >
              {/* App Icon */}
              <div
                className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
                style={{
                  background: isActive ? item.bgLight : 'transparent',
                  color: item.color,
                }}
              >
                {item.icon}
              </div>

              {!sidebarCollapsed && (
                <div className="text-left flex-1 truncate leading-tight">
                  <span className="block truncate text-xs">{item.label}</span>
                </div>
              )}

              {/* Active Bar indicator */}
              {isActive && (
                <div
                  className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full"
                  style={{ background: item.color }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Rail: Settings & Collapse toggle */}
      <div className="p-1 border-t border-[#edebe9] space-y-0.5">
        <button
          onClick={() => setCurrentApp('settings')}
          className={`flex items-center gap-2 w-full p-1.5 rounded-md text-xs text-[#605e5c] hover:bg-[#f3f2f1] hover:text-[#201f1e] ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
          title={sidebarCollapsed ? 'Settings' : undefined}
        >
          <Settings size={16} className="text-[#605e5c] flex-shrink-0" />
          {!sidebarCollapsed && <span className="text-xs">Settings</span>}
        </button>

        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full p-1 rounded-md text-xs text-[#605e5c] hover:bg-[#f3f2f1]"
            title="Expand Sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
