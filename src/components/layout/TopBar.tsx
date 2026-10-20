import { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  Search,
  Share2,
  Sparkles,
  MessageSquare,
  ChevronDown,
  Grid,
  Check,
  CheckCircle2,
  FileText,
  Table2,
  Presentation,
  Mail,
  Calendar,
  StickyNote,
  Code2,
  PenTool,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function TopBar() {
  const { currentApp, toggleAIPanel, aiPanelOpen, toggleSearch } = useStore();
  const [autoSave, setAutoSave] = useState(true);
  const [docName, setDocName] = useState(() => {
    switch (currentApp) {
      case 'document': return 'Document1.docx';
      case 'spreadsheet': return 'Workbook1.xlsx';
      case 'presentation': return 'Presentation1.pptx';
      case 'email': return 'Outlook Mailbox';
      case 'calendar': return 'SG Calendar';
      case 'notes': return 'QuickNotes.one';
      case 'code-editor': return 'script.ts';
      default: return 'SG-Office Home';
    }
  });

  const getAppMeta = () => {
    switch (currentApp) {
      case 'document':
        return { name: 'Word', color: '#185abd', bg: '#e8f0fe', icon: <FileText size={18} className="text-[#185abd]" /> };
      case 'spreadsheet':
        return { name: 'Excel', color: '#107c41', bg: '#e6f4ea', icon: <Table2 size={18} className="text-[#107c41]" /> };
      case 'presentation':
        return { name: 'PowerPoint', color: '#c43e1c', bg: '#fce8e6', icon: <Presentation size={18} className="text-[#c43e1c]" /> };
      case 'email':
        return { name: 'Outlook', color: '#0078d4', bg: '#deecf9', icon: <Mail size={18} className="text-[#0078d4]" /> };
      case 'calendar':
        return { name: 'Calendar', color: '#0078d4', bg: '#deecf9', icon: <Calendar size={18} className="text-[#0078d4]" /> };
      case 'notes':
        return { name: 'OneNote', color: '#7719aa', bg: '#f3e8ff', icon: <StickyNote size={18} className="text-[#7719aa]" /> };
      case 'code-editor':
        return { name: 'DevStudio', color: '#008272', bg: '#e6f6f4', icon: <Code2 size={18} className="text-[#008272]" /> };
      case 'whiteboard':
        return { name: 'Whiteboard', color: '#d83b01', bg: '#fdf3ed', icon: <PenTool size={18} className="text-[#d83b01]" /> };
      default:
        return { name: 'SG-Office 365', color: '#0078d4', bg: '#deecf9', icon: <Grid size={18} className="text-[#0078d4]" /> };
    }
  };

  const appMeta = getAppMeta();

  return (
    <div className="flex items-center justify-between h-[48px] px-3 bg-white border-b border-[#edebe9] select-none text-[#201f1e]">
      {/* Left: Office Waffle, App Icon, AutoSave & Title */}
      <div className="flex items-center gap-3">
        {/* Microsoft 365 Waffle Icon */}
        <button
          onClick={toggleSearch}
          title="App Launcher"
          className="p-1.5 rounded-md hover:bg-[#f3f2f1] text-[#605e5c] transition-colors"
        >
          <div className="grid grid-cols-3 gap-0.5 w-4 h-4 p-0.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-1 h-1 bg-[#605e5c] rounded-full" />
            ))}
          </div>
        </button>

        {/* App Icon */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md" style={{ background: appMeta.bg }}>
            {appMeta.icon}
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: appMeta.color }}>
            {appMeta.name}
          </span>
        </div>

        {/* AutoSave Toggle Switch */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#edebe9]">
          <button
            onClick={() => {
              setAutoSave(!autoSave);
              toast(autoSave ? 'AutoSave turned off' : 'AutoSave is active (saving to OneDrive)');
            }}
            className="flex items-center gap-1.5 text-xs text-[#605e5c] hover:text-[#201f1e]"
          >
            <div
              className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                autoSave ? 'bg-[#107c41]' : 'bg-[#c8c6c4]'
              }`}
            >
              <div
                className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  autoSave ? 'translate-x-3' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-[11px] font-medium hidden sm:inline">AutoSave</span>
          </button>
        </div>

        {/* Document Title Editable */}
        <div className="flex items-center gap-1.5 pl-2">
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="text-xs font-semibold px-2 py-1 rounded hover:bg-[#f3f2f1] focus:bg-white focus:ring-1 focus:ring-[#185abd] outline-none text-[#201f1e] w-40 sm:w-56"
          />
          <span className="text-[11px] text-[#8a8886] hidden md:inline">• Saved to OneDrive</span>
        </div>
      </div>

      {/* Center: Search (Alt+Q) */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={toggleSearch}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 bg-[#f3f2f1] hover:bg-[#edebe9] rounded-md text-xs text-[#605e5c] transition-colors border border-transparent hover:border-[#d2d0ce]"
        >
          <Search size={14} className="text-[#605e5c]" />
          <span className="flex-1 text-left">Search (Alt + Q)</span>
          <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#edebe9] font-mono text-[#8a8886]">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Copilot, Share, Profile */}
      <div className="flex items-center gap-2">
        {/* Microsoft Copilot Button */}
        <button
          onClick={toggleAIPanel}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
            aiPanelOpen
              ? 'copilot-gradient text-white ring-2 ring-purple-300'
              : 'bg-white hover:bg-[#f8f9fa] border border-[#edebe9] text-[#201f1e]'
          }`}
        >
          <div className="w-4 h-4 rounded-full flex items-center justify-center copilot-gradient text-white">
            <Sparkles size={10} />
          </div>
          <span>Copilot</span>
        </button>

        {/* Share Button (Office Primary) */}
        <button
          onClick={() => toast.success('Link copied! Anyone with the link can edit.')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
          style={{ background: appMeta.color }}
        >
          <Share2 size={13} />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* User Account Circle */}
        <div className="pl-1 border-l border-[#edebe9] ml-1">
          <div
            title="Shiva Ganesh - SG Office Pro"
            className="w-8 h-8 rounded-full bg-[#185abd] text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 hover:ring-[#185abd]/30"
          >
            SG
          </div>
        </div>
      </div>
    </div>
  );
}
