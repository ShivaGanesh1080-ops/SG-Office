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
import { OfficeLogo } from '../common/OfficeLogo';

interface NavItem {
  id: AppType;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  bgLight: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Office Home', sublabel: 'Dashboard', icon: <LayoutGrid size={17} />, color: '#0078d4', bgLight: '#e8f0fe' },
  { id: 'document', label: 'Word', sublabel: 'Documents', icon: <FileText size={17} />, color: '#185abd', bgLight: '#e8f0fe' },
  { id: 'spreadsheet', label: 'Excel', sublabel: 'Spreadsheets', icon: <Table2 size={17} />, color: '#107c41', bgLight: '#e6f4ea' },
  { id: 'presentation', label: 'PowerPoint', sublabel: 'Slide Decks', icon: <Presentation size={17} />, color: '#c43e1c', bgLight: '#fce8e6' },
  { id: 'email', label: 'Gmail', sublabel: 'Google Mail', icon: <Mail size={17} />, color: '#ea4335', bgLight: '#fce8e6' },
  { id: 'calendar', label: 'Calendar', sublabel: 'Schedules', icon: <Calendar size={17} />, color: '#1a73e8', bgLight: '#e8f0fe' },
  { id: 'notes', label: 'OneNote', sublabel: 'Quick Notes', icon: <StickyNote size={17} />, color: '#7719aa', bgLight: '#f3e8ff' },
  { id: 'code-editor', label: 'DevStudio', sublabel: 'Code Sandbox', icon: <Code2 size={17} />, color: '#008272', bgLight: '#e6f6f4' },
  { id: 'whiteboard', label: 'Whiteboard', sublabel: 'Vector Canvas', icon: <PenTool size={17} />, color: '#d83b01', bgLight: '#fdf3ed' },
  { id: 'ai-chat', label: 'Yella AI', sublabel: 'Personal Copilot', icon: <Sparkles size={17} />, color: '#8a44f8', bgLight: '#f3e8ff' },
];

export function Sidebar() {
  const { currentApp, setCurrentApp, sidebarCollapsed, toggleSidebar } = useStore();
  const activeApp = currentApp || 'dashboard';

  return (
    <aside
      className={`flex flex-col h-screen bg-white border-r border-[#e1dfdd] shadow-xs transition-all duration-150 select-none z-30 flex-shrink-0 ${
        sidebarCollapsed ? 'w-[52px]' : 'w-[172px]'
      }`}
      aria-label="Application Navigation Rail"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-3 h-[46px] border-b border-[#edebe9] bg-white">
        <div
          onClick={() => setCurrentApp(null)}
          className="flex items-center gap-2.5 overflow-hidden cursor-pointer group"
          title="Return to Office Home"
        >
          <OfficeLogo size={22} />
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-xs text-[#201f1e] truncate tracking-tight group-hover:text-[#0078d4]">
                Microsoft 365
              </span>
              <span className="text-[9px] text-[#605e5c] uppercase tracking-wider font-semibold">
                Enterprise
              </span>
            </div>
          )}
        </div>
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c] transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* App Nav Items */}
      <nav className="flex-1 py-2 px-1.5 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeApp === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentApp(item.id === 'dashboard' ? null : item.id)}
              className={`flex items-center gap-2.5 w-full p-1.5 rounded-lg text-xs transition-all relative ${
                isActive
                  ? 'bg-[#f3f2f1] text-[#201f1e] font-bold shadow-2xs'
                  : 'text-[#605e5c] hover:bg-[#faf9f8] hover:text-[#201f1e]'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? `${item.label} (${item.sublabel})` : undefined}
            >
              {/* App Icon */}
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                style={{
                  background: isActive ? item.bgLight : 'transparent',
                  color: item.color,
                }}
              >
                {item.icon}
              </div>

              {!sidebarCollapsed && (
                <div className="flex flex-col text-left min-w-0 flex-1">
                  <span className="truncate leading-tight">{item.label}</span>
                  <span className="text-[10px] text-[#8a8886] truncate font-normal leading-tight">
                    {item.sublabel}
                  </span>
                </div>
              )}

              {/* Active Indicator Bar */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r"
                  style={{ background: item.color }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Rail: Settings & Collapse */}
      <div className="p-1.5 border-t border-[#edebe9] bg-[#faf9f8] space-y-0.5">
        <button
          onClick={() => setCurrentApp('settings')}
          className={`flex items-center gap-2 w-full p-1.5 rounded-md text-xs text-[#605e5c] hover:bg-white hover:text-[#201f1e] transition-colors ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
          title="Settings"
        >
          <Settings size={16} />
          {!sidebarCollapsed && <span>Settings</span>}
        </button>

        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-full p-1.5 rounded-md text-[#605e5c] hover:bg-white transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
