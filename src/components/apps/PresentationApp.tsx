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
  TrendingUp,
  Shield,
  Activity,
  Award,
  Zap,
  Clock,
  Volume2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { queryYellaAI } from '../../services/aiService';

export interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  layout: 'hero' | 'kpi-metrics' | 'two-column' | 'roadmap' | 'quote' | 'content';
  theme: string;
  notes: string;
  metrics?: Array<{ value: string; label: string; desc: string; icon: string }>;
  columns?: { leftTitle: string; leftContent: string; rightTitle: string; rightContent: string };
  roadmapSteps?: Array<{ step: string; title: string; desc: string }>;
  quoteText?: string;
  quoteAuthor?: string;
  bulletItems?: string[];
}

export const THEMES: Record<string, {
  name: string;
  bg: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  subtitle: string;
  accent: string;
  accentBadge: string;
}> = {
  quantum: {
    name: 'Midnight Quantum',
    bg: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)',
    cardBg: 'rgba(255, 255, 255, 0.07)',
    cardBorder: 'rgba(99, 102, 241, 0.3)',
    text: '#ffffff',
    subtitle: '#a5b4fc',
    accent: '#6366f1',
    accentBadge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  emerald: {
    name: 'Emerald Tech',
    bg: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #065f46 100%)',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    cardBorder: 'rgba(52, 211, 153, 0.3)',
    text: '#ffffff',
    subtitle: '#6ee7b7',
    accent: '#10b981',
    accentBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  sunset: {
    name: 'Sunset Enterprise',
    bg: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #9a3412 100%)',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    cardBorder: 'rgba(251, 146, 60, 0.3)',
    text: '#ffffff',
    subtitle: '#fdba74',
    accent: '#f97316',
    accentBadge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  purple: {
    name: 'Royal Sovereign',
    bg: 'linear-gradient(135deg, #2e1065 0%, #3b0764 50%, #581c87 100%)',
    cardBg: 'rgba(255, 255, 255, 0.08)',
    cardBorder: 'rgba(192, 132, 252, 0.3)',
    text: '#ffffff',
    subtitle: '#d8b4fe',
    accent: '#a855f7',
    accentBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  obsidian: {
    name: 'Monolith Dark',
    bg: 'linear-gradient(135deg, #0a0a0a 0%, #171717 100%)',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.15)',
    text: '#ffffff',
    subtitle: '#a3a3a3',
    accent: '#e5e5e5',
    accentBadge: 'bg-white/10 text-white border-white/20',
  },
  fluent: {
    name: 'Microsoft Fluent',
    bg: 'linear-gradient(135deg, #004578 0%, #0078d4 100%)',
    cardBg: 'rgba(255, 255, 255, 0.15)',
    cardBorder: 'rgba(255, 255, 255, 0.3)',
    text: '#ffffff',
    subtitle: '#cfe4fa',
    accent: '#60a5fa',
    accentBadge: 'bg-blue-400/20 text-blue-200 border-blue-400/30',
  },
  nordic: {
    name: 'Nordic Clean Light',
    bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    cardBg: '#ffffff',
    cardBorder: '#cbd5e1',
    text: '#0f172a',
    subtitle: '#475569',
    accent: '#0284c7',
    accentBadge: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  warmLight: {
    name: 'Warm Executive Light',
    bg: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
    cardBg: '#ffffff',
    cardBorder: '#fde68a',
    text: '#451a03',
    subtitle: '#78350f',
    accent: '#d97706',
    accentBadge: 'bg-amber-100 text-amber-800 border-amber-300',
  },
};

const defaultSlides: SlideData[] = [
  {
    id: 's1',
    title: 'Enterprise AI & Cloud Productivity',
    subtitle: 'Next-Generation Microsoft 365 Architecture with Sovereign Yella AI',
    layout: 'hero',
    theme: 'quantum',
    notes: 'Welcome executive leadership. Introduce the core value propositions: zero corporate telemetry, local sovereignty, and real-time multi-model AI.',
  },
  {
    id: 's2',
    title: 'High-Impact Performance Metrics',
    subtitle: 'Demonstrated Operational Velocity Benchmarks',
    layout: 'kpi-metrics',
    theme: 'quantum',
    notes: 'Walk through the 3 core KPI metrics achieved during the pilot enterprise deployment.',
    metrics: [
      { value: '+340%', label: 'Turnaround Velocity', desc: 'Accelerated document generation across multi-department teams', icon: '⚡' },
      { value: '99.8%', label: 'Formula Precision', desc: 'Verified calculations across complex financial spreadsheets', icon: '🎯' },
      { value: '100%', label: 'Data Sovereignty', desc: 'Zero unauthorized corporate telemetry or cloud leakage', icon: '🔒' },
    ],
  },
  {
    id: 's3',
    title: 'Unified Cross-Suite Workflows',
    subtitle: 'Seamless Interoperability Across Microsoft 365',
    layout: 'two-column',
    theme: 'quantum',
    notes: 'Compare legacy fragmented desktop silos with the new sovereign web suite.',
    columns: {
      leftTitle: 'Legacy Office Bottlenecks',
      leftContent: '• Incompatible local formats\n• Vendor lock-in and mandatory cloud telemetry\n• Static templates requiring manual formatting\n• Rigid formulas prone to formula errors',
      rightTitle: 'Modern 365 Sovereign Solution',
      rightContent: '• Real-time synchronization across Word, Excel & Gmail\n• Multi-model AI failover with quota cascade\n• Dynamic PowerBI analytics built directly into Excel\n• Speech dictation and intelligent slide design',
    },
  },
  {
    id: 's4',
    title: 'Strategic Execution Roadmap',
    subtitle: 'Quarterly Phased Deployment Schedule',
    layout: 'roadmap',
    theme: 'quantum',
    notes: 'Explain the 4-phase rollout plan leading to full enterprise general availability.',
    roadmapSteps: [
      { step: 'Phase 1', title: 'Architecture Audit', desc: 'Core security validation & local AI optimization' },
      { step: 'Phase 2', title: 'Suite Integration', desc: 'Word, Excel, PowerPoint & Gmail bidirectional sync' },
      { step: 'Phase 3', title: 'PowerBI Engine', desc: 'Full interactive dashboards & automated data cleaning' },
      { step: 'Phase 4', title: 'Enterprise GA', desc: 'Full enterprise rollout with zero-downtime SLA' },
    ],
  },
  {
    id: 's5',
    title: 'Executive Vision & Commitment',
    subtitle: 'Uncompromising Quality and Productivity',
    layout: 'quote',
    theme: 'quantum',
    notes: 'Conclude with strategic sign-off and open the floor for questions.',
    quoteText: '"Delivering full Microsoft Office fidelity with zero compromise on privacy, performance, or AI responsiveness."',
    quoteAuthor: 'Executive Board of Architecture & Innovation, 2026',
  },
];

export function PresentationApp() {
  const { activePresentationTitle, setActivePresentationTitle, toggleAIPanel } = useStore();
  const [slides, setSlides] = useState<SlideData[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'design' | 'slideshow' | 'yella'>('home');
  const [zoom, setZoom] = useState(85);
  const [showNotes, setShowNotes] = useState(true);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [presentationTimer, setPresentationTimer] = useState(0);

  const slide = slides[currentSlide] || slides[0];
  const activeTheme = THEMES[slide.theme] || THEMES.quantum;

  // Change theme across current or all slides
  const applyTheme = (themeKey: string, applyToAll = true) => {
    if (applyToAll) {
      setSlides(slides.map((s) => ({ ...s, theme: themeKey })));
      toast.success(`Applied ${THEMES[themeKey].name} theme to all slides!`);
    } else {
      const updated = [...slides];
      updated[currentSlide] = { ...slide, theme: themeKey };
      setSlides(updated);
      toast.success(`Applied ${THEMES[themeKey].name} to Slide ${currentSlide + 1}`);
    }
    setShowThemeModal(false);
  };

  // Change slide layout
  const applyLayout = (layoutType: SlideData['layout']) => {
    const updated = [...slides];
    const s = { ...slide, layout: layoutType };
    if (layoutType === 'kpi-metrics' && !s.metrics) {
      s.metrics = [
        { value: '+150%', label: 'Efficiency Gain', desc: 'Optimized operational workflow', icon: '⚡' },
        { value: '99.9%', label: 'System Uptime', desc: 'Resilient multi-model architecture', icon: '🔒' },
        { value: '10x', label: 'Faster Execution', desc: 'Zero latency sovereign execution', icon: '🚀' },
      ];
    }
    if (layoutType === 'roadmap' && !s.roadmapSteps) {
      s.roadmapSteps = [
        { step: 'Q1', title: 'Design & Prototype', desc: 'Architectural blueprint sign-off' },
        { step: 'Q2', title: 'Beta Validation', desc: 'Multi-seat internal testing' },
        { step: 'Q3', title: 'Ecosystem Sync', desc: 'Live cross-app integration' },
        { step: 'Q4', title: 'Global Launch', desc: 'Enterprise wide availability' },
      ];
    }
    if (layoutType === 'two-column' && !s.columns) {
      s.columns = {
        leftTitle: 'Strategic Objectives',
        leftContent: '• Enhance user productivity\n• Safeguard proprietary data\n• Streamline cloud workflows',
        rightTitle: 'Deliverables & SLAs',
        rightContent: '• 40ms instant responsiveness\n• Automated model failover\n• PowerBI executive analytics',
      };
    }
    if (layoutType === 'quote' && !s.quoteText) {
      s.quoteText = '"Innovation distinguishes between a leader and a follower."';
      s.quoteAuthor = 'Executive Keynote, 2026';
    }
    updated[currentSlide] = s;
    setSlides(updated);
    setShowLayoutModal(false);
    toast.success(`Changed layout to ${layoutType}`);
  };

  const addSlide = (layout: SlideData['layout'] = 'kpi-metrics') => {
    const newSlide: SlideData = {
      id: Date.now().toString(),
      title: 'New Executive Slide',
      subtitle: 'Click to customize subtitle & takeaways',
      layout,
      theme: slide.theme,
      notes: '',
      metrics: [
        { value: '+200%', label: 'Metric Alpha', desc: 'Core performance milestone', icon: '📈' },
        { value: '99.5%', label: 'Metric Beta', desc: 'Accuracy rate achieved', icon: '🎯' },
        { value: 'Zero', label: 'Metric Gamma', desc: 'Zero downtime recorded', icon: '🛡️' },
      ],
    };
    const updated = [...slides];
    updated.splice(currentSlide + 1, 0, newSlide);
    setSlides(updated);
    setCurrentSlide(currentSlide + 1);
    toast.success('Inserted new slide');
  };

  const deleteSlide = (idx: number) => {
    if (slides.length <= 1) {
      toast.error('Deck must contain at least one slide');
      return;
    }
    const updated = slides.filter((_, i) => i !== idx);
    setSlides(updated);
    setCurrentSlide(Math.max(0, idx - 1));
    toast('Slide deleted');
  };

  const duplicateSlide = (idx: number) => {
    const target = slides[idx];
    const dup: SlideData = { ...target, id: Date.now().toString() };
    const updated = [...slides];
    updated.splice(idx + 1, 0, dup);
    setSlides(updated);
    setCurrentSlide(idx + 1);
    toast.success('Slide duplicated');
  };

  const updateSlideField = (field: keyof SlideData, val: any) => {
    const updated = [...slides];
    updated[currentSlide] = { ...updated[currentSlide], [field]: val };
    setSlides(updated);
  };

  // AI Generate Presentation Deck
  const handleAIGenerateDeck = async () => {
    const topic = prompt('Enter presentation topic:', 'AI Enterprise Transformation & Modern 365 Architecture');
    if (!topic) return;

    toast.loading('Yella AI is designing a 5-slide executive deck...', { id: 'slide-ai' });

    try {
      const generatedDeck: SlideData[] = [
        {
          id: 'g1',
          title: topic,
          subtitle: 'Executive Strategic Vision & Multi-Year Deployment Blueprint',
          layout: 'hero',
          theme: 'quantum',
          notes: 'Welcome leadership. Outline the overarching goals for this project.',
        },
        {
          id: 'g2',
          title: 'Core Performance Benchmarks',
          subtitle: 'Measurable Velocity and Uptime Metrics',
          layout: 'kpi-metrics',
          theme: 'quantum',
          notes: 'Walk through verified metrics.',
          metrics: [
            { value: '+350%', label: 'Output Velocity', desc: 'Accelerated cross-team document delivery', icon: '⚡' },
            { value: '99.9%', label: 'Formula Accuracy', desc: 'Mathematically verified spreadsheet logic', icon: '🎯' },
            { value: '100%', label: 'Sovereignty', desc: 'Zero corporate telemetry exposure', icon: '🔒' },
          ],
        },
        {
          id: 'g3',
          title: 'Strategic Architecture Pillars',
          subtitle: 'Legacy Silos vs Sovereign Intelligence',
          layout: 'two-column',
          theme: 'quantum',
          notes: 'Highlight the contrast between legacy limitations and modern capability.',
          columns: {
            leftTitle: 'Traditional Office Constraints',
            leftContent: '• Incompatible offline binaries\n• Vulnerable corporate telemetry\n• Static disconnected tools',
            rightTitle: 'Modern 365 Capabilities',
            rightContent: '• Real-time synchronization across Word, Excel & Gmail\n• Built-in PowerBI executive analytics\n• Autonomous AI model failover',
          },
        },
        {
          id: 'g4',
          title: 'Execution Phasing Roadmap',
          subtitle: 'Quarterly Phased Implementation Plan',
          layout: 'roadmap',
          theme: 'quantum',
          notes: 'Review the 4 deployment phases.',
          roadmapSteps: [
            { step: 'Phase 1', title: 'Audit & Blueprint', desc: 'Complete enterprise security architecture' },
            { step: 'Phase 2', title: 'Cross-Suite Sync', desc: 'Direct bidirectional Word/Excel/Gmail workflows' },
            { step: 'Phase 3', title: 'Analytics Engine', desc: 'Embedded PowerBI & Data Cleaning' },
            { step: 'Phase 4', title: 'General Availability', desc: 'Global rollout with 99.9% uptime SLA' },
          ],
        },
        {
          id: 'g5',
          title: 'Executive Vision & Next Steps',
          subtitle: 'Empowering Enterprise Excellence',
          layout: 'quote',
          theme: 'quantum',
          notes: 'Open floor for questions.',
          quoteText: '"The best way to predict the future of enterprise software is to invent it with uncompromising privacy."',
          quoteAuthor: 'Office 365 Architecture Keynote, 2026',
        },
      ];

      setSlides(generatedDeck);
      setCurrentSlide(0);
      setActivePresentationTitle(`${topic}.pptx`);
      toast.dismiss('slide-ai');
      toast.success('Generated 5-slide Executive Presentation!');
    } catch (e) {
      toast.dismiss('slide-ai');
      toast.error('AI generation fallback');
    }
  };

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
        {/* Main 16:9 Slide Canvas */}
        <div className="w-full h-full flex items-center justify-center p-6 sm:p-12">
          <div
            style={{ background: activeTheme.bg, color: activeTheme.text }}
            className="w-full max-w-5xl aspect-video rounded-2xl shadow-2xl p-10 sm:p-14 flex flex-col justify-between relative overflow-hidden border border-white/10"
          >
            {/* Slide Header */}
            <div>
              <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border mb-3 ${activeTheme.accentBadge}`}>
                SLIDE {currentSlide + 1} OF {slides.length}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p style={{ color: activeTheme.subtitle }} className="text-base sm:text-xl font-medium mt-2">
                  {slide.subtitle}
                </p>
              )}
            </div>

            {/* Layout Specific Rendering */}
            <div className="my-auto py-4">
              {/* KPI Metrics Layout */}
              {slide.layout === 'kpi-metrics' && slide.metrics && (
                <div className="grid grid-cols-3 gap-6">
                  {slide.metrics.map((m, i) => (
                    <div
                      key={i}
                      style={{ background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}
                      className="p-6 rounded-xl border backdrop-blur-md shadow-lg"
                    >
                      <div className="text-2xl mb-2">{m.icon}</div>
                      <div className="text-4xl font-black mb-1">{m.value}</div>
                      <div className="text-sm font-bold opacity-90">{m.label}</div>
                      <div style={{ color: activeTheme.subtitle }} className="text-xs mt-1 leading-relaxed">
                        {m.desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Two Column Layout */}
              {slide.layout === 'two-column' && slide.columns && (
                <div className="grid grid-cols-2 gap-6">
                  <div
                    style={{ background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}
                    className="p-6 rounded-xl border backdrop-blur-md"
                  >
                    <h3 className="font-bold text-lg mb-3 pb-2 border-b border-white/10">{slide.columns.leftTitle}</h3>
                    <div className="text-sm leading-relaxed whitespace-pre-line opacity-90 font-light">
                      {slide.columns.leftContent}
                    </div>
                  </div>
                  <div
                    style={{ background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}
                    className="p-6 rounded-xl border backdrop-blur-md"
                  >
                    <h3 className="font-bold text-lg mb-3 pb-2 border-b border-white/10 text-emerald-300">{slide.columns.rightTitle}</h3>
                    <div className="text-sm leading-relaxed whitespace-pre-line opacity-90 font-light">
                      {slide.columns.rightContent}
                    </div>
                  </div>
                </div>
              )}

              {/* Roadmap Timeline Layout */}
              {slide.layout === 'roadmap' && slide.roadmapSteps && (
                <div className="grid grid-cols-4 gap-4">
                  {slide.roadmapSteps.map((step, i) => (
                    <div
                      key={i}
                      style={{ background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}
                      className="p-4 rounded-xl border backdrop-blur-md text-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-black mx-auto mb-2 text-sm text-amber-300">
                        {i + 1}
                      </div>
                      <div className="text-xs font-bold text-amber-200">{step.step}</div>
                      <div className="text-sm font-black mt-1">{step.title}</div>
                      <div style={{ color: activeTheme.subtitle }} className="text-[11px] mt-1">
                        {step.desc}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quote Layout */}
              {slide.layout === 'quote' && (
                <div
                  style={{ background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}
                  className="p-8 rounded-2xl border backdrop-blur-md text-center max-w-3xl mx-auto shadow-2xl"
                >
                  <p className="text-2xl sm:text-3xl font-serif italic leading-relaxed">
                    {slide.quoteText || '"Delivering excellence without compromise."'}
                  </p>
                  <p style={{ color: activeTheme.subtitle }} className="text-sm font-bold uppercase tracking-wider mt-4">
                    — {slide.quoteAuthor || 'Executive Leadership'}
                  </p>
                </div>
              )}
            </div>

            {/* Slide Footer */}
            <div className="flex items-center justify-between text-xs opacity-60 pt-4 border-t border-white/10">
              <span>Microsoft 365 Enterprise • Sovereign Deck</span>
              <span>Slide {currentSlide + 1} / {slides.length}</span>
            </div>
          </div>
        </div>

        {/* Presenter Footer Control Bar */}
        <div className="w-full flex items-center justify-between px-6 py-3 bg-black/80 text-white text-xs border-t border-white/10">
          <div className="flex items-center gap-3">
            <span className="font-bold text-amber-400">Slide Show Active</span>
            <span>Slide {currentSlide + 1} of {slides.length}</span>
            <span className="text-white/40">| Use Arrow Keys / Space to advance, Esc to exit</span>
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
      {/* 1. PowerPoint Orange Header Bar */}
      <div className="flex items-center justify-between px-3 h-10 bg-[#c43e1c] text-white border-b border-[#a43417] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide">
            <div className="w-5 h-5 rounded bg-white text-[#c43e1c] flex items-center justify-center font-black text-xs shadow-xs">
              P
            </div>
            <span className="hidden sm:inline">PowerPoint</span>
          </div>

          <div className="w-px h-4 bg-white/30 mx-1" />

          {/* Title Input */}
          <input
            type="text"
            value={activePresentationTitle}
            onChange={(e) => setActivePresentationTitle(e.target.value)}
            className="text-xs font-semibold bg-white/10 hover:bg-white/20 focus:bg-white focus:text-[#201f1e] px-2 py-1 rounded transition-colors outline-none truncate max-w-[240px]"
            title="Rename Deck"
          />

          <span className="text-[10px] text-white/80 hidden md:inline flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" /> Saved to Cloud
          </span>
        </div>

        {/* Center Search Bar */}
        <div className="hidden lg:flex items-center bg-white/15 hover:bg-white/25 rounded-md px-3 py-1 w-72 text-xs text-white/80 gap-2 cursor-pointer">
          <Sparkles size={13} />
          <span className="truncate">Ask Yella AI to design slides...</span>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setIsPresenting(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white text-[#c43e1c] hover:bg-amber-50 rounded font-black shadow-xs transition-transform active:scale-95"
            title="Start Fullscreen Slide Show (F5)"
          >
            <Play size={13} fill="#c43e1c" />
            <span>Present (F5)</span>
          </button>

          <button
            onClick={handleAIGenerateDeck}
            className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 text-white rounded font-bold shadow-xs"
          >
            <Wand2 size={13} />
            <span className="hidden sm:inline">AI Deck Builder</span>
          </button>
        </div>
      </div>

      {/* 2. Ribbon Tabs */}
      <div className="flex items-center px-2 bg-white border-b border-[#e1dfdd] text-xs font-semibold text-[#605e5c] gap-1 flex-shrink-0">
        {[
          { id: 'file', label: 'File' },
          { id: 'home', label: 'Home' },
          { id: 'insert', label: 'Insert' },
          { id: 'design', label: '🎨 Design Themes' },
          { id: 'slideshow', label: 'Slide Show' },
          { id: 'yella', label: '✨ Yella AI' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'file') window.print();
              else if (tab.id === 'design') setShowThemeModal(true);
              else setActiveTab(tab.id as any);
            }}
            className={`px-3 py-1.5 transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#c43e1c] text-[#c43e1c] font-bold bg-[#f3f2f1]'
                : 'border-transparent hover:text-[#201f1e] hover:bg-[#faf9f8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Comprehensive Ribbon Toolbar */}
      <div className="flex items-center px-3 py-1 bg-white border-b border-[#d2d0ce] shadow-2xs overflow-x-auto whitespace-nowrap min-h-[46px] gap-2 flex-shrink-0 text-xs">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => addSlide('kpi-metrics')}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#c43e1c] text-white rounded font-bold hover:bg-[#a43417]"
            >
              <Plus size={13} /> New Slide
            </button>

            <button
              onClick={() => setShowLayoutModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold"
            >
              <Layout size={13} /> Change Layout
            </button>

            <button
              onClick={() => setShowThemeModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-purple-700"
            >
              <Palette size={13} /> Themes ({activeTheme.name})
            </button>

            <div className="w-px h-5 bg-[#edebe9]" />

            <button
              onClick={() => duplicateSlide(currentSlide)}
              className="p-1 hover:bg-[#f3f2f1] rounded"
              title="Duplicate Slide"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={() => deleteSlide(currentSlide)}
              className="p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete Slide"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}

        {/* DESIGN TAB */}
        {activeTab === 'design' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500">Pick Deck Theme:</span>
            {Object.keys(THEMES).map((k) => (
              <button
                key={k}
                onClick={() => applyTheme(k, true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-semibold ${
                  slide.theme === k ? 'border-[#c43e1c] bg-amber-50 text-[#c43e1c] font-bold' : 'border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: THEMES[k].accent }} />
                <span>{THEMES[k].name}</span>
              </button>
            ))}
          </div>
        )}

        {/* INSERT TAB */}
        {activeTab === 'insert' && (
          <div className="flex items-center gap-2">
            <button onClick={() => applyLayout('kpi-metrics')} className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold">
              <TrendingUp size={13} /> 3-Card Metrics
            </button>
            <button onClick={() => applyLayout('two-column')} className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold">
              <Layers size={13} /> Comparison Cards
            </button>
            <button onClick={() => applyLayout('roadmap')} className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold">
              <Activity size={13} /> Roadmap Timeline
            </button>
            <button onClick={() => applyLayout('quote')} className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold">
              <Award size={13} /> Executive Quote
            </button>
          </div>
        )}

        {/* SLIDESHOW TAB */}
        {activeTab === 'slideshow' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setCurrentSlide(0); setIsPresenting(true); }}
              className="flex items-center gap-1 px-3 py-1 bg-[#c43e1c] text-white rounded font-bold hover:bg-[#a43417]"
            >
              <Play size={13} /> From Beginning
            </button>
            <button
              onClick={() => setIsPresenting(true)}
              className="flex items-center gap-1 px-3 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold"
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
              className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded font-bold shadow-xs hover:opacity-95"
            >
              <Wand2 size={13} /> Generate Full Presentation Deck
            </button>
            <button
              onClick={toggleAIPanel}
              className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded font-semibold border border-purple-200"
            >
              <Sparkles size={13} /> Open Copilot Panel
            </button>
          </div>
        )}
      </div>

      {/* 4. PowerPoint Studio (Left Slide Thumbnail Rail + Center Canvas) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnails Navigator */}
        <div className="w-52 bg-white border-r border-[#edebe9] p-3 overflow-y-auto space-y-3 flex-shrink-0 select-none">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#605e5c] pb-1 border-b border-[#edebe9]">
            <span>SLIDES ({slides.length})</span>
            <button
              onClick={() => addSlide('kpi-metrics')}
              className="p-1 rounded hover:bg-[#f3f2f1] text-[#c43e1c]"
              title="Add New Slide"
            >
              <Plus size={14} />
            </button>
          </div>

          {slides.map((s, idx) => {
            const isSelected = idx === currentSlide;
            const sTheme = THEMES[s.theme] || THEMES.quantum;
            return (
              <div
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className="group relative cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-gray-400 w-3">{idx + 1}</span>
                  <div className="text-[10px] font-bold text-gray-700 truncate flex-1">
                    {s.title || 'Untitled Slide'}
                  </div>
                </div>

                {/* Thumbnail Canvas */}
                <div
                  style={{ background: sTheme.bg, color: sTheme.text }}
                  className={`aspect-video w-full rounded-lg border-2 p-2 flex flex-col justify-between overflow-hidden shadow-xs transition-all ${
                    isSelected ? 'border-[#c43e1c] ring-2 ring-[#c43e1c]/20' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <p className="text-[8px] font-bold truncate leading-tight">{s.title}</p>
                  <div className="text-[6px] opacity-75 truncate">{s.layout.toUpperCase()}</div>
                </div>

                {/* Reorder Buttons */}
                <div className="absolute top-5 right-1 opacity-0 group-hover:opacity-100 flex flex-col gap-0.5 bg-black/80 p-0.5 rounded shadow">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (idx > 0) {
                        const updated = [...slides];
                        const temp = updated[idx];
                        updated[idx] = updated[idx - 1];
                        updated[idx - 1] = temp;
                        setSlides(updated);
                        setCurrentSlide(idx - 1);
                      }
                    }}
                    disabled={idx === 0}
                    className="p-0.5 text-white hover:bg-white/20 rounded disabled:opacity-20"
                  >
                    <ArrowUp size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (idx < slides.length - 1) {
                        const updated = [...slides];
                        const temp = updated[idx];
                        updated[idx] = updated[idx + 1];
                        updated[idx + 1] = temp;
                        setSlides(updated);
                        setCurrentSlide(idx + 1);
                      }
                    }}
                    disabled={idx === slides.length - 1}
                    className="p-0.5 text-white hover:bg-white/20 rounded disabled:opacity-20"
                  >
                    <ArrowDown size={10} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: Interactive Slide Designer Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#e5e5e5]">
          <div className="flex-1 overflow-auto p-6 sm:p-10 flex items-center justify-center">
            <div
              style={{
                width: '840px',
                aspectRatio: '16/9',
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
                background: activeTheme.bg,
                color: activeTheme.text,
              }}
              className="rounded-2xl shadow-2xl p-10 sm:p-12 flex flex-col justify-between transition-all duration-150 relative border border-black/10 select-none"
            >
              {/* Slide Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${activeTheme.accentBadge}`}>
                    {slide.layout.toUpperCase()} LAYOUT • {activeTheme.name}
                  </span>
                  <button
                    onClick={() => setShowLayoutModal(true)}
                    className="text-[10px] opacity-75 hover:opacity-100 hover:underline"
                  >
                    Change Layout
                  </button>
                </div>

                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => updateSlideField('title', e.target.value)}
                  placeholder="Click to add slide headline"
                  style={{ color: activeTheme.text }}
                  className="w-full text-2xl sm:text-4xl font-black bg-transparent outline-none border-b border-transparent hover:border-white/20 focus:border-[#c43e1c] pb-1 leading-tight tracking-tight"
                />

                <input
                  type="text"
                  value={slide.subtitle}
                  onChange={(e) => updateSlideField('subtitle', e.target.value)}
                  placeholder="Click to add slide subhead"
                  style={{ color: activeTheme.subtitle }}
                  className="w-full text-sm sm:text-base font-semibold bg-transparent outline-none border-b border-transparent hover:border-white/20 focus:border-[#c43e1c] mt-1 pb-1"
                />
              </div>

              {/* Dynamic Interactive Slide Body */}
              <div className="my-auto py-2">
                {/* 1. KPI Metrics Grid */}
                {slide.layout === 'kpi-metrics' && (
                  <div className="grid grid-cols-3 gap-4">
                    {(slide.metrics || []).map((m, i) => (
                      <div
                        key={i}
                        style={{ background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}
                        className="p-4 rounded-xl border backdrop-blur-md shadow-md"
                      >
                        <div className="text-xl mb-1">{m.icon}</div>
                        <input
                          type="text"
                          value={m.value}
                          onChange={(e) => {
                            const updatedMetrics = [...(slide.metrics || [])];
                            updatedMetrics[i].value = e.target.value;
                            updateSlideField('metrics', updatedMetrics);
                          }}
                          className="w-full text-2xl font-black bg-transparent outline-none"
                          style={{ color: activeTheme.text }}
                        />
                        <input
                          type="text"
                          value={m.label}
                          onChange={(e) => {
                            const updatedMetrics = [...(slide.metrics || [])];
                            updatedMetrics[i].label = e.target.value;
                            updateSlideField('metrics', updatedMetrics);
                          }}
                          className="w-full text-xs font-bold bg-transparent outline-none opacity-90 mt-1"
                          style={{ color: activeTheme.text }}
                        />
                        <textarea
                          rows={2}
                          value={m.desc}
                          onChange={(e) => {
                            const updatedMetrics = [...(slide.metrics || [])];
                            updatedMetrics[i].desc = e.target.value;
                            updateSlideField('metrics', updatedMetrics);
                          }}
                          className="w-full text-[11px] bg-transparent outline-none resize-none mt-1"
                          style={{ color: activeTheme.subtitle }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Two Column Comparison */}
                {slide.layout === 'two-column' && slide.columns && (
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      style={{ background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}
                      className="p-4 rounded-xl border backdrop-blur-md"
                    >
                      <input
                        type="text"
                        value={slide.columns.leftTitle}
                        onChange={(e) => updateSlideField('columns', { ...slide.columns, leftTitle: e.target.value })}
                        className="w-full font-bold text-sm bg-transparent outline-none pb-1 border-b border-white/10"
                        style={{ color: activeTheme.text }}
                      />
                      <textarea
                        rows={4}
                        value={slide.columns.leftContent}
                        onChange={(e) => updateSlideField('columns', { ...slide.columns, leftContent: e.target.value })}
                        className="w-full text-xs bg-transparent outline-none resize-none mt-2 font-light leading-relaxed"
                        style={{ color: activeTheme.text }}
                      />
                    </div>
                    <div
                      style={{ background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}
                      className="p-4 rounded-xl border backdrop-blur-md"
                    >
                      <input
                        type="text"
                        value={slide.columns.rightTitle}
                        onChange={(e) => updateSlideField('columns', { ...slide.columns, rightTitle: e.target.value })}
                        className="w-full font-bold text-sm bg-transparent outline-none pb-1 border-b border-white/10 text-emerald-300"
                      />
                      <textarea
                        rows={4}
                        value={slide.columns.rightContent}
                        onChange={(e) => updateSlideField('columns', { ...slide.columns, rightContent: e.target.value })}
                        className="w-full text-xs bg-transparent outline-none resize-none mt-2 font-light leading-relaxed"
                        style={{ color: activeTheme.text }}
                      />
                    </div>
                  </div>
                )}

                {/* 3. Roadmap Timeline */}
                {slide.layout === 'roadmap' && slide.roadmapSteps && (
                  <div className="grid grid-cols-4 gap-3">
                    {slide.roadmapSteps.map((step, i) => (
                      <div
                        key={i}
                        style={{ background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}
                        className="p-3 rounded-xl border backdrop-blur-md text-center"
                      >
                        <div className="text-xs font-black text-amber-300">{step.step}</div>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const updatedSteps = [...(slide.roadmapSteps || [])];
                            updatedSteps[i].title = e.target.value;
                            updateSlideField('roadmapSteps', updatedSteps);
                          }}
                          className="w-full text-xs font-bold bg-transparent outline-none text-center mt-1"
                          style={{ color: activeTheme.text }}
                        />
                        <textarea
                          rows={2}
                          value={step.desc}
                          onChange={(e) => {
                            const updatedSteps = [...(slide.roadmapSteps || [])];
                            updatedSteps[i].desc = e.target.value;
                            updateSlideField('roadmapSteps', updatedSteps);
                          }}
                          className="w-full text-[10px] bg-transparent outline-none resize-none text-center mt-1"
                          style={{ color: activeTheme.subtitle }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Quote */}
                {slide.layout === 'quote' && (
                  <div
                    style={{ background: activeTheme.cardBg, borderColor: activeTheme.cardBorder }}
                    className="p-6 rounded-2xl border backdrop-blur-md text-center max-w-xl mx-auto shadow-xl"
                  >
                    <textarea
                      rows={3}
                      value={slide.quoteText || ''}
                      onChange={(e) => updateSlideField('quoteText', e.target.value)}
                      placeholder="Enter executive quotation..."
                      className="w-full text-lg sm:text-xl font-serif italic text-center bg-transparent outline-none resize-none"
                      style={{ color: activeTheme.text }}
                    />
                    <input
                      type="text"
                      value={slide.quoteAuthor || ''}
                      onChange={(e) => updateSlideField('quoteAuthor', e.target.value)}
                      placeholder="Speaker / Title"
                      className="w-full text-xs font-bold text-center bg-transparent outline-none uppercase tracking-wider mt-2"
                      style={{ color: activeTheme.subtitle }}
                    />
                  </div>
                )}
              </div>

              {/* Slide Footer */}
              <div className="flex items-center justify-between text-[11px] opacity-70 pt-2 border-t border-white/10">
                <span>Microsoft 365 Enterprise • Sovereign Deck</span>
                <span>Slide {currentSlide + 1} / {slides.length}</span>
              </div>
            </div>
          </div>

          {/* Speaker Notes Drawer */}
          {showNotes && (
            <div className="h-24 bg-white border-t border-[#edebe9] p-3 flex flex-col flex-shrink-0">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#605e5c] mb-1">
                <span>SPEAKER NOTES</span>
                <button onClick={() => setShowNotes(false)} className="hover:text-[#201f1e] text-[10px]">
                  Hide
                </button>
              </div>
              <textarea
                value={slide.notes}
                onChange={(e) => updateSlideField('notes', e.target.value)}
                placeholder="Type speaker notes here to guide your executive presentation..."
                className="w-full flex-1 bg-transparent outline-none text-xs text-[#201f1e] resize-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* 5. PowerPoint Status Bar */}
      <div className="flex items-center justify-between px-3 h-6 bg-white border-t border-[#d2d0ce] text-[11px] text-[#605e5c] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>Slide {currentSlide + 1} of {slides.length}</span>
          <span>Theme: <strong>{activeTheme.name}</strong></span>
          <span>Layout: <strong>{slide.layout}</strong></span>
          {!showNotes && (
            <button onClick={() => setShowNotes(true)} className="text-[#c43e1c] font-semibold hover:underline">
              Show Notes
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsPresenting(true)} className="flex items-center gap-1 font-bold text-[#c43e1c]">
            <Play size={11} /> Present
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-0.5 hover:bg-[#edebe9] rounded"><ZoomOut size={12} /></button>
            <span>{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-0.5 hover:bg-[#edebe9] rounded"><ZoomIn size={12} /></button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Design Themes Picker Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#edebe9] p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Microsoft 365 Designer Themes Gallery</h3>
                <p className="text-xs text-gray-500">Transform background gradients, frosted cards, and typography instantly.</p>
              </div>
              <button onClick={() => setShowThemeModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {Object.entries(THEMES).map(([key, theme]) => (
                <div
                  key={key}
                  onClick={() => applyTheme(key, true)}
                  className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col justify-between h-36 transition-all hover:scale-105 ${
                    slide.theme === key ? 'border-[#c43e1c] ring-2 ring-[#c43e1c]/30' : 'border-gray-200'
                  }`}
                  style={{ background: theme.bg, color: theme.text }}
                >
                  <div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: theme.cardBg }}>
                      {theme.name}
                    </span>
                    <p className="text-xs font-black mt-2 leading-tight">{theme.name}</p>
                  </div>
                  <div className="text-[10px] opacity-75 font-mono">16:9 HD</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-xs text-gray-500">Applies to all slides in your deck</span>
              <button onClick={() => setShowThemeModal(false)} className="px-4 py-1.5 bg-[#c43e1c] text-white font-bold rounded text-xs">
                Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Change Slide Layout Modal */}
      {showLayoutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#edebe9] p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gray-900">Select Slide Layout Template</h3>
              <button onClick={() => setShowLayoutModal(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { id: 'hero', name: 'Hero Headline Slide', desc: 'Big bold title with subtitle pill' },
                { id: 'kpi-metrics', name: '3-Card KPI Metrics', desc: 'Three stat scorecards with icons & subtext' },
                { id: 'two-column', name: 'Two-Column Comparison', desc: 'Structured left vs right comparison' },
                { id: 'roadmap', name: 'Roadmap Milestone Timeline', desc: '4 horizontal milestone phase cards' },
                { id: 'quote', name: 'Executive Quote & Vision', desc: 'Large quotation with attribution card' },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => applyLayout(l.id as any)}
                  className={`p-3 text-left rounded-lg border hover:border-[#c43e1c] hover:bg-orange-50/50 transition-all ${
                    slide.layout === l.id ? 'border-[#c43e1c] bg-orange-50 font-bold' : 'border-gray-200'
                  }`}
                >
                  <p className="font-bold text-gray-900">{l.name}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{l.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
