import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
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
  Languages,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function DocumentEditor() {
  const [activeRibbonTab, setActiveRibbonTab] = useState<'home' | 'insert' | 'layout' | 'review' | 'copilot'>('home');
  const [zoom, setZoom] = useState(100);
  const [fontFamily, setFontFamily] = useState('Aptos');
  const [fontSize, setFontSize] = useState('11');
  const [wordCount, setWordCount] = useState(245);
  const { toggleAIPanel } = useStore();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Type your document text or ask Copilot to draft...' }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: `<h1>Quarterly Executive Strategy & AI Integration</h1>
<p>Welcome to <strong>SG-Office Word</strong> — featuring the authentic Microsoft Office 365 clean white interface, responsive Ribbon toolbar, and enterprise Copilot AI integration.</p>

<h2>1. Executive Summary</h2>
<p>In Q4 2026, our enterprise deployed the unified <em>SG-Office 365 Suite</em>, replacing legacy fragmented software. By bringing autonomous cross-document intelligence directly into Word, Excel, and PowerPoint, team productivity increased by <strong>340%</strong> while maintaining complete local privacy and zero telemetry leakage.</p>

<h2>2. Key Innovations Delivered</h2>
<ul>
  <li><strong>Authentic Office Ribbon & Clean White Page</strong>: Pixel-perfect Microsoft Word layout with precise A4 margins and crisp typography.</li>
  <li><strong>Universal Copilot Engine</strong>: Contextual assistance accessible across docs, sheets, and presentations.</li>
  <li><strong>Deep Privacy Guard</strong>: Local execution options with no corporate telemetry sent to third-party ad networks.</li>
</ul>

<blockquote>"SG-Office provides the exact familiarity and muscle memory of Microsoft Office, but with the intelligence, speed, and versatility of modern autonomous AI." — Product Leadership</blockquote>

<h2>3. Next Steps & Recommendations</h2>
<p>Review the accompanying financial models in <code>Workbook1.xlsx</code> and slide deck in <code>Presentation1.pptx</code> using the left navigation rail.</p>`,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount(text.split(/\s+/).filter(Boolean).length);
    },
  });

  if (!editor) return null;

  const handleCopilotAction = (action: string) => {
    toast.success(`Copilot: Analyzing document for '${action}'...`);
    toggleAIPanel();
  };

  return (
    <div className="flex flex-col h-full bg-[#f3f2f1] select-none text-[#201f1e]">
      {/* 1. Office Ribbon Tabs Bar */}
      <div className="flex items-center gap-1 px-4 bg-white border-b border-[#edebe9] text-xs font-medium">
        <button
          onClick={() => toast('File Menu: Save, Open, Export to PDF/DOCX')}
          className="px-3 py-1.5 font-bold text-white bg-[#185abd] hover:bg-[#106ebe] transition-colors rounded-t-sm"
        >
          File
        </button>
        {[
          { id: 'home', label: 'Home' },
          { id: 'insert', label: 'Insert' },
          { id: 'layout', label: 'Layout' },
          { id: 'review', label: 'Review' },
          { id: 'copilot', label: 'Copilot' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveRibbonTab(tab.id as any)}
            className={`px-3 py-1.5 transition-colors border-b-2 ${
              activeRibbonTab === tab.id
                ? 'border-[#185abd] text-[#185abd] font-semibold'
                : 'border-transparent text-[#605e5c] hover:bg-[#f3f2f1] hover:text-[#201f1e]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. Office Ribbon Toolbar Groups */}
      <div className="flex items-center px-4 bg-white border-b border-[#d2d0ce] shadow-xs overflow-x-auto min-h-[84px]">
        {activeRibbonTab === 'home' && (
          <div className="flex items-center h-full">
            {/* Undo/Redo */}
            <div className="ribbon-group">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => editor.chain().focus().undo().run()}
                  title="Undo (Ctrl+Z)"
                  className="p-1.5 rounded hover:bg-[#f3f2f1] text-[#605e5c]"
                >
                  <Undo2 size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().redo().run()}
                  title="Redo (Ctrl+Y)"
                  className="p-1.5 rounded hover:bg-[#f3f2f1] text-[#605e5c]"
                >
                  <Redo2 size={16} />
                </button>
              </div>
              <span className="ribbon-label">Undo</span>
            </div>

            {/* Clipboard */}
            <div className="ribbon-group">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    navigator.clipboard.readText().then((t) => editor.commands.insertContent(t));
                    toast.success('Pasted from clipboard');
                  }}
                  className="flex flex-col items-center p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c]"
                  title="Paste (Ctrl+V)"
                >
                  <Clipboard size={16} className="text-[#185abd]" />
                  <span className="text-[10px]">Paste</span>
                </button>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => toast('Cut (Ctrl+X)')} className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c]"><Scissors size={12} /></button>
                  <button onClick={() => toast('Copy (Ctrl+C)')} className="p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c]"><Copy size={12} /></button>
                </div>
              </div>
              <span className="ribbon-label">Clipboard</span>
            </div>

            {/* Font */}
            <div className="ribbon-group">
              <div className="space-y-1">
                {/* Font selector row */}
                <div className="flex items-center gap-1">
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="h-6 px-1.5 text-xs bg-white border border-[#e1dfdd] rounded hover:border-[#8a8886] outline-none text-[#201f1e]"
                  >
                    <option>Aptos (Body)</option>
                    <option>Calibri</option>
                    <option>Segoe UI</option>
                    <option>Arial</option>
                    <option>Times New Roman</option>
                  </select>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="h-6 w-12 px-1 text-xs bg-white border border-[#e1dfdd] rounded hover:border-[#8a8886] outline-none text-[#201f1e]"
                  >
                    {['9', '10', '11', '12', '14', '16', '18', '24', '32'].map((sz) => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>
                {/* Format buttons row */}
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1 rounded ${editor.isActive('bold') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1] text-[#201f1e]'}`}
                    title="Bold (Ctrl+B)"
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1 rounded ${editor.isActive('italic') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1] text-[#201f1e]'}`}
                    title="Italic (Ctrl+I)"
                  >
                    <Italic size={14} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`p-1 rounded ${editor.isActive('underline') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1] text-[#201f1e]'}`}
                    title="Underline (Ctrl+U)"
                  >
                    <UnderlineIcon size={14} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1 rounded ${editor.isActive('strike') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1] text-[#201f1e]'}`}
                    title="Strikethrough"
                  >
                    <Strikethrough size={14} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={`p-1 rounded ${editor.isActive('highlight') ? 'bg-[#fff100] text-black' : 'hover:bg-[#f3f2f1] text-[#201f1e]'}`}
                    title="Text Highlight Color"
                  >
                    <Highlighter size={14} />
                  </button>
                </div>
              </div>
              <span className="ribbon-label">Font</span>
            </div>

            {/* Paragraph */}
            <div className="ribbon-group">
              <div className="space-y-1">
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1] text-[#201f1e]'}`}
                    title="Bullets"
                  >
                    <List size={14} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1] text-[#201f1e]'}`}
                    title="Numbering"
                  >
                    <ListOrdered size={14} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-1 rounded ${editor.isActive('blockquote') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1] text-[#201f1e]'}`}
                    title="Quote"
                  >
                    <Quote size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-1 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-[#c7e0f4]' : 'hover:bg-[#f3f2f1]'}`}
                    title="Align Left"
                  >
                    <AlignLeft size={14} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-1 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-[#c7e0f4]' : 'hover:bg-[#f3f2f1]'}`}
                    title="Center"
                  >
                    <AlignCenter size={14} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-1 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-[#c7e0f4]' : 'hover:bg-[#f3f2f1]'}`}
                    title="Align Right"
                  >
                    <AlignRight size={14} />
                  </button>
                  <button
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={`p-1 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-[#c7e0f4]' : 'hover:bg-[#f3f2f1]'}`}
                    title="Justify"
                  >
                    <AlignJustify size={14} />
                  </button>
                </div>
              </div>
              <span className="ribbon-label">Paragraph</span>
            </div>

            {/* Styles */}
            <div className="ribbon-group">
              <div className="flex items-center gap-1.5 h-11">
                <button
                  onClick={() => editor.chain().focus().setParagraph().run()}
                  className="px-2 py-1 rounded border border-[#edebe9] hover:border-[#185abd] text-xs bg-white text-left min-w-[55px]"
                >
                  <span className="font-semibold block text-[11px]">Normal</span>
                  <span className="text-[9px] text-[#8a8886]">Aptos</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className="px-2 py-1 rounded border border-[#edebe9] hover:border-[#185abd] text-xs bg-white text-left min-w-[65px]"
                >
                  <span className="font-bold text-[#185abd] block text-[11px]">Heading 1</span>
                  <span className="text-[9px] text-[#8a8886]">18 pt</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className="px-2 py-1 rounded border border-[#edebe9] hover:border-[#185abd] text-xs bg-white text-left min-w-[65px]"
                >
                  <span className="font-semibold text-[#2b579a] block text-[11px]">Heading 2</span>
                  <span className="text-[9px] text-[#8a8886]">14 pt</span>
                </button>
              </div>
              <span className="ribbon-label">Styles</span>
            </div>

            {/* Microsoft Copilot Ribbon Section */}
            <div className="ribbon-group border-r-0 pl-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopilotAction('Draft & Rewrite')}
                  className="flex flex-col items-center p-1.5 rounded hover:bg-[#f3f2f1] text-[#201f1e] group"
                  title="Copilot Writing Assistant"
                >
                  <div className="w-6 h-6 rounded-md copilot-gradient flex items-center justify-center text-white mb-0.5 shadow-xs">
                    <Sparkles size={13} />
                  </div>
                  <span className="text-[10px] font-semibold copilot-text">Copilot</span>
                </button>
                <div className="flex flex-col gap-1 pl-1">
                  <button
                    onClick={() => handleCopilotAction('Summarize')}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-[#605e5c] hover:bg-[#f3f2f1]"
                  >
                    <BookOpen size={11} className="text-[#8a44f8]" /> Summarize
                  </button>
                  <button
                    onClick={() => handleCopilotAction('Translate')}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-[#605e5c] hover:bg-[#f3f2f1]"
                  >
                    <Languages size={11} className="text-[#0078d4]" /> Translate
                  </button>
                </div>
              </div>
              <span className="ribbon-label font-semibold copilot-text">AI Copilot</span>
            </div>
          </div>
        )}

        {activeRibbonTab !== 'home' && (
          <div className="flex items-center gap-3 py-3 text-xs text-[#605e5c]">
            <span>Active Ribbon Tab: <strong>{activeRibbonTab.toUpperCase()}</strong></span>
            <button
              onClick={() => setActiveRibbonTab('home')}
              className="text-[#185abd] hover:underline font-semibold"
            >
              ← Return to Home Tab
            </button>
          </div>
        )}
      </div>

      {/* 3. Document Workspace Canvas (Authentic A4 Sheet on Canvas Gray) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center bg-[#f3f2f1] py-6">
        <div
          className="word-page transition-transform duration-150"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* 4. Microsoft Word Clean Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-[#f3f2f1] border-t border-[#edebe9] text-[11px] text-[#605e5c] select-none">
        <div className="flex items-center gap-4">
          <span>Page 1 of 1</span>
          <span>{wordCount} words</span>
          <span className="flex items-center gap-1 text-[#107c41]">
            <CheckCircle size={12} /> English (United States)
          </span>
          <span className="text-[#8a8886]">Accessibility: Good to go</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-0.5 rounded hover:bg-[#edebe9]">
              <ZoomOut size={13} />
            </button>
            <span className="w-10 text-center font-mono">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-0.5 rounded hover:bg-[#edebe9]">
              <ZoomIn size={13} />
            </button>
          </div>
          <span className="text-[#8a8886]">Print Layout</span>
        </div>
      </div>
    </div>
  );
}
