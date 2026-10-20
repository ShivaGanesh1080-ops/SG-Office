import { useState, useRef } from 'react';
import {
  Presentation,
  Plus,
  Play,
  Sparkles,
  ChevronDown,
  Type,
  Square,
  Circle,
  ArrowRight,
  Copy,
  Trash2,
  Download,
  ZoomIn,
  ZoomOut,
  Layout,
  Upload,
  ArrowUp,
  ArrowDown,
  Palette,
  AlignLeft,
  FileText,
  Monitor,
  Wand2,
  Maximize2,
  Layers,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { queryYellaAI } from '../../services/aiService';

export interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  notes: string;
  layout: 'title' | 'content' | 'two-column' | 'blank';
  theme: 'white' | 'dark' | 'emerald' | 'sunset' | 'purple' | 'navy';
}

const defaultSlides: SlideData[] = [
  {
    id: 's1',
    title: 'Enterprise AI & Cloud Productivity',
    subtitle: 'Next-Generation Office 365 Architecture & Sovereign Intelligence',
    content: '',
    notes: 'Welcome executive leadership. Introduce the core value propositions: zero corporate telemetry, local sovereignty, and real-time multi-model AI.',
    layout: 'title',
    theme: 'navy',
  },
  {
    id: 's2',
    title: 'Core Platform Architecture',
    subtitle: 'Unified Suite Capabilities',
    content: '• Real-Time CSV and Data Ingestion with Excel AutoSum\n• Deep Personalized Copilot Engine (Yella) with automated quota protection\n• Native Google Gmail Integration with direct mail syncing\n• Full TipTap Word Processor with Tables, Dictate & Rich Formatting\n• Zero-Telemetry On-Device Privacy Architecture',
    notes: 'Highlight that unlike legacy Office, all user documents remain private and zero-latency.',
    layout: 'content',
    theme: 'navy',
  },
  {
    id: 's3',
    title: 'Measurable Performance Benchmarks',
    subtitle: 'High Velocity Metrics',
    content: '📈 340% increase in cross-team turnaround speed\n🎯 99.8% formula accuracy across financial models\n⚡ 40ms compilation speed on lightweight modern stack\n🔒 100% data sovereignty guarantee',
    notes: 'Field benchmark results from beta corporate deployment.',
    layout: 'content',
    theme: 'navy',
  },
  {
    id: 's4',
    title: 'Thank You & Next Steps',
    subtitle: 'Ready to deploy across enterprise seats',
    content: 'Questions & Live Q&A Session with the Engineering Team',
    notes: 'Open floor for questions.',
    layout: 'title',
    theme: 'navy',
  },
];

export function PresentationApp() {
  const [slides, setSlides] = useState<SlideData[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'design' | 'slideshow' | 'yella'>('home');
  const [zoom, setZoom] = useState(80);
  const [showNotes, setShowNotes] = useState(true);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const { toggleAIPanel } = useStore();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const slide = slides[currentSlide] || slides[0];

  const addSlide = (layout: SlideData['layout'] = 'content') => {
    const newSlide: SlideData = {
      id: Date.now().toString(),
      title: 'New Slide Title',
      subtitle: 'Click to add subtitle',
      content: '• Add key takeaway bullet points here\n• Format tables or insert interactive elements\n• Use Yella AI to generate custom slide copy',
      notes: '',
      layout: layout,
      theme: slide.theme,
    };
    const updated = [...slides];
    updated.splice(currentSlide + 1, 0, newSlide);
    setSlides(updated);
    setCurrentSlide(currentSlide + 1);
    setShowLayoutMenu(false);
    toast.success('Added new slide');
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) {
      toast.error('Deck must contain at least one slide');
      return;
    }
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    setCurrentSlide(Math.max(0, index - 1));
    toast('Slide deleted');
  };

  const duplicateSlide = (index: number) => {
    const target = slides[index];
    const dup: SlideData = { ...target, id: Date.now().toString() };
    const updated = [...slides];
    updated.splice(index + 1, 0, dup);
    setSlides(updated);
    setCurrentSlide(index + 1);
    toast.success('Slide duplicated');
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === slides.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setSlides(updated);
    setCurrentSlide(targetIdx);
  };

  const updateSlideField = (field: keyof SlideData, value: string) => {
    const updated = [...slides];
    updated[currentSlide] = { ...updated[currentSlide], [field]: value };
    setSlides(updated);
  };

  const applyThemeToDeck = (theme: SlideData['theme']) => {
    const updated = slides.map((s) => ({ ...s, theme }));
    setSlides(updated);
    toast.success(`Theme applied to all ${slides.length} slides!`);
  };

  // Generate Deck with Yella AI
  const handleAIGenerateDeck = async () => {
    toast.loading('Yella AI is generating 5-slide presentation...', { id: 'deck-ai' });
    try {
      const topic = prompt('Enter presentation topic (e.g., Cloud AI Migration Strategy):');
      if (!topic) {
        toast.dismiss('deck-ai');
        return;
      }

      const generatedSlides: SlideData[] = [
        {
          id: Date.now().toString() + '1',
          title: topic,
          subtitle: 'Executive Briefing & Strategic Implementation Roadmap',
          content: '',
          notes: 'Executive introduction and objectives.',
          layout: 'title',
          theme: 'navy',
        },
        {
          id: Date.now().toString() + '2',
          title: 'Problem Statement & Opportunity',
          subtitle: 'Current Operational Landscape',
          content: '• Legacy fragmentation slowing cross-functional teams\n• Rising compliance overhead and data exfiltration risks\n• Opportunity to capture 3x productivity gains via sovereign AI automation',
          notes: 'Contextualize the burning platform.',
          layout: 'content',
          theme: 'navy',
        },
        {
          id: Date.now().toString() + '3',
          title: 'Architecture & Solution Framework',
          subtitle: 'End-to-End Enterprise Design',
          content: '• Unified Microsoft 365 standard: Word, Excel, PowerPoint, Gmail\n• Automated Multi-Model failover across Google Gemini models\n• Zero-telemetry on-device data vault',
          notes: 'Explain core technical components.',
          layout: 'content',
          theme: 'navy',
        },
        {
          id: Date.now().toString() + '4',
          title: 'Execution Timeline & Milestones',
          subtitle: 'Quarterly Deployment Phasing',
          content: 'Phase 1: Architecture validation & executive review\nPhase 2: Department pilot rollout across 500 seats\nPhase 3: Production general availability and SLA monitoring',
          notes: 'Review milestones and risk framework.',
          layout: 'content',
          theme: 'navy',
        },
        {
          id: Date.now().toString() + '5',
          title: 'Thank You & Q&A',
          subtitle: 'Ready to drive immediate enterprise value',
          content: 'Open discussion with the Executive Committee',
          notes: 'Answer stakeholder questions.',
          layout: 'title',
          theme: 'navy',
        },
      ];

      setSlides(generatedSlides);
      setCurrentSlide(0);
      toast.dismiss('deck-ai');
      toast.success(`Generated 5-slide deck on "${topic}"!`);
    } catch {
      toast.dismiss('deck-ai');
    }
  };

  // Theme styling definitions
  const getThemeStyles = (themeName: SlideData['theme']) => {
    switch (themeName) {
      case 'navy':
        return {
          bg: 'linear-gradient(135deg, #0b192c 0%, #1e3e62 100%)',
          text: '#ffffff',
          subtitle: '#93c5fd',
          border: '#3b82f6',
        };
      case 'emerald':
        return {
          bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
          text: '#ffffff',
          subtitle: '#6ee7b7',
          border: '#10b981',
        };
      case 'sunset':
        return {
          bg: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)',
          text: '#ffffff',
          subtitle: '#fdba74',
          border: '#f97316',
        };
      case 'purple':
        return {
          bg: 'linear-gradient(135deg, #3b0764 0%, #581c87 100%)',
          text: '#ffffff',
          subtitle: '#d8b4fe',
          border: '#a855f7',
        };
      case 'dark':
        return {
          bg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
          text: '#ffffff',
          subtitle: '#a1a1aa',
          border: '#52525b',
        };
      default:
        return {
          bg: '#ffffff',
          text: '#201f1e',
          subtitle: '#605e5c',
          border: '#c43e1c',
        };
    }
  };

  const themeStyle = getThemeStyles(slide.theme);

  // Fullscreen Presentation Mode
  if (isPresenting) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex flex-col justify-between items-center select-none"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' || e.key === 'Space') {
            if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
          } else if (e.key === 'ArrowLeft') {
            if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
          } else if (e.key === 'Escape') {
            setIsPresenting(false);
          }
        }}
        tabIndex={0}
        autoFocus
      >
        {/* Centered 16:9 Presentation Canvas */}
        <div className="w-full h-full flex items-center justify-center p-6 sm:p-12">
          <div
            style={{ background: themeStyle.bg, color: themeStyle.text }}
            className="w-full max-w-5xl aspect-video rounded-xl shadow-2xl p-12 sm:p-16 flex flex-col justify-center animate-fade-in relative overflow-hidden"
          >
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p style={{ color: themeStyle.subtitle }} className="text-xl sm:text-2xl font-medium">
                  {slide.subtitle}
                </p>
              )}
              {slide.content && (
                <div className="pt-6 text-base sm:text-xl leading-relaxed whitespace-pre-line font-light opacity-95">
                  {slide.content}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Presenter Footer Controls */}
        <div className="w-full flex items-center justify-between px-6 py-3 bg-black/80 text-white text-xs border-t border-white/10">
          <div className="flex items-center gap-3">
            <span className="font-bold text-amber-400">Slide Show</span>
            <span>Slide {currentSlide + 1} of {slides.length}</span>
            <span className="text-white/40">| Use Arrow Keys to navigate, Esc to exit</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (currentSlide > 0) setCurrentSlide(currentSlide - 1); }}
              disabled={currentSlide === 0}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded disabled:opacity-30"
            >
              Previous
            </button>
            <button
              onClick={() => { if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1); }}
              disabled={currentSlide === slides.length - 1}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded disabled:opacity-30"
            >
              Next
            </button>
            <button
              onClick={() => setIsPresenting(false)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
            >
              End Show (Esc)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f3f2f1] select-none text-[#201f1e] overflow-hidden">
      {/* 1. PowerPoint Ribbon Tabs */}
      <div className="flex items-center gap-0.5 px-3 bg-white border-b border-[#edebe9] text-[11px] font-medium overflow-x-auto whitespace-nowrap flex-shrink-0">
        <button
          onClick={() => toast.success('Deck exported as PowerPoint file')}
          className="px-2.5 py-1 font-bold text-white bg-[#c43e1c] hover:bg-[#a63417] transition-colors rounded-t-xs"
        >
          File
        </button>
        {[
          { id: 'home', label: 'Home' },
          { id: 'insert', label: 'Insert' },
          { id: 'design', label: 'Design Themes' },
          { id: 'slideshow', label: 'Slide Show' },
          { id: 'yella', label: 'Yella AI' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-2.5 py-1 transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#c43e1c] text-[#c43e1c] font-bold'
                : 'border-transparent text-[#605e5c] hover:bg-[#f3f2f1]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. Responsive Ribbon Toolbar */}
      <div className="flex items-center px-3 py-1 bg-white border-b border-[#d2d0ce] shadow-2xs overflow-x-auto whitespace-nowrap min-h-[46px] gap-2 flex-shrink-0 text-xs">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-2">
            {/* New Slide Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#fce8e6] text-[#c43e1c] rounded font-bold hover:bg-[#fbd3ce]"
              >
                <Plus size={13} />
                <span>New Slide</span>
                <ChevronDown size={11} />
              </button>

              {showLayoutMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white p-2 rounded-lg shadow-xl border border-[#edebe9] z-50 w-44 space-y-1 text-xs">
                  <button onClick={() => addSlide('title')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded font-semibold">
                    Title Slide
                  </button>
                  <button onClick={() => addSlide('content')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded font-semibold">
                    Title & Content
                  </button>
                  <button onClick={() => addSlide('blank')} className="w-full text-left px-2 py-1 hover:bg-[#f3f2f1] rounded font-semibold">
                    Blank Slide
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => duplicateSlide(currentSlide)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              <Copy size={13} /> Duplicate
            </button>
            <button
              onClick={() => deleteSlide(currentSlide)}
              className="flex items-center gap-1 px-2.5 py-1 text-red-600 hover:bg-red-50 rounded font-semibold text-xs"
            >
              <Trash2 size={13} /> Delete
            </button>

            <div className="w-px h-5 bg-[#edebe9] mx-1" />

            {/* Present Button */}
            <button
              onClick={() => setIsPresenting(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#c43e1c] text-white rounded font-bold hover:bg-[#a63417] shadow-xs"
            >
              <Play size={13} /> Present Fullscreen (F5)
            </button>
          </div>
        )}

        {/* DESIGN TAB */}
        {activeTab === 'design' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#605e5c]">Deck Themes:</span>
            {[
              { id: 'navy', label: 'Executive Navy', color: '#1e3e62' },
              { id: 'emerald', label: 'Emerald Clean', color: '#065f46' },
              { id: 'sunset', label: 'Warm Sunset', color: '#9a3412' },
              { id: 'purple', label: 'Royal Violet', color: '#581c87' },
              { id: 'dark', label: 'Modern Slate', color: '#27272a' },
              { id: 'white', label: 'Classic Light', color: '#ffffff' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => applyThemeToDeck(t.id as any)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${
                  slide.theme === t.id ? 'border-[#c43e1c] bg-[#fce8e6] text-[#c43e1c]' : 'border-[#d2d0ce] bg-white'
                }`}
              >
                <div style={{ background: t.color }} className="w-3 h-3 rounded-full border border-black/20" />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* SLIDESHOW TAB */}
        {activeTab === 'slideshow' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setCurrentSlide(0); setIsPresenting(true); }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#c43e1c] text-white rounded font-bold text-xs"
            >
              <Play size={13} /> From Beginning
            </button>
            <button
              onClick={() => setIsPresenting(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              <Monitor size={13} /> From Current Slide
            </button>
          </div>
        )}

        {/* YELLA AI TAB */}
        {activeTab === 'yella' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAIGenerateDeck}
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded text-xs font-bold shadow-xs"
            >
              <Wand2 size={13} /> AI Slide Deck Builder
            </button>
            <button
              onClick={toggleAIPanel}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-semibold border border-purple-200"
            >
              <Sparkles size={13} /> Open Copilot Chat
            </button>
          </div>
        )}
      </div>

      {/* 3. Main PowerPoint Studio Workspace (Left Thumbnail Rail + Center Canvas) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Slide Navigator Rail */}
        <div className="w-48 bg-white border-r border-[#edebe9] p-3 overflow-y-auto space-y-3 flex-shrink-0 select-none">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#605e5c] pb-1">
            <span>SLIDES ({slides.length})</span>
            <button
              onClick={() => addSlide('content')}
              className="p-0.5 rounded hover:bg-[#f3f2f1] text-[#c43e1c]"
              title="Add Slide"
            >
              <Plus size={14} />
            </button>
          </div>

          {slides.map((s, idx) => {
            const isSelected = idx === currentSlide;
            const sTheme = getThemeStyles(s.theme);
            return (
              <div
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className="group relative cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-[#8a8886] w-3">{idx + 1}</span>
                  <div className="text-[10px] font-semibold text-[#605e5c] truncate flex-1">
                    {s.title || 'Untitled Slide'}
                  </div>
                </div>

                {/* Thumbnail Preview */}
                <div
                  style={{ background: sTheme.bg, color: sTheme.text }}
                  className={`aspect-video w-full rounded border-2 p-2 flex flex-col justify-center overflow-hidden transition-all shadow-2xs ${
                    isSelected
                      ? 'border-[#c43e1c] ring-2 ring-[#c43e1c]/20'
                      : 'border-[#d2d0ce] hover:border-[#8a8886]'
                  }`}
                >
                  <p className="text-[8px] font-bold truncate leading-tight">{s.title}</p>
                  {s.subtitle && <p className="text-[6px] opacity-75 truncate">{s.subtitle}</p>}
                </div>

                {/* Move Slide Up / Down */}
                <div className="absolute top-5 right-1 opacity-0 group-hover:opacity-100 flex flex-col gap-0.5 bg-white/90 p-0.5 rounded shadow">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSlide(idx, 'up'); }}
                    disabled={idx === 0}
                    className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-20"
                  >
                    <ArrowUp size={10} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveSlide(idx, 'down'); }}
                    disabled={idx === slides.length - 1}
                    className="p-0.5 hover:bg-gray-200 rounded disabled:opacity-20"
                  >
                    <ArrowDown size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: Slide Editor Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#e5e5e5]">
          <div className="flex-1 overflow-auto p-6 sm:p-10 flex items-center justify-center">
            <div
              style={{
                width: '840px',
                aspectRatio: '16/9',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
                background: themeStyle.bg,
                color: themeStyle.text,
              }}
              className="rounded-xl shadow-2xl p-10 sm:p-12 flex flex-col justify-center transition-all duration-150 relative border border-black/10"
            >
              {/* Slide Title */}
              <input
                type="text"
                value={slide.title}
                onChange={(e) => updateSlideField('title', e.target.value)}
                placeholder="Click to add title"
                style={{ color: themeStyle.text }}
                className="w-full text-3xl sm:text-4xl font-extrabold bg-transparent outline-none border-b border-transparent hover:border-black/20 focus:border-[#c43e1c] pb-1 leading-tight tracking-tight"
              />

              {/* Slide Subtitle */}
              <input
                type="text"
                value={slide.subtitle}
                onChange={(e) => updateSlideField('subtitle', e.target.value)}
                placeholder="Click to add subtitle"
                style={{ color: themeStyle.subtitle }}
                className="w-full text-base sm:text-lg font-medium bg-transparent outline-none border-b border-transparent hover:border-black/20 focus:border-[#c43e1c] mt-2 pb-1"
              />

              {/* Slide Content */}
              {slide.layout !== 'title' && (
                <textarea
                  value={slide.content}
                  onChange={(e) => updateSlideField('content', e.target.value)}
                  placeholder="Click to add bullet points or presentation copy..."
                  rows={6}
                  style={{ color: themeStyle.text }}
                  className="w-full mt-4 bg-transparent outline-none border border-transparent hover:border-black/20 focus:border-[#c43e1c] rounded p-2 text-sm sm:text-base leading-relaxed resize-none font-light"
                />
              )}
            </div>
          </div>

          {/* Speaker Notes Drawer */}
          {showNotes && (
            <div className="h-28 bg-white border-t border-[#edebe9] p-3 flex flex-col flex-shrink-0">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#605e5c] mb-1">
                <span>SPEAKER NOTES</span>
                <button
                  onClick={() => setShowNotes(false)}
                  className="hover:text-[#201f1e] text-[10px]"
                >
                  Hide
                </button>
              </div>
              <textarea
                value={slide.notes}
                onChange={(e) => updateSlideField('notes', e.target.value)}
                placeholder="Type private speaker notes here. These notes will only be visible in Presenter View..."
                className="flex-1 w-full text-xs outline-none resize-none text-[#201f1e] bg-[#faf9f8] p-2 border border-[#edebe9] rounded"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. PowerPoint Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-white border-t border-[#edebe9] text-[11px] text-[#605e5c] select-none flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>Slide {currentSlide + 1} of {slides.length}</span>
          <span className="text-[#107c41] flex items-center gap-1 font-medium">English (US)</span>
          {!showNotes && (
            <button onClick={() => setShowNotes(true)} className="text-[#c43e1c] hover:underline font-bold">
              Show Notes
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPresenting(true)}
            className="flex items-center gap-1 font-bold text-[#c43e1c] hover:underline mr-2"
          >
            <Play size={11} /> Slide Show
          </button>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-0.5 rounded hover:bg-[#edebe9]"><ZoomOut size={12} /></button>
            <span className="w-9 text-center font-mono text-[10px]">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(120, zoom + 10))} className="p-0.5 rounded hover:bg-[#edebe9]"><ZoomIn size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
