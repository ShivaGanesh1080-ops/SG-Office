import { useState, useRef } from 'react';
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
  Upload,
  ArrowUp,
  ArrowDown,
  Palette,
  AlignLeft,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string;
}

interface SlideData {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  notes: string;
  layout: 'title' | 'content' | 'two-column' | 'blank';
  theme: string;
}

const defaultSlides: SlideData[] = [
  {
    id: 's1',
    title: 'Enterprise AI Strategy 2027',
    subtitle: 'SG-Office & Yella Autonomous Workspace',
    content: '',
    notes: 'Welcome stakeholders. Emphasize user data sovereignty and productivity gains.',
    layout: 'title',
    theme: '#ffffff',
  },
  {
    id: 's2',
    title: 'Key Innovations & Capabilities',
    subtitle: '',
    content: '• Real-Time CSV and Data Ingestion with AutoSum\n• Deep Personalized Copilot Engine (Yella)\n• Native Google Gmail Integration with Workspace Connect\n• Full TipTap Word Processor with Tables & Media\n• Zero-Telemetry On-Device Privacy Architecture',
    notes: 'Highlight that unlike Microsoft 365, all user documents remain private.',
    layout: 'content',
    theme: '#ffffff',
  },
  {
    id: 's3',
    title: 'Measurable Impact Benchmarks',
    subtitle: 'Operational Efficiency',
    content: '📈 340% increase in cross-team turnaround speed\n🎯 99.4% formula accuracy in automated models\n⚡ 40ms compilation speed on lightweight modern stack\n🔒 100% data sovereignty guarantee',
    notes: 'Field benchmark results from beta corporate deployment.',
    layout: 'content',
    theme: '#ffffff',
  },
  {
    id: 's4',
    title: 'Thank You & Next Steps',
    subtitle: 'Ready to deploy across enterprise seats',
    content: 'Questions & Hands-on Session with SG-Office Suite',
    notes: 'Open floor for questions.',
    layout: 'title',
    theme: '#ffffff',
  },
];

export function PresentationApp() {
  const [slides, setSlides] = useState<SlideData[]>(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'design' | 'slideshow'>('home');
  const [zoom, setZoom] = useState(80);
  const [showNotes, setShowNotes] = useState(true);
  const { toggleAIPanel } = useStore();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const slide = slides[currentSlide] || slides[0];

  const addSlide = (layout: SlideData['layout'] = 'content') => {
    const newSlide: SlideData = {
      id: Date.now().toString(),
      title: 'New Slide Title',
      subtitle: 'Click to add subtitle',
      content: '• Add key points or strategy notes here\n• Format bullets or insert tables\n• Use Yella to generate slide copy',
      notes: '',
      layout: layout,
      theme: '#ffffff',
    };
    const newSlides = [...slides];
    newSlides.splice(currentSlide + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlide(currentSlide + 1);
    toast.success('New slide created');
  };

  const duplicateSlide = () => {
    const dup = { ...slide, id: Date.now().toString(), title: `${slide.title} (Copy)` };
    const newSlides = [...slides];
    newSlides.splice(currentSlide + 1, 0, dup);
    setSlides(newSlides);
    setCurrentSlide(currentSlide + 1);
    toast('Slide duplicated');
  };

  const deleteSlide = () => {
    if (slides.length <= 1) {
      toast.error('Deck must have at least one slide');
      return;
    }
    const newSlides = slides.filter((_, i) => i !== currentSlide);
    setSlides(newSlides);
    setCurrentSlide(Math.min(currentSlide, newSlides.length - 1));
    toast('Slide deleted');
  };

  const moveSlide = (dir: -1 | 1) => {
    const targetIdx = currentSlide + dir;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const newSlides = [...slides];
    const temp = newSlides[currentSlide];
    newSlides[currentSlide] = newSlides[targetIdx];
    newSlides[targetIdx] = temp;
    setSlides(newSlides);
    setCurrentSlide(targetIdx);
  };

  const updateSlide = (field: keyof SlideData, value: string) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = { ...newSlides[currentSlide], [field]: value };
    setSlides(newSlides);
  };

  // Full Screen Presentation Mode
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
        <div className="w-[88vw] aspect-video bg-white shadow-2xl p-16 flex flex-col justify-between rounded-sm">
          {slide.layout === 'title' ? (
            <div className="text-center my-auto space-y-4">
              <h1 className="text-5xl font-extrabold text-[#201f1e]">{slide.title}</h1>
              <p className="text-2xl text-[#605e5c]">{slide.subtitle}</p>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <h2 className="text-4xl font-bold text-[#c43e1c] border-b pb-4 mb-8">{slide.title}</h2>
              <div className="text-xl text-[#201f1e] whitespace-pre-line leading-relaxed flex-1">
                {slide.content}
              </div>
            </div>
          )}
          <div className="flex justify-between items-center text-xs text-[#8a8886] border-t pt-4">
            <span>SG-Office PowerPoint</span>
            <span>{currentSlide + 1} / {slides.length}</span>
          </div>
        </div>
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-4 py-1.5 rounded-full border border-white/20">
          Slide {currentSlide + 1} of {slides.length} • Click to advance • Esc to exit
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f3f2f1] select-none text-[#201f1e] overflow-hidden">
      {/* 1. PowerPoint Ribbon Tabs */}
      <div className="flex items-center gap-0.5 px-3 bg-white border-b border-[#edebe9] text-[11px] font-medium overflow-x-auto whitespace-nowrap flex-shrink-0">
        <button
          onClick={() => {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(slides, null, 2));
            const dl = document.createElement('a');
            dl.setAttribute('href', dataStr);
            dl.setAttribute('download', 'Presentation_Deck.json');
            dl.click();
            toast.success('Exported slide deck');
          }}
          className="px-2.5 py-1 font-bold text-white bg-[#c43e1c] hover:bg-[#a83214] transition-colors rounded-t-xs"
        >
          File
        </button>
        {[
          { id: 'home', label: 'Home' },
          { id: 'insert', label: 'Insert' },
          { id: 'design', label: 'Design & Themes' },
          { id: 'slideshow', label: 'Slide Show' },
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

      {/* 2. Responsive Compact Ribbon Toolbar (No wrapping!) */}
      <div className="flex items-center px-3 py-1 bg-white border-b border-[#d2d0ce] shadow-2xs overflow-x-auto whitespace-nowrap min-h-[46px] gap-2 flex-shrink-0 text-xs">
        {activeTab === 'home' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border-r border-[#edebe9] pr-2">
              <button
                onClick={() => addSlide('content')}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#fce8e6] text-[#c43e1c] rounded font-semibold text-xs hover:bg-[#f8d4cf]"
              >
                <Plus size={14} /> New Slide
              </button>
              <button onClick={duplicateSlide} className="p-1 rounded hover:bg-[#f3f2f1]" title="Duplicate Slide"><Copy size={13} /></button>
              <button onClick={deleteSlide} className="p-1 rounded hover:bg-red-50 text-red-600" title="Delete Slide"><Trash2 size={13} /></button>
            </div>

            <div className="flex items-center gap-1 border-r border-[#edebe9] pr-2">
              <button onClick={() => moveSlide(-1)} disabled={currentSlide === 0} className="p-1 rounded hover:bg-[#f3f2f1] disabled:opacity-30" title="Move Slide Up"><ArrowUp size={13} /></button>
              <button onClick={() => moveSlide(1)} disabled={currentSlide === slides.length - 1} className="p-1 rounded hover:bg-[#f3f2f1] disabled:opacity-30" title="Move Slide Down"><ArrowDown size={13} /></button>
            </div>

            <div className="flex items-center gap-1.5 border-r border-[#edebe9] pr-2">
              <select
                value={slide.layout}
                onChange={(e) => updateSlide('layout', e.target.value)}
                className="h-6 px-1.5 text-xs bg-white border border-[#d2d0ce] rounded outline-none"
              >
                <option value="title">Title Layout</option>
                <option value="content">Title & Content</option>
                <option value="two-column">Two Columns</option>
                <option value="blank">Blank Slide</option>
              </select>
            </div>

            <button
              onClick={() => setIsPresenting(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#c43e1c] text-white rounded font-bold text-xs shadow-xs hover:bg-[#a83214]"
            >
              <Play size={13} fill="currentColor" /> Present Deck
            </button>
          </div>
        )}

        {activeTab === 'insert' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                updateSlide('content', slide.content + '\n• New bullet point inserted');
                toast.success('Text item added');
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              <Type size={14} className="text-[#c43e1c]" /> Text Box
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter Image URL to embed:');
                if (url) {
                  updateSlide('content', slide.content + `\n![Image](${url})`);
                  toast.success('Image link embedded');
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              <Upload size={14} /> Insert Image URL
            </button>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#f3f2f1] hover:bg-[#edebe9] rounded font-semibold text-xs"
            >
              <FileText size={14} /> Toggle Speaker Notes
            </button>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#c43e1c]">Theme Palettes:</span>
            {[
              { label: 'Clean White', bg: '#ffffff' },
              { label: 'Warm Ivory', bg: '#fffdfa' },
              { label: 'Soft Sky', bg: '#f4f8fe' },
              { label: 'Mint Clean', bg: '#f4fbf7' },
            ].map((th) => (
              <button
                key={th.label}
                onClick={() => updateSlide('theme', th.bg)}
                className="px-2.5 py-0.5 rounded border border-[#d2d0ce] hover:border-[#c43e1c] text-[11px] font-semibold"
                style={{ background: th.bg }}
              >
                {th.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'slideshow' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPresenting(true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#c43e1c] text-white rounded font-bold text-xs"
            >
              <Play size={13} fill="currentColor" /> Play From Slide 1
            </button>
            <span className="text-[11px] text-[#605e5c]">Press Esc at any time to exit presentation.</span>
          </div>
        )}
      </div>

      {/* 3. Main Workspace: Thumbnails + Center 16:9 Canvas + Speaker Notes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnails Panel (Compact 140px width) */}
        <div className="w-[145px] bg-white border-r border-[#edebe9] p-2 space-y-2 overflow-y-auto flex-shrink-0">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`cursor-pointer rounded-sm border p-1.5 transition-all ${
                currentSlide === idx
                  ? 'border-[#c43e1c] ring-2 ring-[#c43e1c]/20 shadow-xs'
                  : 'border-[#edebe9] hover:border-[#a19f9d]'
              }`}
            >
              <div className="aspect-video bg-white border border-[#f3f2f1] p-1 flex flex-col justify-between">
                <span className="text-[8px] font-bold text-[#201f1e] truncate">{s.title || 'Untitled'}</span>
                <span className="text-[7px] text-[#8a8886] self-end">{idx + 1}</span>
              </div>
            </div>
          ))}
          <button
            onClick={() => addSlide('content')}
            className="w-full py-1.5 border border-dashed border-[#c8c6c4] text-[#605e5c] hover:border-[#c43e1c] hover:text-[#c43e1c] rounded text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {/* Center Canvas & Speaker Notes */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f3f2f1]">
          {/* 16:9 Canvas */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <div
              className="shadow-md border border-[#e1dfdd] rounded-sm flex flex-col justify-between p-8 transition-transform"
              style={{
                width: `${(900 * zoom) / 100}px`,
                aspectRatio: '16/9',
                background: slide.theme,
              }}
            >
              {slide.layout === 'title' ? (
                <div className="my-auto text-center space-y-3">
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateSlide('title', e.target.value)}
                    className="w-full text-3xl font-extrabold text-[#201f1e] text-center bg-transparent border-b border-transparent hover:border-[#edebe9] focus:border-[#c43e1c] outline-none"
                    placeholder="Click to add title"
                  />
                  <input
                    type="text"
                    value={slide.subtitle}
                    onChange={(e) => updateSlide('subtitle', e.target.value)}
                    className="w-full text-base text-[#605e5c] text-center bg-transparent border-b border-transparent hover:border-[#edebe9] focus:border-[#c43e1c] outline-none"
                    placeholder="Click to add subtitle"
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateSlide('title', e.target.value)}
                    className="text-2xl font-bold text-[#c43e1c] border-b border-[#edebe9] pb-2 mb-4 outline-none focus:border-[#c43e1c]"
                    placeholder="Click to add slide title"
                  />
                  <textarea
                    value={slide.content}
                    onChange={(e) => updateSlide('content', e.target.value)}
                    rows={6}
                    className="w-full flex-1 text-sm leading-relaxed text-[#201f1e] outline-none resize-none bg-transparent"
                    placeholder="Click to add bullet points or text..."
                  />
                </div>
              )}
              <div className="text-[9px] text-[#8a8886] flex justify-between border-t border-[#f3f2f1] pt-1">
                <span>SG-Office PowerPoint</span>
                <span>Slide {currentSlide + 1} of {slides.length}</span>
              </div>
            </div>
          </div>

          {/* Speaker Notes Drawer (Just like PowerPoint!) */}
          {showNotes && (
            <div className="h-20 bg-white border-t border-[#edebe9] p-2 flex flex-col flex-shrink-0">
              <span className="text-[10px] font-bold text-[#8a8886] uppercase">Speaker Notes</span>
              <textarea
                value={slide.notes}
                onChange={(e) => updateSlide('notes', e.target.value)}
                placeholder="Click to add speaker notes for this slide..."
                className="w-full h-full text-xs text-[#605e5c] outline-none resize-none bg-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. PowerPoint Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#f3f2f1] border-t border-[#edebe9] text-[11px] text-[#605e5c] flex-shrink-0">
        <span>Slide {currentSlide + 1} of {slides.length}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-0.5 hover:bg-[#edebe9]"><ZoomOut size={12} /></button>
          <span className="font-mono text-[10px]">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-0.5 hover:bg-[#edebe9]"><ZoomIn size={12} /></button>
        </div>
      </div>
    </div>
  );
}
