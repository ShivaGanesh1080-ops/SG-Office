import { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  FileText,
  Table2,
  Presentation,
  Mail,
  Calendar,
  StickyNote,
  Code2,
  PenTool,
  Plus,
  Sparkles,
  Upload,
  ArrowRight,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { AppType } from '../../types';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { setCurrentApp, documents, deleteDocument, toggleAIPanel, addAIMessage, setActiveDocTitle, setActiveDocContent } = useStore();
  const [quickPrompt, setQuickPrompt] = useState('');

  const quickCreate = [
    { label: 'Word Document', app: 'document' as AppType, icon: <FileText size={20} className="text-[#185abd]" />, bg: '#e8f0fe', desc: 'New document' },
    { label: 'Excel Workbook', app: 'spreadsheet' as AppType, icon: <Table2 size={20} className="text-[#107c41]" />, bg: '#e6f4ea', desc: 'New spreadsheet' },
    { label: 'PowerPoint Deck', app: 'presentation' as AppType, icon: <Presentation size={20} className="text-[#c43e1c]" />, bg: '#fce8e6', desc: 'New presentation' },
    { label: 'Gmail', app: 'email' as AppType, icon: <Mail size={20} className="text-[#ea4335]" />, bg: '#fce8e6', desc: 'Google Mail' },
    { label: 'Calendar', app: 'calendar' as AppType, icon: <Calendar size={20} className="text-[#1a73e8]" />, bg: '#e8f0fe', desc: 'Schedules' },
    { label: 'OneNote', app: 'notes' as AppType, icon: <StickyNote size={20} className="text-[#7719aa]" />, bg: '#f3e8ff', desc: 'Quick notes' },
    { label: 'Whiteboard', app: 'whiteboard' as AppType, icon: <PenTool size={20} className="text-[#d83b01]" />, bg: '#fdf3ed', desc: 'Vector drawing' },
  ];

  const handleQuickCreateDoc = () => {
    setActiveDocTitle('New Document.docx');
    setActiveDocContent('<h1>New Document</h1><p>Start typing or ask Yella to write your content...</p>');
    setCurrentApp('document');
  };

  const handleYellaSubmit = () => {
    if (!quickPrompt.trim()) return;
    const p = quickPrompt;
    setQuickPrompt('');
    addAIMessage({
      id: Date.now().toString(),
      role: 'user',
      content: p,
      timestamp: new Date(),
    });
    toggleAIPanel();
    toast.success('Yella is processing your request...');
  };

  return (
    <div className="h-full overflow-y-auto bg-[#faf9f8] p-4 sm:p-6 lg:p-8 select-none text-[#201f1e]">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 1. Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#201f1e] tracking-tight">
              Good evening
            </h1>
            <p className="text-xs text-[#605e5c] mt-0.5">
              SG-Office Workspace • Powered by Yella AI
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickCreateDoc}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#185abd] hover:bg-[#106ebe] text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Plus size={14} /> New Document
            </button>
            <button
              onClick={toggleAIPanel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200 transition-all"
            >
              <Sparkles size={14} className="text-purple-600" /> Ask Yella
            </button>
          </div>
        </div>

        {/* 2. Quick Create Grid (Clean, responsive on 14-inch screens) */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#605e5c] mb-2.5">Create New</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {quickCreate.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  if (item.app === 'document') handleQuickCreateDoc();
                  else setCurrentApp(item.app);
                }}
                className="bg-white p-3 rounded-xl border border-[#edebe9] hover:border-[#c8c6c4] hover:shadow-xs text-left transition-all flex flex-col justify-between h-24 group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: item.bg }}>
                  {item.icon}
                </div>
                <div>
                  <span className="font-semibold text-xs text-[#201f1e] block truncate">{item.label}</span>
                  <span className="text-[10px] text-[#8a8886] block truncate">{item.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Yella Quick Action Input Bar */}
        <div className="bg-white p-3.5 rounded-xl border border-[#edebe9] shadow-2xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center">
              <Sparkles size={13} />
            </div>
            <span className="text-xs font-bold text-[#201f1e]">Yella AI Prompt Bar</span>
            <span className="text-[10px] text-[#8a8886] hidden sm:inline">— e.g., "Create a project proposal on cloud migration" or "Analyze CSV file"</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tell Yella to create a document, generate spreadsheet data, or draft slides..."
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleYellaSubmit(); }}
              className="flex-1 px-3 py-1.5 text-xs bg-[#f8f9fa] border border-[#d2d0ce] rounded-lg outline-none focus:border-purple-600 focus:bg-white"
            />
            <button
              onClick={handleYellaSubmit}
              disabled={!quickPrompt.trim()}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-40 hover:opacity-95"
            >
              Generate
            </button>
          </div>
        </div>

        {/* 4. Real Recent Documents Table */}
        <div className="bg-white rounded-xl border border-[#edebe9] shadow-2xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#edebe9] bg-[#faf9f8]">
            <span className="text-xs font-bold text-[#201f1e]">Recent Documents & Sheets</span>
            <span className="text-[11px] text-[#8a8886]">Saved in Local Workspace</span>
          </div>

          <div className="divide-y divide-[#edebe9]">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  if (doc.type === 'document') {
                    setActiveDocTitle(doc.title);
                    if (doc.content) setActiveDocContent(doc.content);
                    setCurrentApp('document');
                  } else if (doc.type === 'spreadsheet') {
                    setCurrentApp('spreadsheet');
                  } else if (doc.type === 'presentation') {
                    setCurrentApp('presentation');
                  }
                }}
                className="flex items-center justify-between px-5 py-3 hover:bg-[#f8f9fa] cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  {doc.type === 'document' && <FileText size={17} className="text-[#185abd]" />}
                  {doc.type === 'spreadsheet' && <Table2 size={17} className="text-[#107c41]" />}
                  {doc.type === 'presentation' && <Presentation size={17} className="text-[#c43e1c]" />}
                  {doc.type === 'note' && <StickyNote size={17} className="text-[#7719aa]" />}
                  <div>
                    <span className="font-semibold text-[#201f1e] block hover:text-[#185abd]">{doc.title}</span>
                    <span className="text-[10px] text-[#8a8886] block">
                      Updated {new Date(doc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {doc.tags.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(doc.id);
                      toast('Document removed');
                    }}
                    className="p-1 text-[#8a8886] hover:text-red-600 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                  <ArrowRight size={14} className="text-[#8a8886]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
