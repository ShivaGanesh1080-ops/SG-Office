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
  Clock,
  Star,
  Sparkles,
  Users,
  Search,
  HardDrive,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import { AppType } from '../../types';

export function Dashboard() {
  const { setCurrentApp, documents, toggleAIPanel } = useStore();

  const quickCreate = [
    { label: 'Word Document', app: 'document' as AppType, icon: <FileText size={22} className="text-[#185abd]" />, bg: '#e8f0fe', desc: 'New blank document' },
    { label: 'Excel Workbook', app: 'spreadsheet' as AppType, icon: <Table2 size={22} className="text-[#107c41]" />, bg: '#e6f4ea', desc: 'New blank workbook' },
    { label: 'PowerPoint Deck', app: 'presentation' as AppType, icon: <Presentation size={22} className="text-[#c43e1c]" />, bg: '#fce8e6', desc: 'New presentation' },
    { label: 'Outlook Email', app: 'email' as AppType, icon: <Mail size={22} className="text-[#0078d4]" />, bg: '#deecf9', desc: 'Compose message' },
    { label: 'OneNote Page', app: 'notes' as AppType, icon: <StickyNote size={22} className="text-[#7719aa]" />, bg: '#f3e8ff', desc: 'Capture quick notes' },
    { label: 'Whiteboard', app: 'whiteboard' as AppType, icon: <PenTool size={22} className="text-[#d83b01]" />, bg: '#fdf3ed', desc: 'Diagram & brainstorm' },
    { label: 'DevStudio Code', app: 'code-editor' as AppType, icon: <Code2 size={22} className="text-[#008272]" />, bg: '#e6f6f4', desc: 'Run TypeScript/Python' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#faf9f8] p-8 select-none text-[#201f1e]">
      {/* 1. Header Banner */}
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#201f1e] tracking-tight">
              Good evening, Shiva Ganesh
            </h1>
            <p className="text-xs text-[#605e5c] mt-1">
              Welcome to SG-Office 365 • Enterprise AI Assistant Active
            </p>
          </div>
          <button
            onClick={toggleAIPanel}
            className="flex items-center gap-2 px-4 py-2 rounded-full copilot-gradient text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-all"
          >
            <Sparkles size={14} /> Open Microsoft Copilot
          </button>
        </div>

        {/* 2. Quick Create Grid (Clean white tiles) */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#605e5c] mb-3">Create New</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {quickCreate.map((item) => (
              <button
                key={item.label}
                onClick={() => setCurrentApp(item.app)}
                className="bg-white p-4 rounded-lg border border-[#edebe9] hover:border-[#c8c6c4] hover:shadow-sm text-left transition-all flex flex-col justify-between h-28 group"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: item.bg }}>
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

        {/* 3. Recent Documents & Activity List */}
        <div className="bg-white rounded-lg border border-[#edebe9] shadow-xs overflow-hidden">
          {/* Tabs bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#edebe9] bg-[#faf9f8]">
            <div className="flex items-center gap-6 text-xs font-semibold">
              <button className="text-[#185abd] border-b-2 border-[#185abd] pb-2 font-bold">Recent</button>
              <button className="text-[#605e5c] hover:text-[#201f1e] pb-2">Pinned</button>
              <button className="text-[#605e5c] hover:text-[#201f1e] pb-2">Shared with me</button>
            </div>
            <span className="text-[11px] text-[#8a8886]">AutoSave Synced with OneDrive</span>
          </div>

          {/* Document Rows */}
          <div className="divide-y divide-[#edebe9]">
            {[
              { title: 'Quarterly Executive Strategy & AI Integration.docx', type: 'doc', date: 'Just now', size: '24 KB', app: 'document' as AppType },
              { title: 'Financial Forecasting Model Q4.xlsx', type: 'sheet', date: 'Today at 04:15 PM', size: '1.2 MB', app: 'spreadsheet' as AppType },
              { title: 'Enterprise AI Architecture Keynote.pptx', type: 'ppt', date: 'Yesterday', size: '8.4 MB', app: 'presentation' as AppType },
              { title: 'Architecture Flow & Vector Notes.one', type: 'note', date: '3 days ago', size: '110 KB', app: 'notes' as AppType },
            ].map((doc, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentApp(doc.app)}
                className="flex items-center justify-between px-6 py-3.5 hover:bg-[#f8f9fa] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  {doc.type === 'doc' && <FileText size={18} className="text-[#185abd]" />}
                  {doc.type === 'sheet' && <Table2 size={18} className="text-[#107c41]" />}
                  {doc.type === 'ppt' && <Presentation size={18} className="text-[#c43e1c]" />}
                  {doc.type === 'note' && <StickyNote size={18} className="text-[#7719aa]" />}
                  <div>
                    <span className="text-xs font-semibold text-[#201f1e] block hover:text-[#185abd]">{doc.title}</span>
                    <span className="text-[10px] text-[#8a8886] block">OneDrive &gt; Documents &gt; Work</span>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-xs text-[#605e5c]">
                  <span>{doc.date}</span>
                  <span className="w-16 text-right font-mono text-[11px] text-[#8a8886]">{doc.size}</span>
                  <button className="text-[#8a8886] hover:text-[#201f1e]"><MoreVertical size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Microsoft Copilot Insights Banner */}
        <div className="bg-white p-5 rounded-lg border border-[#edebe9] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg copilot-gradient flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#201f1e]">Microsoft Copilot Enterprise Integration</h3>
              <p className="text-xs text-[#605e5c]">
                Cross-document autonomous reasoning ready. Use <strong>Ctrl + K</strong> anywhere in SG-Office to query files, draft emails, or generate spreadsheets.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentApp('ai-chat')}
            className="px-4 py-2 bg-[#f3f2f1] hover:bg-[#edebe9] rounded-md text-xs font-semibold text-[#201f1e] border border-[#d2d0ce]"
          >
            Chat with Copilot
          </button>
        </div>
      </div>
    </div>
  );
}
