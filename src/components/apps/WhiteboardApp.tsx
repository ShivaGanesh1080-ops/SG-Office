import { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Square,
  Circle,
  Type,
  Eraser,
  Download,
  Trash2,
  Sparkles,
  Undo2,
  Redo2,
  Layers,
  ZoomIn,
  ZoomOut,
  MousePointer,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function WhiteboardApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'arrow'>('pen');
  const [color, setColor] = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(3);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw initial diagram demo
    canvas.width = canvas.parentElement?.clientWidth || 1000;
    canvas.height = canvas.parentElement?.clientHeight || 650;

    // Background grid
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 0; x < canvas.width; x += 30) {
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw initial AI flow boxes
    const drawBox = (x: number, y: number, w: number, h: number, text: string, strokeColor: string) => {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(26, 26, 62, 0.85)';
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e8e8ff';
      ctx.font = 'bold 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(text, x + w / 2, y + h / 2 + 5);
    };

    drawBox(100, 150, 180, 60, '1. User Voice / Prompt', '#8b5cf6');
    drawBox(380, 150, 200, 60, '2. Nova Autonomous Engine', '#6366f1');
    drawBox(680, 80, 190, 60, '3a. NovaDoc Synthesis', '#3b82f6');
    drawBox(680, 170, 190, 60, '3b. NovaSheet Formulas', '#10b981');
    drawBox(680, 260, 190, 60, '3c. NovaSlide Deck', '#f59e0b');

    // Connector arrows
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(280, 180);
    ctx.lineTo(380, 180);
    ctx.moveTo(580, 180);
    ctx.lineTo(680, 110);
    ctx.moveTo(580, 180);
    ctx.lineTo(680, 200);
    ctx.moveTo(580, 180);
    ctx.lineTo(680, 290);
    ctx.stroke();
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#0f0f23' : color;
    ctx.lineWidth = tool === 'eraser' ? 24 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toast('Whiteboard cleared');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--nova-bg)' }}>
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--nova-border)', background: 'var(--nova-bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <PenTool size={18} style={{ color: '#f97316' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--nova-text)' }}>NovaBoard Whiteboard & Architecture Diagrammer</span>
        </div>

        {/* Tools */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ background: 'var(--nova-bg-tertiary)' }}>
          {[
            { id: 'pen', icon: <PenTool size={15} />, label: 'Draw' },
            { id: 'eraser', icon: <Eraser size={15} />, label: 'Erase' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id as any)}
              className="p-2 rounded-lg transition-colors"
              style={{
                background: tool === t.id ? 'var(--nova-primary)' : 'transparent',
                color: tool === t.id ? '#fff' : 'var(--nova-text-muted)',
              }}
            >
              {t.icon}
            </button>
          ))}

          <div className="w-px h-5 mx-1" style={{ background: 'var(--nova-border)' }} />

          {/* Palette Colors */}
          {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#ffffff'].map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }}
              className="w-5 h-5 rounded-full transition-transform hover:scale-125"
              style={{
                background: c,
                border: color === c ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toast.success('Nova AI has aligned nodes and generated flow arrows!')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: 'var(--nova-accent-light)', color: 'var(--nova-accent)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
          >
            <Sparkles size={14} /> AI Auto-Diagram
          </button>
          <button onClick={clearCanvas} className="p-2 rounded-xl text-gray-400 hover:text-red-400">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-full block"
        />
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-gray-300 border border-white/10 pointer-events-none">
          Click & drag to sketch architecture diagrams
        </div>
      </div>
    </div>
  );
}
