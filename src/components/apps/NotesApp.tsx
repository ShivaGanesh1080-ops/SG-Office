import { useState } from 'react';
import {
  StickyNote,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Pin,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  updatedAt: string;
}

const sampleNotes: Note[] = [
  {
    id: '1',
    title: '🧠 AI Architecture Strategy',
    content: '- Implement cross-document knowledge graph\n- Local SLM (Small Language Model) cache for offline access\n- Semantic search vector database over user documents\n- Zero-telemetry policy for enterprise clients',
    category: 'Engineering',
    pinned: true,
    updatedAt: '2 hours ago',
  },
  {
    id: '2',
    title: '💡 Office Suite Feature Differentiators',
    content: '1. One-click convert Sheet tables to Interactive Presentations\n2. Real-time grammar & style suggestions tailored to personal voice\n3. Integrated Code Sandbox with execution for data analysts\n4. Infinite canvas whiteboard with AI flowchart generation',
    category: 'Ideas',
    pinned: true,
    updatedAt: 'Yesterday',
  },
];

export function NotesApp() {
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string>(sampleNotes[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleUpdate = (field: keyof Note, value: any) => {
    setNotes(notes.map((n) => (n.id === selectedNote.id ? { ...n, [field]: value, updatedAt: 'Just now' } : n)));
  };

  const handleCreate = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Quick Note',
      content: 'Start writing notes or markdown here...',
      category: 'General',
      pinned: false,
      updatedAt: 'Just now',
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    toast.success('OneNote page created');
  };

  return (
    <div className="flex h-full bg-white select-none text-[#201f1e]">
      {/* 1. Left List */}
      <div className="w-[300px] border-r border-[#edebe9] flex flex-col bg-[#faf9f8]">
        <div className="p-3 border-b border-[#edebe9] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote size={18} className="text-[#7719aa]" />
              <h2 className="text-xs font-bold text-[#201f1e]">OneNote Notebooks</h2>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#7719aa] hover:bg-[#5c1384] text-white rounded text-xs font-semibold"
            >
              <Plus size={13} /> Add Page
            </button>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-white border border-[#d2d0ce] rounded-md text-xs">
            <Search size={14} className="text-[#8a8886]" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#edebe9]">
          {notes.map((n) => {
            const isSelected = selectedNote?.id === n.id;
            return (
              <div
                key={n.id}
                onClick={() => setSelectedNoteId(n.id)}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-white border-l-4 border-l-[#7719aa] shadow-xs' : 'hover:bg-[#f3f2f1]'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#201f1e] truncate">{n.title}</span>
                  {n.pinned && <Pin size={11} className="text-[#7719aa]" />}
                </div>
                <p className="text-[11px] text-[#605e5c] line-clamp-2">{n.content}</p>
                <div className="flex justify-between items-center text-[10px] text-[#8a8886] mt-2">
                  <span className="bg-[#f3e8ff] text-[#7719aa] px-1.5 py-0.5 rounded font-medium">{n.category}</span>
                  <span>{n.updatedAt}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Editor */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedNote ? (
          <div className="p-8 max-w-4xl mx-auto w-full space-y-4">
            <input
              type="text"
              value={selectedNote.title}
              onChange={(e) => handleUpdate('title', e.target.value)}
              className="w-full text-2xl font-bold border-b border-[#edebe9] pb-2 text-[#201f1e] outline-none focus:border-[#7719aa]"
              placeholder="Page Title"
            />
            <textarea
              value={selectedNote.content}
              onChange={(e) => handleUpdate('content', e.target.value)}
              rows={20}
              className="w-full text-xs leading-relaxed text-[#201f1e] outline-none resize-none bg-transparent"
              placeholder="Type your notes..."
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
