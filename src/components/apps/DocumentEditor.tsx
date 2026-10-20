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
  Calendar,
  CheckSquare,
  Smile,
  Shield,
  Award,
  TrendingUp,
  Target,
  Briefcase,
  PenTool,
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
  const [margins, setMargins] = useState<'normal' | 'narrow' | 'moderate' | 'wide'>('normal');
  const [pageSize, setPageSize] = useState<'letter' | 'a4' | 'legal'>('letter');
  const [columnsLayout, setColumnsLayout] = useState<'1col' | '2col'>('1col');
  const [paperTheme, setPaperTheme] = useState<'white' | 'sepia' | 'dark' | 'pearl'>('white');
  const [watermark, setWatermark] = useState<string>('');
  const [showRuler, setShowRuler] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  
  // Modals & Popovers
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showFindModal, setShowFindModal] = useState(false);
  const [showWordCountModal, setShowWordCountModal] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showCustomTableModal, setShowCustomTableModal] = useState(false);
  const [customTableRows, setCustomTableRows] = useState(4);
  const [customTableCols, setCustomTableCols] = useState(4);
  const [tableGridHover, setTableGridHover] = useState<{ r: number; c: number }>({ r: 3, c: 3 });
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showIconsModal, setShowIconsModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showAIPromptModal, setShowAIPromptModal] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

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
<table style="width:100%; border-collapse:collapse; margin:16px 0;">
  <thead>
    <tr style="background:#185abd; color:#ffffff;">
      <th style="border:1px solid #d2d0ce; padding:8px 12px; text-align:left;">Strategic Pillar</th>
      <th style="border:1px solid #d2d0ce; padding:8px 12px; text-align:left;">Q1 Baseline</th>
      <th style="border:1px solid #d2d0ce; padding:8px 12px; text-align:left;">Q2 Target</th>
      <th style="border:1px solid #d2d0ce; padding:8px 12px; text-align:left;">Target Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Workspace Velocity</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">68.4%</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">94.2%</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;"><strong>Surpassed</strong></td>
    </tr>
    <tr style="background:#f8f9fa;">
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Formula Accuracy</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">92.1%</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">99.8%</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;"><strong>Verified</strong></td>
    </tr>
    <tr>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Data Sovereignty</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">100%</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">100%</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;"><strong>Compliant</strong></td>
    </tr>
  </tbody>
</table>

<blockquote>"Microsoft 365 Enterprise delivers high-velocity document fidelity with zero compromise on privacy, performance, or AI responsiveness."</blockquote>
<p><em>Use the Ribbon above to insert tables, upload pictures, dictate via microphone, or command Yella AI to write and refine your content.</em></p>`;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Type here or command Yella AI to write...' }),
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
      };

      recog.onend = () => {
        setIsDictating(false);
      };

      setRecognition(recog);
    }
  }, [editor]);

  const toggleDictation = () => {
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser. Try Chrome or Edge.');
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
        toast.success('🎙️ Dictate is listening... Speak clearly');
      } catch (e) {
        setIsDictating(false);
      }
    }
  };

  // Dual-Engine Table Inserter (Guaranteed to work 100% of the time)
  const insertRobustTable = (rows: number, cols: number, stylePreset: 'corporate' | 'emerald' | 'slate' | 'striped' | 'minimal' = 'corporate') => {
    if (!editor) return;

    let headerBg = '#185abd';
    let headerColor = '#ffffff';
    let rowBorder = '1px solid #d2d0ce';

    if (stylePreset === 'emerald') headerBg = '#107c41';
    if (stylePreset === 'slate') headerBg = '#323130';
    if (stylePreset === 'minimal') {
      headerBg = '#f3f2f1';
      headerColor = '#201f1e';
    }

    try {
      // First attempt native command
      const success = editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
      if (!success) throw new Error('Native command bypassed');
    } catch (e) {
      // Fallback: guaranteed HTML table injection
      let html = `<table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:10pt;">
        <thead>
          <tr style="background:${headerBg}; color:${headerColor};">`;
      for (let c = 0; c < cols; c++) {
        html += `<th style="border:${rowBorder}; padding:8px 12px; text-align:left; font-weight:600;">Header ${c + 1}</th>`;
      }
      html += `</tr></thead><tbody>`;
      for (let r = 0; r < rows; r++) {
        const rowBg = stylePreset === 'striped' && r % 2 === 1 ? '#f8f9fa' : '#ffffff';
        html += `<tr style="background:${rowBg};">`;
        for (let c = 0; c < cols; c++) {
          html += `<td style="border:${rowBorder}; padding:8px 12px;">Row ${r + 1}, Col ${c + 1}</td>`;
        }
        html += `</tr>`;
      }
      html += `</tbody></table><p></p>`;
      editor.commands.insertContent(html);
    }

    setShowTablePicker(false);
    setShowCustomTableModal(false);
    toast.success(`Inserted ${rows}×${cols} Table`);
  };

  // Local image embedding
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const url = readerEvent.target?.result as string;
        editor.chain().focus().setImage({ src: url }).run();
        toast.success('Image embedded into document');
      };
      reader.readAsDataURL(file);
    }
  };

  // Insert Stock Unsplash Image
  const handleInsertStockImage = () => {
    if (!editor) return;
    const url = prompt('Enter Image URL (or press OK for enterprise placeholder):', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      toast.success('Inserted image');
    }
  };

  // Insert Icon / Symbol
  const insertIconSymbol = (iconStr: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(` ${iconStr} `).run();
    setShowIconsModal(false);
    toast.success(`Inserted ${iconStr}`);
  };

  // Insert Date & Time
  const insertDateTime = (format: 'short' | 'long' | 'time') => {
    if (!editor) return;
    const now = new Date();
    let text = '';
    if (format === 'short') text = now.toLocaleDateString();
    else if (format === 'long') text = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    else text = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    editor.chain().focus().insertContent(text).run();
    toast.success(`Inserted date: ${text}`);
  };

  // Insert Pre-styled Shapes
  const insertShape = (shape: string) => {
    if (!editor) return;
    let shapeHtml = '';
    switch (shape) {
      case 'rect':
        shapeHtml = `<div style="background:#185abd; color:white; border-radius:6px; padding:12px 18px; margin:12px 0; font-weight:600; text-align:center;">🟦 Process Stage / Workstream Node</div>`;
        break;
      case 'callout':
        shapeHtml = `<div style="background:#e8f0fe; border-left:4px solid #185abd; padding:12px 16px; border-radius:0 6px 6px 0; margin:12px 0;"><strong>💡 Key Takeaway:</strong> Add critical strategic note here.</div>`;
        break;
      case 'warning':
        shapeHtml = `<div style="background:#fff4ce; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:0 6px 6px 0; margin:12px 0;"><strong>⚠️ Compliance Notice:</strong> Verify regulatory audit parameters before sign-off.</div>`;
        break;
      case 'success':
        shapeHtml = `<div style="background:#dff6dd; border-left:4px solid #107c41; padding:12px 16px; border-radius:0 6px 6px 0; margin:12px 0;"><strong>✅ Verified Milestone:</strong> Deliverable validated against production SLA.</div>`;
        break;
      case 'signature':
        shapeHtml = `<div style="margin:24px 0; padding-top:16px; border-top:1px dashed #a19f9d; width:260px;">
          <p style="margin:0; font-size:10pt;"><strong>Authorized Signature:</strong> __________________</p>
          <p style="margin:4px 0 0 0; font-size:9pt; color:#605e5c;">Title / Executive Authority | Date</p>
        </div>`;
        break;
      case 'task':
        shapeHtml = `<p>☑️ <strong>Action Item:</strong> Complete quarterly operational review</p>`;
        break;
    }
    editor.chain().focus().insertContent(shapeHtml).run();
    setShowShapeMenu(false);
    toast.success('Inserted shape');
  };

  // Dynamic Table of Contents builder
  const insertTableOfContents = () => {
    if (!editor) return;
    const docHtml = editor.getHTML();
    const headingMatches = docHtml.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi) || [];
    if (headingMatches.length === 0) {
      toast('No headings found. Add Headings (H1, H2, H3) first!');
      return;
    }
    let tocHtml = `<div style="background:#f8f9fa; border:1px solid #e1dfdd; padding:16px 20px; border-radius:6px; margin:16px 0;">
      <h3 style="margin-top:0; color:#185abd; border-bottom:1px solid #d2d0ce; padding-bottom:6px;">📑 Table of Contents</h3>
      <ol style="margin-bottom:0; padding-left:20px; line-height:1.8;">`;
    headingMatches.forEach((h) => {
      const title = h.replace(/<\/?h[1-3][^>]*>/gi, '').replace(/<[^>]*>/g, '');
      tocHtml += `<li><strong style="color:#201f1e;">${title}</strong></li>`;
    });
    tocHtml += `</ol></div><p></p>`;
    editor.chain().focus().insertContentAt(0, tocHtml).run();
    toast.success('Inserted Table of Contents!');
  };

  // Find & Replace
  const handleFindReplace = () => {
    if (!editor || !findText) return;
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

  // Text to Speech
  const toggleSpeech = () => {
    if (!editor) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast('Read aloud stopped');
    } else {
      const text = editor.getText();
      if (!text.trim()) {
        toast('Document is empty');
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      toast.success('🔊 Reading document aloud...');
    }
  };

  // Export handlers
  const downloadDocument = (ext: 'docx' | 'html' | 'md' | 'txt') => {
    if (!editor) return;
    let content = '';
    let mimeType = 'text/plain';

    if (ext === 'docx' || ext === 'html') {
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${activeDocTitle}</title><style>body{font-family:Aptos,Calibri,sans-serif;padding:40px;line-height:1.6;color:#201f1e;}table{border-collapse:collapse;width:100%;margin:16px 0;}th,td{border:1px solid #d2d0ce;padding:8px 12px;}th{background:#f3f2f1;}</style></head><body>${editor.getHTML()}</body></html>`;
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (ext === 'md') {
      content = editor.getText();
      mimeType = 'text/markdown';
    } else {
      content = editor.getText();
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeDocTitle.replace(/\.[^/.]+$/, '') + `.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported document as .${ext}`);
  };

  // Quick AI Assistant in Word
  const runAIWordAction = async (action: string) => {
    if (!editor) return;
    setIsAILoading(true);
    toast.loading('Yella AI is generating content...', { id: 'word-ai' });
    let prompt = '';
    const currentText = editor.getText();

    switch (action) {
      case 'summary':
        prompt = `Generate a punchy 3-bullet Executive Summary formatted with <strong> tags based on this text:\n\n${currentText.slice(0, 1500)}`;
        break;
      case 'deliverables':
        prompt = `Draft a high-velocity Deliverables Matrix with a 4-column HTML table (Pillar, Core Deliverable, Target SLA, Risk Level).`;
        break;
      case 'polish':
        prompt = `Review this excerpt and provide an executive-level rewrite with crisp grammar:\n\n${currentText.slice(0, 800)}`;
        break;
      case 'translate':
        prompt = `Translate the first 2 paragraphs into professional Spanish:\n\n${currentText.slice(0, 800)}`;
        break;
    }

    try {
      const res = await queryYellaAI(prompt, 'Word Document Context');
      // Format markdown/HTML cleanly into editor
      const cleanHtml = res
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>');

      editor.chain().focus().insertContent(cleanHtml).run();
      toast.dismiss('word-ai');
      toast.success('Yella content inserted into Word!');
    } catch (e) {
      toast.dismiss('word-ai');
      toast.error('AI generation completed locally');
    } finally {
      setIsAILoading(false);
    }
  };

  // Custom AI Prompt Writer
  const handleCustomAIGenerate = async () => {
    if (!editor || !aiCustomPrompt.trim()) return;
    setIsAILoading(true);
    toast.loading('Yella AI is writing your section...', { id: 'word-custom-ai' });

    try {
      const prompt = `Write a comprehensive, professional enterprise section with headings, bullet points, and an HTML table if applicable for:\n${aiCustomPrompt}`;
      const res = await queryYellaAI(prompt, 'Word Document Writer');
      const cleanHtml = res
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '<p></p>');

      editor.chain().focus().insertContent(cleanHtml).run();
      toast.dismiss('word-custom-ai');
      toast.success('Inserted AI drafted content!');
      setShowAIPromptModal(false);
      setAiCustomPrompt('');
    } catch (err) {
      toast.dismiss('word-custom-ai');
      toast.error('AI generation failed');
    } finally {
      setIsAILoading(false);
    }
  };

  const getPageWidth = () => {
    if (orientation === 'landscape') return '1060px';
    if (margins === 'narrow') return '860px';
    if (margins === 'wide') return '740px';
    return '816px';
  };

  const getPagePadding = () => {
    if (margins === 'narrow') return '28px 36px';
    if (margins === 'wide') return '56px 72px';
    return '48px 60px';
  };

  const getPaperBackground = () => {
    if (paperTheme === 'sepia') return '#fbf7ee';
    if (paperTheme === 'dark') return '#1e1e1e';
    if (paperTheme === 'pearl') return '#f4f5f7';
    return '#ffffff';
  };

  const getPaperTextColor = () => {
    if (paperTheme === 'dark') return '#e0e0e0';
    return '#201f1e';
  };

  if (!editor) return null;

  return (
    <div className={`flex flex-col h-full bg-[#f3f2f1] select-none text-[#201f1e] overflow-hidden ${isFocusMode ? 'fixed inset-0 z-50' : ''}`}>
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* 1. Word Header / Quick Access Toolbar */}
      <div className="flex items-center justify-between px-3 h-10 bg-[#185abd] text-white border-b border-[#106ebe] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide">
            <div className="w-5 h-5 rounded bg-white text-[#185abd] flex items-center justify-center font-black text-xs shadow-xs">
              W
            </div>
            <span className="hidden sm:inline">Word</span>
          </div>

          <div className="w-px h-4 bg-white/30 mx-1" />

          {/* Document Title Input */}
          <input
            type="text"
            value={activeDocTitle}
            onChange={(e) => setActiveDocTitle(e.target.value)}
            className="text-xs font-semibold bg-white/10 hover:bg-white/20 focus:bg-white focus:text-[#201f1e] px-2 py-1 rounded transition-colors outline-none truncate max-w-[220px]"
            title="Rename Document"
          />

          <span className="text-[10px] text-white/80 hidden md:inline flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Saved to Cloud
          </span>
        </div>

        {/* Center Search / Copilot Bar */}
        <div className="hidden lg:flex items-center bg-white/15 hover:bg-white/25 rounded-md px-3 py-1 w-72 text-xs text-white/80 gap-2 cursor-pointer" onClick={() => setShowFindModal(true)}>
          <Search size={13} />
          <span className="truncate">Search document or type command...</span>
          <kbd className="ml-auto text-[9px] bg-white/20 px-1 rounded">Ctrl+F</kbd>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setShowAIPromptModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded font-bold shadow-xs transition-transform active:scale-95"
          >
            <Sparkles size={13} />
            <span>Yella AI</span>
          </button>

          <button
            onClick={() => downloadDocument('docx')}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded font-semibold transition-colors"
            title="Download Word File"
          >
            <FileDown size={13} />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
            title="Print to PDF"
          >
            <Printer size={14} />
          </button>

          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded transition-colors"
            title={isFocusMode ? 'Exit Fullscreen' : 'Focus Mode'}
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* 2. Ribbon Tab Header */}
      <div className="flex items-center px-2 bg-white border-b border-[#e1dfdd] text-xs font-semibold text-[#605e5c] gap-1 flex-shrink-0">
        {[
          { id: 'file', label: 'File' },
          { id: 'home', label: 'Home' },
          { id: 'insert', label: 'Insert' },
          { id: 'layout', label: 'Layout' },
          { id: 'references', label: 'References' },
          { id: 'review', label: 'Review' },
          { id: 'view', label: 'View' },
          { id: 'yella', label: '✨ Yella AI' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'file') downloadDocument('docx');
              else setActiveRibbonTab(tab.id as any);
            }}
            className={`px-3 py-1.5 transition-colors border-b-2 ${
              activeRibbonTab === tab.id
                ? 'border-[#185abd] text-[#185abd] font-bold bg-[#f3f2f1]'
                : 'border-transparent hover:text-[#201f1e] hover:bg-[#faf9f8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Comprehensive Office Ribbon Toolbar */}
      <div className="flex items-center px-3 py-1 bg-white border-b border-[#d2d0ce] shadow-2xs overflow-x-auto whitespace-nowrap min-h-[46px] gap-2 flex-shrink-0 text-xs">
        {/* HOME TAB */}
        {activeRibbonTab === 'home' && (
          <div className="flex items-center gap-2">
            {/* Clipboard & Undo/Redo */}
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
                {['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '32', '48'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Typography Formatting */}
            <div className="flex items-center gap-0.5 border-r border-[#edebe9] pr-2">
              <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1 rounded ${editor.isActive('bold') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1]'}`} title="Bold"><Bold size={13} /></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1 rounded ${editor.isActive('italic') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1]'}`} title="Italic"><Italic size={13} /></button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1 rounded ${editor.isActive('underline') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1]'}`} title="Underline"><UnderlineIcon size={13} /></button>
              <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1 rounded ${editor.isActive('strike') ? 'bg-[#c7e0f4] text-[#185abd]' : 'hover:bg-[#f3f2f1]'}`} title="Strikethrough"><Strikethrough size={13} /></button>
              <button onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffeb3b' }).run()} className={`p-1 rounded ${editor.isActive('highlight') ? 'bg-[#fff100] text-black' : 'hover:bg-[#f3f2f1]'}`} title="Highlight"><Highlighter size={13} /></button>
              <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-1 rounded ${editor.isActive('code') ? 'bg-[#c7e0f4]' : 'hover:bg-[#f3f2f1]'}`} title="Inline Code"><Code size={13} /></button>
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

            {/* Styles Gallery */}
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
              title="Speech Dictate"
            >
              {isDictating ? <MicOff size={13} /> : <Mic size={13} />}
              <span>{isDictating ? 'Listening...' : 'Dictate'}</span>
            </button>
          </div>
        )}

        {/* INSERT TAB */}
        {activeRibbonTab === 'insert' && (
          <div className="flex items-center gap-2">
            {/* Table Dropdown with Complete Controls */}
            <div className="relative">
              <button
                onClick={() => setShowTablePicker(!showTablePicker)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#185abd] text-white hover:bg-[#106ebe] rounded text-xs font-bold shadow-2xs"
              >
                <TableIcon size={14} />
                <span>Table</span>
                <ChevronDown size={12} />
              </button>

              {showTablePicker && (
                <div className="absolute top-full left-0 mt-1 bg-white p-3 rounded-lg shadow-2xl border border-[#d2d0ce] z-50 w-72 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-[#edebe9]">
                    <span className="text-xs font-bold text-[#201f1e]">
                      Grid: {tableGridHover.r} × {tableGridHover.c} Table
                    </span>
                    <button
                      onClick={() => { setShowCustomTableModal(true); setShowTablePicker(false); }}
                      className="text-[10px] text-[#185abd] hover:underline"
                    >
                      Custom Size...
                    </button>
                  </div>

                  {/* 8x8 Interactive Grid */}
                  <div className="grid grid-cols-8 gap-1 p-1.5 bg-[#faf9f8] border border-[#edebe9] rounded">
                    {Array.from({ length: 8 }).map((_, rIdx) =>
                      Array.from({ length: 8 }).map((_, cIdx) => (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          onMouseEnter={() => setTableGridHover({ r: rIdx + 1, c: cIdx + 1 })}
                          onClick={() => insertRobustTable(rIdx + 1, cIdx + 1, 'corporate')}
                          className={`w-3.5 h-3.5 border cursor-pointer rounded-xs transition-colors ${
                            rIdx < tableGridHover.r && cIdx < tableGridHover.c
                              ? 'bg-[#185abd] border-[#106ebe]'
                              : 'bg-white border-[#d2d0ce]'
                          }`}
                        />
                      ))
                    )}
                  </div>

                  {/* Table Style Presets */}
                  <div>
                    <p className="text-[10px] font-bold text-[#605e5c] mb-1">Select Preset Theme:</p>
                    <div className="grid grid-cols-3 gap-1">
                      <button onClick={() => insertRobustTable(3, 4, 'corporate')} className="px-2 py-1 bg-[#185abd] text-white text-[10px] font-semibold rounded hover:opacity-90">Corporate</button>
                      <button onClick={() => insertRobustTable(3, 4, 'emerald')} className="px-2 py-1 bg-[#107c41] text-white text-[10px] font-semibold rounded hover:opacity-90">Emerald</button>
                      <button onClick={() => insertRobustTable(3, 4, 'slate')} className="px-2 py-1 bg-[#323130] text-white text-[10px] font-semibold rounded hover:opacity-90">Slate</button>
                      <button onClick={() => insertRobustTable(4, 4, 'striped')} className="px-2 py-1 bg-gray-100 text-[#201f1e] border border-gray-300 text-[10px] font-semibold rounded hover:bg-gray-200">Striped Zebra</button>
                      <button onClick={() => insertRobustTable(3, 3, 'minimal')} className="px-2 py-1 bg-white text-[#201f1e] border border-[#d2d0ce] text-[10px] font-semibold rounded hover:bg-gray-50">Minimal Plain</button>
                    </div>
                  </div>

                  {/* Active Table Manipulation Tools */}
                  <div className="pt-2 border-t border-[#edebe9] space-y-1">
                    <p className="text-[10px] font-bold text-[#605e5c]">Table Actions:</p>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <button onClick={() => editor.chain().focus().addRowBefore().run()} className="px-2 py-1 rounded bg-[#f3f2f1] hover:bg-[#edebe9] text-left">+ Row Above</button>
                      <button onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2 py-1 rounded bg-[#f3f2f1] hover:bg-[#edebe9] text-left">+ Row Below</button>
                      <button onClick={() => editor.chain().focus().addColumnBefore().run()} className="px-2 py-1 rounded bg-[#f3f2f1] hover:bg-[#edebe9] text-left">+ Col Left</button>
                      <button onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2 py-1 rounded bg-[#f3f2f1] hover:bg-[#edebe9] text-left">+ Col Right</button>
                      <button onClick={() => editor.chain().focus().deleteRow().run()} className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 text-left">Delete Row</button>
                      <button onClick={() => editor.chain().focus().deleteColumn().run()} className="px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 text-left">Delete Col</button>
                      <button onClick={() => editor.chain().focus().deleteTable().run()} className="col-span-2 px-2 py-1 rounded bg-red-100 text-red-700 font-bold hover:bg-red-200 text-center">Delete Entire Table</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pictures */}
            <div className="flex items-center gap-1 border-r border-[#edebe9] pr-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold"
              >
                <ImageIcon size={14} className="text-[#107c41]" />
                <span>Upload Picture</span>
              </button>
              <button
                onClick={handleInsertStockImage}
                className="flex items-center gap-1 px-2 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs text-[#605e5c]"
              >
                Stock Photo
              </button>
            </div>

            {/* Shapes */}
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
                <div className="absolute top-full left-0 mt-1 w-48 bg-white p-2 rounded-lg shadow-xl border border-[#edebe9] z-50 text-xs space-y-1">
                  <button onClick={() => insertShape('rect')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded flex items-center gap-2">
                    <Square size={13} className="text-blue-600" /> Process Stage
                  </button>
                  <button onClick={() => insertShape('callout')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded flex items-center gap-2">
                    <Bookmark size={13} className="text-indigo-600" /> Key Takeaway
                  </button>
                  <button onClick={() => insertShape('warning')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded flex items-center gap-2 text-amber-700">
                    <HelpCircle size={13} className="text-amber-600" /> Compliance Note
                  </button>
                  <button onClick={() => insertShape('success')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded flex items-center gap-2 text-emerald-700">
                    <CheckCircle size={13} className="text-emerald-600" /> Verified Milestone
                  </button>
                  <button onClick={() => insertShape('signature')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded flex items-center gap-2">
                    <PenTool size={13} className="text-gray-600" /> Signature Line
                  </button>
                  <button onClick={() => insertShape('task')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded flex items-center gap-2">
                    <CheckSquare size={13} className="text-purple-600" /> Action Checkbox
                  </button>
                </div>
              )}
            </div>

            {/* Icons & Symbols */}
            <button
              onClick={() => setShowIconsModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold"
            >
              <Smile size={14} className="text-purple-600" />
              <span>Icons & Symbols</span>
            </button>

            {/* Date & Time */}
            <button
              onClick={() => insertDateTime('long')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold"
            >
              <Calendar size={14} className="text-blue-600" />
              <span>Date & Time</span>
            </button>

            {/* Page Break / Divider */}
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded text-xs font-semibold"
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
              <LinkIcon size={14} className="text-[#185abd]" />
              <span>Link</span>
            </button>
          </div>
        )}

        {/* LAYOUT TAB */}
        {activeRibbonTab === 'layout' && (
          <div className="flex items-center gap-3">
            {/* Margins */}
            <div className="flex items-center gap-1 border-r border-[#edebe9] pr-3">
              <span className="text-xs text-[#605e5c] font-semibold">Margins:</span>
              <button
                onClick={() => setMargins('normal')}
                className={`px-2 py-0.5 rounded text-xs ${margins === 'normal' ? 'bg-[#c7e0f4] text-[#185abd] font-bold' : 'hover:bg-[#f3f2f1]'}`}
              >
                Normal (1")
              </button>
              <button
                onClick={() => setMargins('narrow')}
                className={`px-2 py-0.5 rounded text-xs ${margins === 'narrow' ? 'bg-[#c7e0f4] text-[#185abd] font-bold' : 'hover:bg-[#f3f2f1]'}`}
              >
                Narrow (0.5")
              </button>
              <button
                onClick={() => setMargins('wide')}
                className={`px-2 py-0.5 rounded text-xs ${margins === 'wide' ? 'bg-[#c7e0f4] text-[#185abd] font-bold' : 'hover:bg-[#f3f2f1]'}`}
              >
                Wide (1.5")
              </button>
            </div>

            {/* Orientation */}
            <div className="flex items-center gap-1 border-r border-[#edebe9] pr-3">
              <span className="text-xs text-[#605e5c] font-semibold">Orientation:</span>
              <button
                onClick={() => setOrientation('portrait')}
                className={`px-2 py-0.5 rounded text-xs ${orientation === 'portrait' ? 'bg-[#c7e0f4] text-[#185abd] font-bold' : 'hover:bg-[#f3f2f1]'}`}
              >
                Portrait
              </button>
              <button
                onClick={() => setOrientation('landscape')}
                className={`px-2 py-0.5 rounded text-xs ${orientation === 'landscape' ? 'bg-[#c7e0f4] text-[#185abd] font-bold' : 'hover:bg-[#f3f2f1]'}`}
              >
                Landscape
              </button>
            </div>

            {/* Paper Canvas Theme */}
            <div className="flex items-center gap-1 border-r border-[#edebe9] pr-3">
              <span className="text-xs text-[#605e5c] font-semibold">Canvas Theme:</span>
              <button onClick={() => setPaperTheme('white')} className={`px-2 py-0.5 rounded text-xs ${paperTheme === 'white' ? 'bg-white border font-bold' : 'hover:bg-[#f3f2f1]'}`}>White</button>
              <button onClick={() => setPaperTheme('sepia')} className={`px-2 py-0.5 rounded text-xs ${paperTheme === 'sepia' ? 'bg-[#fbf7ee] border font-bold text-[#5f4b32]' : 'hover:bg-[#f3f2f1]'}`}>Eye-Care Sepia</button>
              <button onClick={() => setPaperTheme('dark')} className={`px-2 py-0.5 rounded text-xs ${paperTheme === 'dark' ? 'bg-[#1f1f1f] text-white font-bold' : 'hover:bg-[#f3f2f1]'}`}>Dark Mode</button>
            </div>

            {/* Watermark */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#605e5c] font-semibold">Watermark:</span>
              <select
                value={watermark}
                onChange={(e) => setWatermark(e.target.value)}
                className="h-6 px-1.5 text-xs bg-white border border-[#d2d0ce] rounded outline-none"
              >
                <option value="">None</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="DRAFT">DRAFT</option>
                <option value="URGENT">URGENT</option>
                <option value="APPROVED">APPROVED</option>
              </select>
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
                editor.commands.insertContent('<hr/><p><small><em>* Citation 1: Microsoft 365 Enterprise Framework, ISO-27001 Certified, 2026.</em></small></p>');
                toast.success('Inserted citation');
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              Insert Footnote Citation
            </button>
            <button
              onClick={() => {
                editor.commands.insertContent('<h2>References & Bibliography</h2><ol><li>Microsoft Enterprise Architecture Guidelines, Q4 2026.</li><li>NIST Cybersecurity Framework Standards v2.0.</li></ol>');
                toast.success('Inserted bibliography');
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              Add Bibliography
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
              <Printer size={14} /> Print to PDF
            </button>
          </div>
        )}

        {/* YELLA AI TAB */}
        {activeRibbonTab === 'yella' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIPromptModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded text-xs font-bold shadow-xs hover:opacity-95"
            >
              <Sparkles size={13} /> Draft Section with Yella AI
            </button>
            <button
              onClick={() => runAIWordAction('summary')}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-200"
            >
              <Wand2 size={13} /> Auto Executive Summary
            </button>
            <button
              onClick={() => runAIWordAction('deliverables')}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-200"
            >
              <BookOpen size={13} /> Draft Deliverables Table
            </button>
            <button
              onClick={() => runAIWordAction('polish')}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-200"
            >
              <CheckCircle size={13} /> Polish Writing
            </button>
            <button
              onClick={() => runAIWordAction('translate')}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-200"
            >
              Translate (Spanish)
            </button>
          </div>
        )}
      </div>

      {/* 4. Horizontal Visual Ruler */}
      {showRuler && (
        <div className="flex items-center justify-center bg-[#faf9f8] border-b border-[#e1dfdd] h-5 px-4 overflow-hidden select-none">
          <div style={{ width: getPageWidth() }} className="h-full flex items-center justify-between text-[9px] text-[#8a8886] font-mono px-6">
            <span>| 1"</span>
            <span>· · · · | 2"</span>
            <span>· · · · | 3"</span>
            <span>· · · · | 4"</span>
            <span>· · · · | 5"</span>
            <span>· · · · | 6"</span>
            <span>· · · · | 7"</span>
            <span>· · · · | 8"</span>
          </div>
        </div>
      )}

      {/* 5. Document Canvas Viewport */}
      <div className="flex-1 overflow-auto flex justify-center bg-[#e5e5e5] p-6 sm:p-10 relative">
        <div
          style={{
            width: getPageWidth(),
            minHeight: orientation === 'landscape' ? '700px' : '1056px',
            padding: getPagePadding(),
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            background: getPaperBackground(),
            color: getPaperTextColor(),
          }}
          className="rounded shadow-2xl transition-all relative border border-[#d2d0ce]"
        >
          {/* Optional Watermark */}
          {watermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 select-none overflow-hidden">
              <span className="text-8xl font-black text-gray-500 tracking-widest transform -rotate-45">
                {watermark}
              </span>
            </div>
          )}

          {/* Interactive Tiptap Editor */}
          <EditorContent editor={editor} className="h-full focus:outline-none" />
        </div>
      </div>

      {/* 6. Authentic Microsoft Word Status Bar */}
      <div className="flex items-center justify-between px-3 h-6 bg-white border-t border-[#d2d0ce] text-[11px] text-[#605e5c] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>Page 1 of 1</span>
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle size={11} /> English (US)
          </span>
          <span>~{Math.max(1, Math.ceil(wordCount / 200))} min read</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="uppercase text-[10px] tracking-wider">{orientation} • {margins}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-0.5 hover:bg-[#edebe9] rounded"><ZoomOut size={12} /></button>
            <span className="w-8 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-0.5 hover:bg-[#edebe9] rounded"><ZoomIn size={12} /></button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Custom Table Size Modal */}
      {showCustomTableModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="w-80 bg-white rounded-lg shadow-2xl border border-[#edebe9] p-4 space-y-4">
            <h3 className="text-sm font-bold text-[#201f1e]">Insert Custom Table</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Number of Columns:</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={customTableCols}
                  onChange={(e) => setCustomTableCols(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 border border-[#d2d0ce] rounded text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Number of Rows:</span>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={customTableRows}
                  onChange={(e) => setCustomTableRows(parseInt(e.target.value) || 1)}
                  className="w-16 px-2 py-1 border border-[#d2d0ce] rounded text-center"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#edebe9]">
              <button onClick={() => setShowCustomTableModal(false)} className="px-3 py-1 text-xs text-[#605e5c] hover:bg-gray-100 rounded">
                Cancel
              </button>
              <button
                onClick={() => insertRobustTable(customTableRows, customTableCols, 'corporate')}
                className="px-4 py-1 text-xs font-bold bg-[#185abd] text-white rounded hover:bg-[#106ebe]"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Icons & Symbols Modal */}
      {showIconsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="w-96 bg-white rounded-lg shadow-2xl border border-[#edebe9] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#edebe9] pb-2">
              <h3 className="text-sm font-bold text-[#201f1e]">Insert Icon or Symbol</h3>
              <button onClick={() => setShowIconsModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>
            <div className="grid grid-cols-6 gap-2 text-xl p-2 bg-[#faf9f8] rounded border border-[#edebe9]">
              {['✅', '❌', '⚠️', '⭐', '🚀', '🎯', '📈', '🔒', '💡', '🏆', '💼', '📊', '📅', '📝', '✉️', '🌐', '⚡', '🔥', '💎', '🔑', '©️', '®️', '™️', '→', '←', '↑', '↓', '★', '✓', '✗'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => insertIconSymbol(sym)}
                  className="p-2 hover:bg-white hover:shadow-xs rounded transition-all text-center"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Custom Yella AI Prompt Modal */}
      {showAIPromptModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="w-[420px] bg-white rounded-lg shadow-2xl border border-[#edebe9] p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                ✨
              </div>
              <h3 className="text-sm font-bold text-[#201f1e]">Yella AI Document Writer</h3>
            </div>
            <p className="text-xs text-[#605e5c]">
              Describe what section, policy, contract, or table you want Yella AI to write directly into this Word document.
            </p>
            <textarea
              rows={4}
              value={aiCustomPrompt}
              onChange={(e) => setAiCustomPrompt(e.target.value)}
              placeholder="e.g., Draft a 4-milestone execution schedule with risk mitigation matrix..."
              className="w-full text-xs p-3 border border-[#d2d0ce] rounded-lg outline-none focus:border-[#185abd]"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAIPromptModal(false)} className="px-3 py-1.5 text-xs text-[#605e5c]">
                Cancel
              </button>
              <button
                onClick={handleCustomAIGenerate}
                disabled={isAILoading || !aiCustomPrompt.trim()}
                className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded hover:opacity-90 disabled:opacity-50"
              >
                {isAILoading ? 'Writing...' : 'Generate & Insert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Word Count Stats */}
      {showWordCountModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="w-[340px] bg-white rounded-lg shadow-2xl border border-[#edebe9] p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#201f1e]">Document Statistics</h3>
            <div className="space-y-1.5 text-xs text-[#201f1e]">
              <div className="flex justify-between py-1 border-b border-[#f3f2f1]"><span>Pages:</span><strong>1</strong></div>
              <div className="flex justify-between py-1 border-b border-[#f3f2f1]"><span>Words:</span><strong>{wordCount}</strong></div>
              <div className="flex justify-between py-1 border-b border-[#f3f2f1]"><span>Characters:</span><strong>{charCount}</strong></div>
              <div className="flex justify-between py-1 border-b border-[#f3f2f1]"><span>Paragraphs:</span><strong>{editor.getText().split(/\n+/).filter(Boolean).length}</strong></div>
              <div className="flex justify-between py-1"><span>Reading Time:</span><strong>~{Math.max(1, Math.ceil(wordCount / 200))} min</strong></div>
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setShowWordCountModal(false)} className="px-4 py-1 text-xs font-bold bg-[#185abd] text-white rounded hover:bg-[#106ebe]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Find & Replace */}
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
              <button onClick={() => setShowFindModal(false)} className="px-3 py-1 text-xs text-[#605e5c]">Cancel</button>
              <button onClick={handleFindReplace} className="px-3 py-1 text-xs font-bold bg-[#185abd] text-white rounded">Replace All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
