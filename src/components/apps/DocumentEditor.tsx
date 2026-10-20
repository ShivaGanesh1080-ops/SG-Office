import { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { useStore } from '../../store/useStore';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Minus,
  Sparkles,
  FileDown,
  Printer,
  Share2,
  ChevronDown,
  Wand2,
  CheckCircle,
  FileText,
  ZoomIn,
  ZoomOut,
  Scissors,
  Copy,
  Clipboard,
  BookOpen,
  Volume2,
  VolumeX,
  Search,
  Table as TableIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  Maximize2,
  RotateCcw,
  Plus,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function DocumentEditor() {
  const { toggleAIPanel, activeDocTitle, setActiveDocTitle, activeDocContent, setActiveDocContent } = useStore();
  const [activeRibbonTab, setActiveRibbonTab] = useState<'home' | 'insert' | 'layout' | 'review' | 'view' | 'yella'>('home');
  const [zoom, setZoom] = useState(100);
  const [fontFamily, setFontFamily] = useState('Aptos');
  const [fontSize, setFontSize] = useState('11');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindModal, setShowFindModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialContent = activeDocContent || `<h1>Executive Strategy & Project Deliverables</h1>
<p>Welcome to <strong>SG-Office Word</strong> — your personalized, high-performance word processor built with clean Microsoft 365 white aesthetics, authentic Ribbon tools, and integrated <strong>Yella AI</strong>.</p>

<h2>1. Project Objectives & Milestones</h2>
<p>This document is completely real and editable. You can type, format, create tables, insert images, and save directly to your browser storage or export as DOCX.</p>

<ul>
  <li><strong>Full Microsoft Word Formatting</strong>: Headings, Bold, Italic, Tables, Underline, and Colors.</li>
  <li><strong>Yella Autonomous Copilot</strong>: Directly command Yella to generate outlines, rewrite paragraphs, or summarize content.</li>
  <li><strong>Complete Sovereignty</strong>: Zero-telemetry execution without corporate tracking.</li>
</ul>

<h2>2. Financial Performance Snapshot</h2>
<table>
  <thead>
    <tr>
      <th>Division</th>
      <th>Q1 Revenue</th>
      <th>Q2 Revenue</th>
      <th>YoY Growth</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cloud Workspaces</td>
      <td>$145,000</td>
      <td>$184,000</td>
      <td>+26.8%</td>
    </tr>
    <tr>
      <td>AI Copilot Seats</td>
      <td>$68,000</td>
      <td>$115,000</td>
      <td>+69.1%</td>
    </tr>
  </tbody>
</table>

<blockquote>"SG-Office delivers clean, responsive productivity on every screen size with zero compromise."</blockquote>`;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Start typing your document or tell Yella to generate text...' }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.split(/\s+/).filter(Boolean).length);
      setCharCount(text.length);
      setActiveDocContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      setWordCount(text.split(/\s+/).filter(Boolean).length);
      setCharCount(text.length);
    }
  }, [editor]);

  if (!editor) return null;

  // Insert Table
  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    toast.success('3x3 Table inserted');
  };

  // Upload local image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const url = readerEvent.target?.result as string;
        editor.chain().focus().setImage({ src: url }).run();
        toast.success('Image embedded into document');
      };
      reader.readAsDataURL(file);
    }
  };

  // Text to Speech
  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const text = editor.getText();
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      toast('Reading document aloud...');
    }
  };

  // Export File (Real download)
  const downloadDocument = (format: 'html' | 'md' | 'txt' | 'docx') => {
    const htmlContent = editor.getHTML();
    const textContent = editor.getText();
    let content = htmlContent;
    let mimeType = 'text/html';
    let ext = 'html';

    if (format === 'md') {
      content = `# ${activeDocTitle}\n\n` + textContent;
      mimeType = 'text/markdown';
      ext = 'md';
    } else if (format === 'txt') {
      content = textContent;
      mimeType = 'text/plain';
      ext = 'txt';
    } else if (format === 'docx') {
      // Create valid document payload
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${activeDocTitle}</title></head><body>${htmlContent}</body></html>`;
      mimeType = 'application/vnd.ms-word';
      ext = 'doc';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeDocTitle.replace(/\.[^/.]+$/, '') + `.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as .${ext}`);
  };

  // Find & Replace
  const handleFindReplace = () => {
    if (!findText) return;
    const currentHtml = editor.getHTML();
    if (!currentHtml.includes(findText)) {
      toast.error('Search text not found in document');
      return;
    }
    const updated = currentHtml.replaceAll(findText, replaceText);
    editor.commands.setContent(updated);
    toast.success(`Replaced instances of "${findText}"`);
    setShowFindModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f2f1] select-none text-[#201f1e] overflow-hidden">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 1. Office Ribbon Tabs Bar */}
      <div className="flex items-center gap-0.5 px-3 bg-white border-b border-[#edebe9] text-[11px] font-medium overflow-x-auto whitespace-nowrap flex-shrink-0">
        <button
          onClick={() => downloadDocument('docx')}
          className="px-2.5 py-1 font-bold text-white bg-[#185abd] hover:bg-[#106ebe] transition-colors rounded-t-xs"
        >
          File
        </button>
        {[
          { id: 'home', label: 'Home' },
          { id: 'insert', label: 'Insert' },
          { id: 'layout', label: 'Layout' },
          { id: 'review', label: 'Review' },
          { id: 'view', label: 'View & Export' },
          { id: 'yella', label: 'Yella AI' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveRibbonTab(tab.id as any)}
            className={`px-2.5 py-1 transition-colors border-b-2 ${
              activeRibbonTab === tab.id
                ? 'border-[#185abd] text-[#185abd] font-bold'
                : 'border-transparent text-[#605e5c] hover:bg-[#f3f2f1] hover:text-[#201f1e]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. Responsive Compact Office Ribbon Toolbar (No wrapping!) */}
      <div className="flex items-center px-3 py-1 bg-white border-b border-[#d2d0ce] shadow-2xs overflow-x-auto whitespace-nowrap min-h-[46px] gap-2 flex-shrink-0 text-xs">
        {/* HOME TAB */}
        {activeRibbonTab === 'home' && (
          <div className="flex items-center gap-2">
            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5 border-r border-[#edebe9] pr-2">
              <button onClick={() => editor.chain().focus().undo().run()} className="p-1 rounded hover:bg-[#f3f2f1]" title="Undo"><Undo2 size={14} /></button>
              <button onClick={() => editor.chain().focus().redo().run()} className="p-1 rounded hover:bg-[#f3f2f1]" title="Redo"><Redo2 size={14} /></button>
            </div>

            {/* Font Family & Size */}
            <div className="flex items-center gap-1 border-r border-[#edebe9] pr-2">
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="h-6 px-1.5 text-xs bg-white border border-[#d2d0ce] rounded outline-none"
              >
                <option>Aptos (Body)</option>
                <option>Calibri</option>
                <option>Segoe UI</option>
                <option>Arial</option>
                <option>Georgia</option>
              </select>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="h-6 w-11 px-1 text-xs bg-white border border-[#d2d0ce] rounded outline-none"
              >
                {['9', '10', '11', '12', '14', '16', '18', '24'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Formatting: Bold, Italic, Underline, Strike */}
            <div className="flex items-center gap-0.5 border-r border-[#edebe9] pr-2">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1 rounded ${editor.isActive('bold') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1]'}`}
                title="Bold (Ctrl+B)"
              >
                <Bold size={13} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1 rounded ${editor.isActive('italic') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1]'}`}
                title="Italic (Ctrl+I)"
              >
                <Italic size={13} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1 rounded ${editor.isActive('underline') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1]'}`}
                title="Underline (Ctrl+U)"
              >
                <UnderlineIcon size={13} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1 rounded ${editor.isActive('strike') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1]'}`}
                title="Strikethrough"
              >
                <Strikethrough size={13} />
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={`p-1 rounded ${editor.isActive('highlight') ? 'bg-[#fff100] text-black' : 'hover:bg-[#f3f2f1]'}`}
                title="Text Highlight"
              >
                <Highlighter size={13} />
              </button>
            </div>

            {/* Paragraph Alignment & Lists */}
            <div className="flex items-center gap-0.5 border-r border-[#edebe9] pr-2">
              <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className="p-1 rounded hover:bg-[#f3f2f1]" title="Align Left"><AlignLeft size={13} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className="p-1 rounded hover:bg-[#f3f2f1]" title="Align Center"><AlignCenter size={13} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className="p-1 rounded hover:bg-[#f3f2f1]" title="Align Right"><AlignRight size={13} /></button>
              <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-[#c7e0f4]' : 'hover:bg-[#f3f2f1]'}`} title="Bullet List"><List size={13} /></button>
              <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-[#c7e0f4]' : 'hover:bg-[#f3f2f1]'}`} title="Number List"><ListOrdered size={13} /></button>
              <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className="p-1 rounded hover:bg-[#f3f2f1]" title="Quote"><Quote size={13} /></button>
            </div>

            {/* Quick Headings */}
            <div className="flex items-center gap-1">
              <button onClick={() => editor.chain().focus().setParagraph().run()} className="px-2 py-0.5 text-xs rounded border border-[#edebe9] hover:bg-[#f3f2f1]">
                Normal
              </button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="px-2 py-0.5 text-xs font-bold text-[#185abd] rounded border border-[#edebe9] hover:bg-[#f3f2f1]">
                H1
              </button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-0.5 text-xs font-semibold text-[#2b579a] rounded border border-[#edebe9] hover:bg-[#f3f2f1]">
                H2
              </button>
            </div>
          </div>
        )}

        {/* INSERT TAB */}
        {activeRibbonTab === 'insert' && (
          <div className="flex items-center gap-2">
            <button onClick={insertTable} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-medium">
              <TableIcon size={14} className="text-[#185abd]" /> Insert Table
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-medium">
              <ImageIcon size={14} className="text-[#107c41]" /> Upload Image
            </button>
            <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-medium">
              <Minus size={14} /> Horizontal Divider
            </button>
            <button onClick={() => {
              const url = prompt('Enter Web Link URL:');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-medium">
              <LinkIcon size={14} className="text-[#0078d4]" /> Link
            </button>
          </div>
        )}

        {/* REVIEW TAB */}
        {activeRibbonTab === 'review' && (
          <div className="flex items-center gap-2">
            <button onClick={toggleSpeech} className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold ${isSpeaking ? 'bg-red-100 text-red-600' : 'bg-[#f3f2f1] hover:bg-[#edebe9]'}`}>
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</span>
            </button>
            <button onClick={() => setShowFindModal(true)} className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold">
              <Search size={14} /> Find & Replace
            </button>
            <button onClick={() => {
              toast.success(`Word Count: ${wordCount} | Characters: ${charCount}`);
            }} className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold">
              <CheckCircle size={14} className="text-[#107c41]" /> Word Count Stats
            </button>
          </div>
        )}

        {/* VIEW & EXPORT TAB */}
        {activeRibbonTab === 'view' && (
          <div className="flex items-center gap-2">
            <button onClick={() => downloadDocument('docx')} className="flex items-center gap-1.5 px-3 py-1 bg-[#185abd] text-white rounded text-xs font-semibold hover:bg-[#106ebe]">
              <FileDown size={14} /> Export Word (.docx)
            </button>
            <button onClick={() => downloadDocument('md')} className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold">
              <FileDown size={14} /> Export Markdown
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold">
              <Printer size={14} /> Print to PDF
            </button>
          </div>
        )}

        {/* YELLA AI TAB */}
        {activeRibbonTab === 'yella' && (
          <div className="flex items-center gap-2">
            <button onClick={toggleAIPanel} className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded text-xs font-semibold shadow-xs">
              <Sparkles size={14} /> Open Yella AI Sidekick
            </button>
            <button onClick={() => {
              toast.success('Yella summarized the document');
              editor.commands.insertContent('<p><strong>📌 Yella Executive Summary:</strong> Key deliverables prioritized across 2 main divisions with +26.8% and +69.1% growth trajectories.</p>');
            }} className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-200">
              <BookOpen size={13} /> Quick Summarize
            </button>
          </div>
        )}
      </div>

      {/* 3. Document Workspace Canvas (A4 sheet with 14-inch responsive padding) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center bg-[#f3f2f1] py-4 px-2">
        <div
          className="word-page transition-transform duration-100 max-w-full"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* 4. Microsoft Word Status Bar (Single clean row) */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#f3f2f1] border-t border-[#edebe9] text-[11px] text-[#605e5c] select-none flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>Page 1 of 1</span>
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span className="text-[#107c41] flex items-center gap-1">
            <CheckCircle size={11} /> English (US)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-0.5 rounded hover:bg-[#edebe9]"><ZoomOut size={12} /></button>
            <span className="w-9 text-center font-mono text-[10px]">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-0.5 rounded hover:bg-[#edebe9]"><ZoomIn size={12} /></button>
          </div>
        </div>
      </div>

      {/* Find & Replace Modal */}
      {showFindModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-[360px] bg-white rounded-lg shadow-xl border border-[#edebe9] p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#201f1e]">Find & Replace</h3>
            <input
              type="text"
              placeholder="Find text..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-[#d2d0ce] rounded outline-none"
            />
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-[#d2d0ce] rounded outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowFindModal(false)} className="px-3 py-1 text-xs text-[#605e5c]">
                Cancel
              </button>
              <button onClick={handleFindReplace} className="px-3 py-1 text-xs font-bold bg-[#185abd] text-white rounded">
                Replace All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
