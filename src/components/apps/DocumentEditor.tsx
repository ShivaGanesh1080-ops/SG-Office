import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
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
  Mic,
  MicOff,
  Columns,
  Square,
  Circle,
  ArrowRight,
  Star,
  Bookmark,
  FileCode,
  HelpCircle,
  Eye,
  Sliders,
  Type,
  Layout,
  Clock,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { queryYellaAI } from '../../services/aiService';

export function DocumentEditor() {
  const { toggleAIPanel, activeDocTitle, setActiveDocTitle, activeDocContent, setActiveDocContent } = useStore();
  const [activeRibbonTab, setActiveRibbonTab] = useState<'home' | 'insert' | 'layout' | 'references' | 'review' | 'view' | 'yella'>('home');
  const [zoom, setZoom] = useState(100);
  const [fontFamily, setFontFamily] = useState('Aptos');
  const [fontSize, setFontSize] = useState('11');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margins, setMargins] = useState<'normal' | 'narrow' | 'wide'>('normal');
  const [paperTheme, setPaperTheme] = useState<'white' | 'sepia' | 'dark'>('white');
  const [showRuler, setShowRuler] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindModal, setShowFindModal] = useState(false);
  const [showWordCountModal, setShowWordCountModal] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [tableGridHover, setTableGridHover] = useState<{ r: number; c: number }>({ r: 3, c: 3 });
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [fontColor, setFontColor] = useState('#201f1e');
  const [highlightColor, setHighlightColor] = useState('#ffeb3b');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialContent = activeDocContent || `<h1>Executive Project Charter & Operational Blueprint</h1>
<p>Authored in <strong>Word Online (Microsoft 365 Enterprise)</strong> with real-time editing, full ribbon controls, and <strong>Yella AI Copilot</strong>.</p>

<h2>1. Executive Summary & Vision</h2>
<p>This document provides the foundational architecture and strategic execution plan for enterprise deployment. Every section is fully editable with authentic Microsoft Word heading hierarchy, table controls, shape integration, and speech synthesis.</p>

<h2>2. Core Milestones & Resource Allocation</h2>
<ul>
  <li><strong>Architecture & Sovereign Validation</strong> — Full on-device execution with zero unauthorized corporate telemetry.</li>
  <li><strong>Cross-Suite Synchronization</strong> — Direct bidirectional workflows connecting Word, Excel, PowerPoint, and Gmail.</li>
  <li><strong>Multi-Model AI Failover</strong> — Autonomous fallback across Gemini models ensuring 100% uptime.</li>
</ul>

<h2>3. Performance & Growth Metrics</h2>
<table>
  <thead>
    <tr>
      <th>Strategic Pillar</th>
      <th>Q1 Baseline</th>
      <th>Q2 Target</th>
      <th>Target Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Workspace Velocity</td>
      <td>68.4%</td>
      <td>94.2%</td>
      <td><strong>Surpassed</strong></td>
    </tr>
    <tr>
      <td>Formula Accuracy</td>
      <td>92.1%</td>
      <td>99.8%</td>
      <td><strong>Verified</strong></td>
    </tr>
    <tr>
      <td>Data Sovereignty</td>
      <td>100%</td>
      <td>100%</td>
      <td><strong>Compliant</strong></td>
    </tr>
  </tbody>
</table>

<blockquote>"SG-Office delivers high-velocity Microsoft Office fidelity with zero compromise on privacy, performance, or AI responsiveness."</blockquote>
<p><em>Use the Ribbon above to insert tables, upload pictures, dictate via microphone, or command Yella AI to write and refine your content.</em></p>`;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Type here or press / for AI commands...' }),
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
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

  // Speech Recognition (Dictation) Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript && editor) {
          editor.commands.insertContent(transcript);
        }
      };

      recog.onerror = () => {
        setIsDictating(false);
        toast.error('Dictation microphone paused');
      };

      recog.onend = () => {
        setIsDictating(false);
      };

      setRecognition(recog);
    }
  }, [editor]);

  const toggleDictation = () => {
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser. Try Chrome/Edge.');
      return;
    }
    if (isDictating) {
      recognition.stop();
      setIsDictating(false);
      toast('Dictation stopped');
    } else {
      try {
        recognition.start();
        setIsDictating(true);
        toast.success('🎙️ Dictate is listening... Speak clearly into your microphone');
      } catch (e) {
        setIsDictating(false);
      }
    }
  };

  if (!editor) return null;

  // Insert Table via interactive grid
  const handleInsertGridTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    setShowTablePicker(false);
    toast.success(`Inserted ${rows}×${cols} Table`);
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
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${activeDocTitle}</title><style>body{font-family:'Segoe UI',sans-serif;line-height:1.6;padding:40px;}h1{color:#185abd;}table{border-collapse:collapse;width:100%;}td,th{border:1px solid #ccc;padding:8px;}</style></head><body>${htmlContent}</body></html>`;
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

  // Insert Table of Contents
  const insertTableOfContents = () => {
    const docText = editor.getHTML();
    const headingMatches = docText.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi) || [];
    if (headingMatches.length === 0) {
      toast('No headings found to build Table of Contents. Add Headings first!');
      return;
    }
    let tocHtml = `<div style="background:#f8f9fa;border:1px solid #e1dfdd;padding:16px;border-radius:6px;margin:16px 0;">
      <h3 style="margin-top:0;color:#185abd;border-bottom:1px solid #d2d0ce;padding-bottom:6px;">📑 Table of Contents</h3>
      <ol style="margin-bottom:0;padding-left:20px;">`;
    headingMatches.forEach((h) => {
      const title = h.replace(/<\/?h[1-3][^>]*>/gi, '');
      tocHtml += `<li><strong>${title}</strong></li>`;
    });
    tocHtml += `</ol></div>`;
    editor.chain().focus().insertContentAt(0, tocHtml).run();
    toast.success('Generated dynamic Table of Contents!');
  };

  // Insert Shape
  const insertShape = (shape: string) => {
    let shapeHtml = '';
    switch (shape) {
      case 'rect':
        shapeHtml = `<div style="display:inline-block;width:160px;height:70px;background:#185abd;color:white;border-radius:6px;display:flex;align-items:center;justify-center;font-weight:bold;margin:8px 0;text-align:center;line-height:70px;">Process Block</div>`;
        break;
      case 'circle':
        shapeHtml = `<div style="display:inline-block;width:80px;height:80px;background:#107c41;color:white;border-radius:50%;display:flex;align-items:center;justify-center;font-weight:bold;margin:8px 0;text-align:center;line-height:80px;">Node</div>`;
        break;
      case 'callout':
        shapeHtml = `<div style="background:#e8f0fe;border-left:4px solid #185abd;padding:12px 16px;border-radius:0 6px 6px 0;margin:12px 0;"><strong>💡 Key Takeaway:</strong> Add critical strategic note here.</div>`;
        break;
      case 'warning':
        shapeHtml = `<div style="background:#fff4ce;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 6px 6px 0;margin:12px 0;"><strong>⚠️ Compliance Note:</strong> Verify authorization before dissemination.</div>`;
        break;
    }
    editor.chain().focus().insertContent(shapeHtml).run();
    setShowShapeMenu(false);
    toast.success('Inserted shape');
  };

  // Quick AI Generation directly in Word
  const runAIWordAction = async (action: string) => {
    toast.loading('Yella AI is generating content...', { id: 'word-ai' });
    let prompt = '';
    const currentText = editor.getText();

    switch (action) {
      case 'summary':
        prompt = `Based on this document, create a punchy 3-bullet Executive Summary in HTML with strong tags:\n\n${currentText.slice(0, 1500)}`;
        break;
      case 'proposal':
        prompt = `Draft a formal Scope of Work & Deliverables section with a 3-column table for an enterprise proposal.`;
        break;
      case 'grammar':
        prompt = `Review this excerpt and provide a polished, executive-level rewrite:\n\n${currentText.slice(0, 800)}`;
        break;
      case 'translate':
        prompt = `Translate the first 2 paragraphs of this document into Spanish with clean HTML:\n\n${currentText.slice(0, 800)}`;
        break;
    }

    try {
      const res = await queryYellaAI(prompt, 'Word Document Context');
      editor.chain().focus().insertContent(res).run();
      toast.dismiss('word-ai');
      toast.success('Yella content inserted!');
    } catch (e) {
      toast.dismiss('word-ai');
      toast.error('AI generation completed locally');
    }
  };

  // Page Width calculation
  const getPageWidth = () => {
    if (orientation === 'landscape') return '1060px';
    return margins === 'narrow' ? '860px' : margins === 'wide' ? '740px' : '816px';
  };

  const getPagePadding = () => {
    if (margins === 'narrow') return '24px 36px';
    if (margins === 'wide') return '48px 72px';
    return '40px 52px';
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
          { id: 'references', label: 'References' },
          { id: 'review', label: 'Review' },
          { id: 'view', label: 'View' },
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

      {/* 2. Responsive Office Ribbon Toolbar */}
      <div className="flex items-center px-3 py-1 bg-white border-b border-[#d2d0ce] shadow-2xs overflow-x-auto whitespace-nowrap min-h-[46px] gap-2 flex-shrink-0 text-xs">
        {/* HOME TAB */}
        {activeRibbonTab === 'home' && (
          <div className="flex items-center gap-2">
            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5 border-r border-[#edebe9] pr-2">
              <button onClick={() => editor.chain().focus().undo().run()} className="p-1 rounded hover:bg-[#f3f2f1]" title="Undo"><Undo2 size={13} /></button>
              <button onClick={() => editor.chain().focus().redo().run()} className="p-1 rounded hover:bg-[#f3f2f1]" title="Redo"><Redo2 size={13} /></button>
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
                <option>Times New Roman</option>
                <option>Georgia</option>
                <option>Cascadia Code</option>
              </select>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="h-6 w-11 px-1 text-xs bg-white border border-[#d2d0ce] rounded outline-none"
              >
                {['8', '9', '10', '11', '12', '14', '16', '18', '24', '32'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Formatting: Bold, Italic, Underline, Strike, Colors */}
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
                onClick={() => editor.chain().focus().toggleHighlight({ color: highlightColor }).run()}
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
              <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className="p-1 rounded hover:bg-[#f3f2f1]" title="Justify"><AlignJustify size={13} /></button>
              <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-[#c7e0f4]' : 'hover:bg-[#f3f2f1]'}`} title="Bullet List"><List size={13} /></button>
              <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1 rounded ${editor.isActive('orderedList') ? 'bg-[#c7e0f4]' : 'hover:bg-[#f3f2f1]'}`} title="Numbered List"><ListOrdered size={13} /></button>
              <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className="p-1 rounded hover:bg-[#f3f2f1]" title="Quote"><Quote size={13} /></button>
            </div>

            {/* Styles Gallery Chips */}
            <div className="flex items-center gap-1 border-r border-[#edebe9] pr-2">
              <button onClick={() => editor.chain().focus().setParagraph().run()} className="px-2 py-0.5 text-[11px] rounded border border-[#edebe9] hover:bg-[#f3f2f1]">
                Normal
              </button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="px-2 py-0.5 text-[11px] font-bold text-[#185abd] rounded border border-[#edebe9] hover:bg-[#f3f2f1]">
                Heading 1
              </button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-0.5 text-[11px] font-semibold text-[#2b579a] rounded border border-[#edebe9] hover:bg-[#f3f2f1]">
                Heading 2
              </button>
              <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="px-2 py-0.5 text-[11px] font-medium text-[#444] rounded border border-[#edebe9] hover:bg-[#f3f2f1]">
                Heading 3
              </button>
            </div>

            {/* Dictate Microphone */}
            <button
              onClick={toggleDictation}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold ${
                isDictating ? 'bg-red-500 text-white animate-pulse' : 'bg-[#e8f0fe] text-[#185abd] hover:bg-[#d0e2fb]'
              }`}
              title="Dictate with voice"
            >
              {isDictating ? <MicOff size={13} /> : <Mic size={13} />}
              <span>{isDictating ? 'Listening...' : 'Dictate'}</span>
            </button>
          </div>
        )}

        {/* INSERT TAB */}
        {activeRibbonTab === 'insert' && (
          <div className="flex items-center gap-2">
            {/* Table Inserter with Grid Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTablePicker(!showTablePicker)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold"
              >
                <TableIcon size={14} className="text-[#185abd]" />
                <span>Table</span>
                <ChevronDown size={12} />
              </button>

              {showTablePicker && (
                <div className="absolute top-full left-0 mt-1 bg-white p-3 rounded-lg shadow-xl border border-[#edebe9] z-50 space-y-2">
                  <p className="text-[11px] font-bold text-[#605e5c]">
                    Insert Table: {tableGridHover.r} × {tableGridHover.c}
                  </p>
                  <div className="grid grid-cols-6 gap-1 p-1 bg-[#faf9f8] border border-[#edebe9] rounded">
                    {Array.from({ length: 6 }).map((_, rIdx) =>
                      Array.from({ length: 6 }).map((_, cIdx) => (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          onMouseEnter={() => setTableGridHover({ r: rIdx + 1, c: cIdx + 1 })}
                          onClick={() => handleInsertGridTable(rIdx + 1, cIdx + 1)}
                          className={`w-4 h-4 border cursor-pointer rounded-xs transition-colors ${
                            rIdx < tableGridHover.r && cIdx < tableGridHover.c
                              ? 'bg-[#185abd] border-[#106ebe]'
                              : 'bg-white border-[#d2d0ce]'
                          }`}
                        />
                      ))
                    )}
                  </div>
                  <div className="pt-1 border-t border-[#edebe9] flex justify-between gap-1 text-[10px]">
                    <button
                      onClick={() => editor.chain().focus().addRowAfter().run()}
                      className="px-1.5 py-0.5 rounded hover:bg-[#f3f2f1]"
                    >
                      + Row
                    </button>
                    <button
                      onClick={() => editor.chain().focus().addColumnAfter().run()}
                      className="px-1.5 py-0.5 rounded hover:bg-[#f3f2f1]"
                    >
                      + Col
                    </button>
                    <button
                      onClick={() => editor.chain().focus().deleteTable().run()}
                      className="px-1.5 py-0.5 text-red-600 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Picture Upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold"
            >
              <ImageIcon size={14} className="text-[#107c41]" />
              <span>Pictures</span>
            </button>

            {/* Shapes Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowShapeMenu(!showShapeMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold"
              >
                <Square size={14} className="text-[#f59e0b]" />
                <span>Shapes</span>
                <ChevronDown size={12} />
              </button>
              {showShapeMenu && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-white p-2 rounded-lg shadow-xl border border-[#edebe9] z-50 text-xs space-y-1">
                  <button onClick={() => insertShape('rect')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded flex items-center gap-2">
                    <Square size={13} /> Process Box
                  </button>
                  <button onClick={() => insertShape('circle')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded flex items-center gap-2">
                    <Circle size={13} /> Circular Node
                  </button>
                  <button onClick={() => insertShape('callout')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded flex items-center gap-2">
                    <Bookmark size={13} /> Info Callout
                  </button>
                  <button onClick={() => insertShape('warning')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded flex items-center gap-2 text-amber-700">
                    <HelpCircle size={13} /> Warning Box
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold"
            >
              <Minus size={14} /> Divider
            </button>

            {/* Hyperlink */}
            <button
              onClick={() => {
                const url = prompt('Enter Hyperlink URL:');
                if (url) editor.chain().focus().setLink({ href: url }).run();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold"
            >
              <LinkIcon size={14} className="text-[#185abd]" /> Link
            </button>
          </div>
        )}

        {/* LAYOUT TAB */}
        {activeRibbonTab === 'layout' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 border-r border-[#edebe9] pr-3">
              <span className="text-[11px] font-bold text-[#605e5c]">Orientation:</span>
              <button
                onClick={() => { setOrientation('portrait'); toast('Orientation: Portrait (8.5×11")'); }}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${orientation === 'portrait' ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1]'}`}
              >
                Portrait
              </button>
              <button
                onClick={() => { setOrientation('landscape'); toast('Orientation: Landscape (11×8.5")'); }}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${orientation === 'landscape' ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1]'}`}
              >
                Landscape
              </button>
            </div>

            <div className="flex items-center gap-1.5 border-r border-[#edebe9] pr-3">
              <span className="text-[11px] font-bold text-[#605e5c]">Margins:</span>
              {(['normal', 'narrow', 'wide'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMargins(m); toast(`Margins set to ${m}`); }}
                  className={`px-2 py-0.5 rounded capitalize text-xs ${margins === m ? 'bg-[#185abd] text-white font-bold' : 'hover:bg-[#f3f2f1]'}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#605e5c]">Paper:</span>
              <button
                onClick={() => setPaperTheme('white')}
                className={`px-2 py-0.5 rounded text-xs ${paperTheme === 'white' ? 'bg-white border font-bold shadow-2xs' : 'hover:bg-[#f3f2f1]'}`}
              >
                Classic White
              </button>
              <button
                onClick={() => setPaperTheme('sepia')}
                className={`px-2 py-0.5 rounded text-xs ${paperTheme === 'sepia' ? 'bg-[#fbf0d9] border font-bold text-[#5f4b32]' : 'hover:bg-[#f3f2f1]'}`}
              >
                Warm Sepia
              </button>
              <button
                onClick={() => setPaperTheme('dark')}
                className={`px-2 py-0.5 rounded text-xs ${paperTheme === 'dark' ? 'bg-[#1f1f1f] text-white font-bold' : 'hover:bg-[#f3f2f1]'}`}
              >
                Dark Canvas
              </button>
            </div>
          </div>
        )}

        {/* REFERENCES TAB */}
        {activeRibbonTab === 'references' && (
          <div className="flex items-center gap-2">
            <button
              onClick={insertTableOfContents}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#e8f0fe] text-[#185abd] rounded font-semibold text-xs hover:bg-[#d0e2fb]"
            >
              <Bookmark size={13} /> Insert Table of Contents
            </button>
            <button
              onClick={() => {
                editor.commands.insertContent('<hr/><p><small><em>* Citation 1: SG-Office Autonomous Enterprise Framework, Shiva Ganesh, 2027.</em></small></p>');
                toast.success('Inserted footnote citation');
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              Insert Footnote
            </button>
          </div>
        )}

        {/* REVIEW TAB */}
        {activeRibbonTab === 'review' && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSpeech}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold ${
                isSpeaking ? 'bg-red-100 text-red-600' : 'bg-[#f3f2f1] hover:bg-[#edebe9]'
              }`}
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</span>
            </button>

            <button
              onClick={() => setShowFindModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold"
            >
              <Search size={14} /> Find & Replace
            </button>

            <button
              onClick={() => setShowWordCountModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold"
            >
              <CheckCircle size={14} className="text-[#107c41]" /> Word Count Stats
            </button>
          </div>
        )}

        {/* VIEW TAB */}
        {activeRibbonTab === 'view' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRuler(!showRuler)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold ${showRuler ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1]'}`}
            >
              <Sliders size={13} /> Ruler
            </button>
            <div className="w-px h-5 bg-[#edebe9]" />
            <button onClick={() => setZoom(100)} className="px-2 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold">
              100%
            </button>
            <button onClick={() => setZoom(125)} className="px-2 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold">
              Page Width
            </button>
            <button onClick={() => downloadDocument('docx')} className="flex items-center gap-1.5 px-3 py-1 bg-[#185abd] text-white rounded text-xs font-semibold hover:bg-[#106ebe]">
              <FileDown size={14} /> Export Word (.docx)
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold">
              <Printer size={14} /> Print
            </button>
          </div>
        )}

        {/* YELLA AI TAB */}
        {activeRibbonTab === 'yella' && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAIPanel}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded text-xs font-semibold shadow-xs"
            >
              <Sparkles size={13} /> Open Yella AI Sidekick
            </button>
            <button
              onClick={() => runAIWordAction('summary')}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-200"
            >
              <Wand2 size={13} /> Auto Executive Summary
            </button>
            <button
              onClick={() => runAIWordAction('proposal')}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-200"
            >
              <BookOpen size={13} /> Draft Deliverables Table
            </button>
            <button
              onClick={() => runAIWordAction('grammar')}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-200"
            >
              <CheckCircle size={13} /> Polish Writing
            </button>
            <button
              onClick={() => runAIWordAction('translate')}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-200"
            >
              Translate (ES)
            </button>
          </div>
        )}
      </div>

      {/* 3. Horizontal Visual Ruler (Authentic MS Word experience) */}
      {showRuler && (
        <div className="flex items-center justify-center bg-[#faf9f8] border-b border-[#e1dfdd] h-5 px-4 overflow-hidden select-none">
          <div style={{ width: getPageWidth() }} className="h-full flex items-center justify-between text-[9px] text-[#8a8886] font-mono px-6">
            <span>| 1"</span>
            <span>· · ·</span>
            <span>| 2"</span>
            <span>· · ·</span>
            <span>| 3"</span>
            <span>· · ·</span>
            <span>| 4"</span>
            <span>· · ·</span>
            <span>| 5"</span>
            <span>· · ·</span>
            <span>| 6"</span>
            <span>· · ·</span>
            <span>| 7"</span>
            <span>· · ·</span>
            <span>| 8"</span>
          </div>
        </div>
      )}

      {/* 4. Document Workspace Canvas (Authentic A4/Letter Paper) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex justify-center bg-[#e5e5e5] py-6 px-4">
        <div
          className={`word-page transition-all duration-150 rounded shadow-xl ${
            paperTheme === 'sepia' ? 'bg-[#fcf8ed] text-[#433422]' : paperTheme === 'dark' ? 'bg-[#1e1e1e] text-[#f0f0f0]' : 'bg-white text-[#201f1e]'
          }`}
          style={{
            width: getPageWidth(),
            minHeight: orientation === 'landscape' ? '700px' : '1050px',
            padding: getPagePadding(),
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            fontFamily: fontFamily.split(' ')[0],
            fontSize: `${fontSize}pt`,
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* 5. Microsoft Word Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-white border-t border-[#edebe9] text-[11px] text-[#605e5c] select-none flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>Page 1 of 1</span>
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span className="text-[#107c41] flex items-center gap-1 font-medium">
            <CheckCircle size={12} /> English (US)
          </span>
          <span className="hidden sm:inline text-[#8a8886]">
            ~{Math.max(1, Math.ceil(wordCount / 200))} min read
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-[10px] bg-[#f3f2f1] px-1.5 py-0.5 rounded font-medium">
            {orientation.toUpperCase()} • {margins.toUpperCase()}
          </span>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-0.5 rounded hover:bg-[#edebe9]"><ZoomOut size={12} /></button>
            <span className="w-10 text-center font-mono text-[10px]">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(180, zoom + 10))} className="p-0.5 rounded hover:bg-[#edebe9]"><ZoomIn size={12} /></button>
          </div>
        </div>
      </div>

      {/* Word Count Statistics Modal */}
      {showWordCountModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="w-[340px] bg-white rounded-lg shadow-2xl border border-[#edebe9] p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#201f1e] border-b pb-2">Word Count Statistics</h3>
            <div className="space-y-1.5 text-xs text-[#201f1e]">
              <div className="flex justify-between py-1 border-b border-[#f3f2f1]"><span>Pages:</span><strong>1</strong></div>
              <div className="flex justify-between py-1 border-b border-[#f3f2f1]"><span>Words:</span><strong>{wordCount}</strong></div>
              <div className="flex justify-between py-1 border-b border-[#f3f2f1]"><span>Characters (no spaces):</span><strong>{charCount - (editor.getText().match(/\s/g)?.length || 0)}</strong></div>
              <div className="flex justify-between py-1 border-b border-[#f3f2f1]"><span>Characters (with spaces):</span><strong>{charCount}</strong></div>
              <div className="flex justify-between py-1 border-b border-[#f3f2f1]"><span>Paragraphs:</span><strong>{editor.getText().split(/\n+/).filter(Boolean).length}</strong></div>
              <div className="flex justify-between py-1"><span>Estimated Reading Time:</span><strong>~{Math.max(1, Math.ceil(wordCount / 200))} min</strong></div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowWordCountModal(false)}
                className="px-4 py-1 text-xs font-bold bg-[#185abd] text-white rounded hover:bg-[#106ebe]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Find & Replace Modal */}
      {showFindModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
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
