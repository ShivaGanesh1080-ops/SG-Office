import { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  Search,
  Share2,
  Sparkles,
  ChevronDown,
  FileText,
  Table2,
  Presentation,
  Mail,
  Calendar,
  StickyNote,
  Code2,
  PenTool,
  Check,
  User,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function TopBar() {
  const { currentApp, toggleAIPanel, aiPanelOpen, toggleSearch, activeDocTitle, setActiveDocTitle, gmailAccount } = useStore();
  const [autoSave, setAutoSave] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const getAppMeta = () => {
    switch (currentApp) {
      case 'document':
        return { name: 'Word', color: '#185abd', bg: '#e8f0fe', icon: <FileText size={16} className="text-[#185abd]" /> };
      case 'spreadsheet':
        return { name: 'Excel', color: '#107c41', bg: '#e6f4ea', icon: <Table2 size={16} className="text-[#107c41]" /> };
      case 'presentation':
        return { name: 'PowerPoint', color: '#c43e1c', bg: '#fce8e6', icon: <Presentation size={16} className="text-[#c43e1c]" /> };
      case 'email':
        return { name: 'Gmail', color: '#ea4335', bg: '#fce8e6', icon: <Mail size={16} className="text-[#ea4335]" /> };
      case 'calendar':
        return { name: 'Calendar', color: '#1a73e8', bg: '#e8f0fe', icon: <Calendar size={16} className="text-[#1a73e8]" /> };
      case 'notes':
        return { name: 'OneNote', color: '#7719aa', bg: '#f3e8ff', icon: <StickyNote size={16} className="text-[#7719aa]" /> };
      case 'code-editor':
        return { name: 'DevStudio', color: '#008272', bg: '#e6f6f4', icon: <Code2 size={16} className="text-[#008272]" /> };
      case 'whiteboard':
        return { name: 'Whiteboard', color: '#d83b01', bg: '#fdf3ed', icon: <PenTool size={16} className="text-[#d83b01]" /> };
      default:
        return { name: 'Office Home', color: '#185abd', bg: '#e8f0fe', icon: <FileText size={16} className="text-[#185abd]" /> };
    }
  };

  const appMeta = getAppMeta();

  return (
    <div className="flex items-center justify-between h-[42px] px-3 bg-white border-b border-[#edebe9] select-none text-[#201f1e] gap-2 overflow-x-hidden">
      {/* Left: App Brand & Name & AutoSave & Title */}
      <div className="flex items-center gap-2 min-w-0 flex-shrink">
        {/* 9-dot Waffle menu */}
        <button
          onClick={toggleSearch}
          title="App Launcher"
          className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c] transition-colors flex-shrink-0"
        >
          <div className="grid grid-cols-3 gap-0.5 w-3.5 h-3.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 bg-[#605e5c] rounded-full" />
            ))}
          </div>
        </button>

        {/* Current App Indicator */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="p-1 rounded" style={{ background: appMeta.bg }}>
            {appMeta.icon}
          </div>
          <span className="font-semibold text-xs tracking-tight" style={{ color: appMeta.color }}>
            {appMeta.name}
          </span>
        </div>

        {/* AutoSave Pill Switch */}
        <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-[#edebe9] flex-shrink-0">
          <button
            onClick={() => {
              setAutoSave(!autoSave);
              toast(autoSave ? 'AutoSave paused' : 'AutoSave enabled');
            }}
            className="flex items-center gap-1 text-[11px] text-[#605e5c] hover:text-[#201f1e]"
            title="AutoSave Toggle"
          >
            <div
              className={`w-6 h-3.5 flex items-center rounded-full p-0.5 transition-colors ${
                autoSave ? 'bg-[#107c41]' : 'bg-[#c8c6c4]'
              }`}
            >
              <div
                className={`bg-white w-2.5 h-2.5 rounded-full shadow-xs transform transition-transform ${
                  autoSave ? 'translate-x-2.5' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-[10px] font-medium hidden md:inline">AutoSave</span>
          </button>
        </div>

        {/* Document Title input */}
        <div className="flex items-center gap-1 pl-1 min-w-0">
          <input
            type="text"
            value={activeDocTitle}
            onChange={(e) => setActiveDocTitle(e.target.value)}
            className="text-xs font-semibold px-1.5 py-0.5 rounded hover:bg-[#f3f2f1] focus:bg-white focus:ring-1 focus:ring-[#185abd] outline-none text-[#201f1e] w-28 sm:w-44 md:w-56 truncate"
            title="Click to rename"
          />
        </div>
      </div>

      {/* Center: Search Box (sized to never overlap on 14-inch screens) */}
      <div className="flex-1 max-w-xs md:max-w-sm mx-1 hidden sm:block">
        <button
          onClick={toggleSearch}
          className="w-full flex items-center gap-2 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded-md text-xs text-[#605e5c] transition-colors border border-transparent hover:border-[#d2d0ce]"
        >
          <Search size={13} className="text-[#605e5c] flex-shrink-0" />
          <span className="truncate flex-1 text-left text-[11px]">Search or ask Yella...</span>
          <kbd className="text-[9px] bg-white px-1 py-0.5 rounded border border-[#edebe9] font-mono text-[#8a8886] flex-shrink-0">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Yella AI, Share, Profile */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Yella AI Button */}
        <button
          onClick={toggleAIPanel}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs transition-all ${
            aiPanelOpen
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white ring-2 ring-purple-300'
              : 'bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700'
          }`}
          title="Open Yella AI Assistant"
        >
          <Sparkles size={12} className="text-purple-600" />
          <span>Yella AI</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Document link copied to clipboard!');
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90"
          style={{ background: appMeta.color }}
        >
          <Share2 size={12} />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Profile Avatar (Clean, no SG initials hardcoded) */}
        <div className="relative pl-1 border-l border-[#edebe9]">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-7 h-7 rounded-full bg-[#f3f2f1] hover:bg-[#edebe9] border border-[#d2d0ce] text-[#605e5c] flex items-center justify-center text-xs font-semibold"
            title="User Profile"
          >
            {gmailAccount?.connected ? (
              <span className="text-[11px] font-bold text-red-600">G</span>
            ) : (
              <User size={14} />
            )}
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-lg shadow-xl border border-[#edebe9] p-3 z-50 animate-fade-in text-xs space-y-2">
              <div className="pb-2 border-b border-[#edebe9]">
                <p className="font-bold text-[#201f1e]">
                  {gmailAccount?.connected ? gmailAccount.name : 'Personal Workspace'}
                </p>
                <p className="text-[11px] text-[#605e5c]">
                  {gmailAccount?.connected ? gmailAccount.email : 'Local Sovereign Account'}
                </p>
              </div>
              <div className="text-[11px] text-[#605e5c] space-y-1">
                <p>• Zero-telemetry on-device mode</p>
                <p>• Yella AI Engine: Active</p>
                <p>• Storage: Local browser & Cloud sync</p>
              </div>
              <button
                onClick={() => { setShowProfile(false); toast('Preferences updated'); }}
                className="w-full text-left py-1 text-[#185abd] hover:underline text-[11px] font-semibold"
              >
                Close Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
