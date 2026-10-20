import { useState } from 'react';
import {
  Presentation,
  Plus,
  Play,
  Sparkles,
  ChevronDown,
  Type,
  Square,
  Copy,
  Trash2,
  Download,
  ZoomIn,
  ZoomOut,
  Layout,
  Shapes,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  layout: 'title' | 'content';
}

const defaultSlides: SlideData[] = [
  {
    id: '1',
    title: 'Enterprise AI Transformation',
    subtitle: 'SG-Office 365 Architecture & Roadmap',
    content: '',
    layout: 'title',
  },
  {
    id: '2',
    title: 'Key Milestones & Deliverables',
    subtitle: '',
    content: '• Pixel-perfect Microsoft Office 365 UI with clean white theme\n• Integrated Copilot AI assistant across Docs, Sheets & Slides\n• 100% zero-telemetry local privacy guard\n• Universal Command Palette (Ctrl+K) for rapid navigation',
    layout: 'content',
  },
  {
    id: '3',
    title: 'Performance & Productivity Metrics',
    subtitle: 'Enterprise Benchmarks',
    content: '📈 340% increase in cross-department draft speed\n🎯 99.4% formula accuracy using natural language AutoSum\n⚡ Instant sub-second compilation on Vite & React 18\n🔒 Complete end-to-end local vault encryption',
    layout: 'content',
  },
  {
    id: '4',
    title: 'Thank You & Next Actions',
    subtitle: 'Ready for full production rollout',
    content: 'Questions & Hands-on Exploration with SG-Office Suite',
    layout: 'title',
  },
];

export function PresentationApp() {
  const [slides, setSlides] = useState<SlideData[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'design' | 'slideshow'>('home');
  const [zoom, setZoom] = useState(85);
  const { toggleAIPanel } = useStore();

  const slide = slides[currentSlide] || slides[0];

  const addSlide = () => {
    const newSlide: SlideData = {
      id: Date.now().toString(),
      title: 'New Slide Title',
      subtitle: 'Click to add subtitle',
      content: '• Add key points here\n• Format bullets or tables\n• Use Copilot to expand bullet points',
      layout: 'content',
    };
    const newSlides = [...slides];
    newSlides.splice(currentSlide + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlide(currentSlide + 1);
    toast.success('Slide added');
  };

  const updateSlide = (field: keyof SlideData, value: string) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = { ...newSlides[currentSlide], [field]: value };
    setSlides(newSlides);
  };

  if (isPresenting) {
    return (
      <div
        className="fixed inset-0 z-[200] bg-black flex items-center justify-center cursor-pointer select-none"
        onClick={() => {
          if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
          else setIsPresenting(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsPresenting(false);
          if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
          if (e.key === 'ArrowLeft' && currentSlide > 0) setCurrentSlide(currentSlide - 1);
        }}
        tabIndex={0}
        autoFocus
      >
        <div className="w-[85vw] aspect-video bg-white shadow-2xl p-16 flex flex-col justify-center rounded-sm">
          {slide.layout === 'title' ? (
            <div className="text-center my-auto">
              <h1 className="text-5xl font-extrabold text-[#201f1e] mb-4">{slide.title}</h1>
              <p className="text-2xl text-[#605e5c]">{slide.subtitle}</p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <h2 className="text-4xl font-bold text-[#c43e1c] border-b pb-4 mb-6">{slide.title}</h2>
              <div className="text-xl text-[#201f1e] whitespace-pre-line leading-relaxed flex-1">
                {slide.content}
              </div>
            </div>
          )}
        </div>
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-4 py-1.5 rounded-full border border-white/20">
          Slide {currentSlide + 1} of {slides.length} • Click to advance • Esc to exit
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f3f2f1] select-none text-[#201f1e]">
      {/* 1. PowerPoint Ribbon Tabs */}
      <div className="flex items-center gap-1 px-4 bg-white border-b border-[#edebe9] text-xs font-medium">
        <button className="px-3 py-1.5 font-bold text-white bg-[#c43e1c] hover:bg-[#a83214] transition-colors rounded-t-sm">
          File
        </button>
        {[
          { id: 'home', label: 'Home' },
          { id: 'insert', label: 'Insert' },
          { id: 'design', label: 'Design' },
          { id: 'slideshow', label: 'Slide Show' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-[#c43e1c] text-[#c43e1c] font-semibold'
                : 'border-transparent text-[#605e5c] hover:bg-[#f3f2f1]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2. PowerPoint Ribbon Toolbar */}
      <div className="flex items-center px-4 bg-white border-b border-[#d2d0ce] shadow-xs overflow-x-auto min-h-[82px]">
        {/* Slides Group */}
        <div className="ribbon-group">
          <div className="flex items-center gap-2">
            <button
              onClick={addSlide}
              className="flex flex-col items-center p-1 rounded hover:bg-[#f3f2f1] text-[#c43e1c]"
            >
              <Plus size={18} />
              <span className="text-[10px] font-semibold text-[#201f1e]">New Slide</span>
            </button>
            <button
              onClick={() => updateSlide('layout', slide.layout === 'title' ? 'content' : 'title')}
              className="flex flex-col items-center p-1 rounded hover:bg-[#f3f2f1] text-[#605e5c]"
            >
              <Layout size={18} />
              <span className="text-[10px]">Layout</span>
            </button>
          </div>
          <span className="ribbon-label">Slides</span>
        </div>

        {/* Presentation Group */}
        <div className="ribbon-group">
          <button
            onClick={() => setIsPresenting(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#fce8e6] text-[#c43e1c] hover:bg-[#f8d4cf] rounded font-semibold text-xs"
          >
            <Play size={14} fill="currentColor" /> From Beginning
          </button>
          <span className="ribbon-label">Start Presentation</span>
        </div>

        {/* Copilot Group */}
        <div className="ribbon-group border-r-0 pl-2">
          <button
            onClick={() => {
              toast.success('Copilot: Generating slide deck outlines...');
              toggleAIPanel();
            }}
            className="flex flex-col items-center p-1 rounded hover:bg-[#f3f2f1]"
          >
            <div className="w-6 h-6 rounded-md copilot-gradient flex items-center justify-center text-white mb-0.5">
              <Sparkles size={13} />
            </div>
            <span className="text-[10px] font-semibold copilot-text">Copilot</span>
          </button>
          <span className="ribbon-label font-semibold copilot-text">AI Slide Maker</span>
        </div>
      </div>

      {/* 3. Main Workspace: Thumbnails + Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnails Panel */}
        <div className="w-[180px] bg-white border-r border-[#edebe9] p-3 space-y-3 overflow-y-auto">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`cursor-pointer rounded-sm border p-2 transition-all ${
                currentSlide === idx
                  ? 'border-[#c43e1c] ring-2 ring-[#c43e1c]/20 shadow-xs'
                  : 'border-[#edebe9] hover:border-[#a19f9d]'
              }`}
            >
              <div className="aspect-video bg-white border border-[#f3f2f1] p-1.5 flex flex-col justify-between">
                <span className="text-[9px] font-bold text-[#201f1e] truncate">{s.title || 'Untitled'}</span>
                <span className="text-[8px] text-[#8a8886] self-end">{idx + 1}</span>
              </div>
            </div>
          ))}
          <button
            onClick={addSlide}
            className="w-full py-2 border border-dashed border-[#c8c6c4] text-[#605e5c] hover:border-[#c43e1c] hover:text-[#c43e1c] rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Add Slide
          </button>
        </div>

        {/* Center 16:9 Canvas */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto bg-[#f3f2f1]">
          <div
            className="bg-white shadow-md border border-[#e1dfdd] rounded-sm flex flex-col justify-between p-12 transition-transform"
            style={{
              width: `${(960 * zoom) / 100}px`,
              aspectRatio: '16/9',
            }}
          >
            {slide.layout === 'title' ? (
              <div className="my-auto text-center space-y-4">
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => updateSlide('title', e.target.value)}
                  className="w-full text-4xl font-extrabold text-[#201f1e] text-center bg-transparent border-b border-transparent hover:border-[#edebe9] focus:border-[#c43e1c] outline-none"
                  placeholder="Click to add title"
                />
                <input
                  type="text"
                  value={slide.subtitle}
                  onChange={(e) => updateSlide('subtitle', e.target.value)}
                  className="w-full text-xl text-[#605e5c] text-center bg-transparent border-b border-transparent hover:border-[#edebe9] focus:border-[#c43e1c] outline-none"
                  placeholder="Click to add subtitle"
                />
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <input
                  type="text"
                  value={slide.title}
                  onChange={(e) => updateSlide('title', e.target.value)}
                  className="text-3xl font-bold text-[#c43e1c] border-b border-[#edebe9] pb-3 mb-6 outline-none focus:border-[#c43e1c]"
                  placeholder="Click to add slide title"
                />
                <textarea
                  value={slide.content}
                  onChange={(e) => updateSlide('content', e.target.value)}
                  rows={8}
                  className="w-full flex-1 text-base leading-relaxed text-[#201f1e] outline-none resize-none bg-transparent"
                  placeholder="Click to add bullet points or text..."
                />
              </div>
            )}
            <div className="text-[10px] text-[#8a8886] flex justify-between border-t border-[#f3f2f1] pt-2">
              <span>SG-Office PowerPoint</span>
              <span>Slide {currentSlide + 1} of {slides.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-[#f3f2f1] border-t border-[#edebe9] text-[11px] text-[#605e5c]">
        <span>Slide {currentSlide + 1} of {slides.length}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-0.5 hover:bg-[#edebe9]"><ZoomOut size={12} /></button>
          <span className="font-mono">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-0.5 hover:bg-[#edebe9]"><ZoomIn size={12} /></button>
        </div>
      </div>
    </div>
  );
}
