import { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import {
  Search,
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
  Plus,
  Sparkles,
  X,
  LayoutGrid,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { setCurrentApp, toggleSearch, toggleAIPanel } = useStore();

  const commands: CommandItem[] = [
    { id: 'dashboard', label: 'Office 365 Home', description: 'Portal overview & recent files', icon: <LayoutGrid size={18} className="text-[#0078d4]" />, action: () => { setCurrentApp(null); toggleSearch(); }, category: 'Applications' },
    { id: 'document', label: 'Word', description: 'Create and edit documents', icon: <FileText size={18} className="text-[#185abd]" />, action: () => { setCurrentApp('document'); toggleSearch(); }, category: 'Applications' },
    { id: 'spreadsheet', label: 'Excel', description: 'Spreadsheets, formulas, calculations', icon: <Table2 size={18} className="text-[#107c41]" />, action: () => { setCurrentApp('spreadsheet'); toggleSearch(); }, category: 'Applications' },
    { id: 'presentation', label: 'PowerPoint', description: 'Slide deck presentation studio', icon: <Presentation size={18} className="text-[#c43e1c]" />, action: () => { setCurrentApp('presentation'); toggleSearch(); }, category: 'Applications' },
    { id: 'email', label: 'Gmail', description: 'Check inbox & send messages', icon: <Mail size={18} className="text-[#ea4335]" />, action: () => { setCurrentApp('email'); toggleSearch(); }, category: 'Applications' },
    { id: 'calendar', label: 'Calendar', description: 'Schedule events & meetings', icon: <Calendar size={18} className="text-[#0078d4]" />, action: () => { setCurrentApp('calendar'); toggleSearch(); }, category: 'Applications' },
    { id: 'notes', label: 'OneNote', description: 'Notebooks and quick pages', icon: <StickyNote size={18} className="text-[#7719aa]" />, action: () => { setCurrentApp('notes'); toggleSearch(); }, category: 'Applications' },
    { id: 'code', label: 'DevStudio', description: 'TypeScript/Python sandbox runner', icon: <Code2 size={18} className="text-[#008272]" />, action: () => { setCurrentApp('code-editor'); toggleSearch(); }, category: 'Applications' },
    { id: 'whiteboard', label: 'Whiteboard', description: 'Freeform vector drawing canvas', icon: <PenTool size={18} className="text-[#d83b01]" />, action: () => { setCurrentApp('whiteboard'); toggleSearch(); }, category: 'Applications' },
    { id: 'ai', label: 'Yella AI Assistant', description: 'Autonomous intelligence & document creator', icon: <Sparkles size={18} className="text-[#8a44f8]" />, action: () => { setCurrentApp('ai-chat'); toggleSearch(); }, category: 'Yella AI' },
    { id: 'copilot-panel', label: 'Toggle Yella AI Drawer', description: 'Open Yella AI side drawer', icon: <Sparkles size={18} className="text-[#8a44f8]" />, action: () => { toggleAIPanel(); toggleSearch(); }, category: 'Yella AI' },
    { id: 'settings', label: 'Settings', description: 'Manage privacy vault and models', icon: <Settings size={18} className="text-[#605e5c]" />, action: () => { setCurrentApp('settings'); toggleSearch(); }, category: 'Preferences' },
  ];

  const filteredCommands = query
    ? commands.filter(
        (cmd) =>
          cmd.label.toLowerCase().includes(query.toLowerCase()) ||
          cmd.description.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const categories = [...new Set(filteredCommands.map((c) => c.category))];

  useEffect(() => {
    inputRef.current?.focus();
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleSearch();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] bg-black/30 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) toggleSearch();
      }}
    >
      <div className="w-[560px] bg-white rounded-xl shadow-2xl border border-[#edebe9] overflow-hidden animate-fade-in text-[#201f1e]">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#edebe9]">
          <Search size={18} className="text-[#605e5c]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps, files, or ask Yella AI (Alt + Q)..."
            className="flex-1 bg-transparent outline-none text-xs text-[#201f1e]"
          />
          <button onClick={toggleSearch} className="text-[#8a8886] hover:text-[#201f1e]">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto p-2">
          {categories.map((category) => (
            <div key={category} className="mb-2">
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8a8886] block">
                {category}
              </span>
              {filteredCommands
                .filter((cmd) => cmd.category === category)
                .map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left hover:bg-[#f3f2f1] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#f8f9fa] flex items-center justify-center border border-[#edebe9]">
                      {cmd.icon}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#201f1e] block">{cmd.label}</span>
                      <span className="text-[11px] text-[#605e5c] block">{cmd.description}</span>
                    </div>
                  </button>
                ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#faf9f8] border-t border-[#edebe9] text-[11px] text-[#8a8886]">
          <span>Navigate with ↑↓ • Select with ↵</span>
          <span>Esc to Close</span>
        </div>
      </div>
    </div>
  );
}
