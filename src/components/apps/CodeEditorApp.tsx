import { useState } from 'react';
import {
  Code2,
  Play,
  Copy,
  Sparkles,
  FileCode,
  FolderTree,
  Terminal,
  Settings,
  Download,
  CheckCircle2,
  Bug,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

const sampleCode = `// NovaSuite Autonomous Analytics Script
// Calculates cross-document projections using AI forecasting

interface FinancialProjection {
  quarter: string;
  revenueTarget: number;
  aiPredictedActual: number;
  confidenceScore: number;
}

const generateProjections = (baseGrowthRate: number): FinancialProjection[] => {
  const quarters = ['Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027'];
  let baseline = 120_000;

  return quarters.map((q, idx) => {
    baseline *= (1 + baseGrowthRate);
    const variance = (Math.random() * 0.05) - 0.02;
    return {
      quarter: q,
      revenueTarget: Math.round(baseline),
      aiPredictedActual: Math.round(baseline * (1 + variance)),
      confidenceScore: +(0.94 + (Math.random() * 0.05)).toFixed(3),
    };
  });
};

const results = generateProjections(0.18);
console.log("=== NovaSuite AI Financial Model Output ===");
console.table(results);
`;

export function CodeEditorApp() {
  const [code, setCode] = useState(sampleCode);
  const [output, setOutput] = useState<string[]>([
    'NovaCode Runtime v2.4 initialized.',
    'Ready to execute TypeScript / Python / SQL in secure sandbox.',
  ]);
  const [language, setLanguage] = useState('TypeScript');
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setOutput([
        '=== NovaSuite AI Financial Model Output ===',
        '┌─────────┬──────────────┬────────────────────┬─────────────────┐',
        '│ Quarter │ Target ($)   │ AI Predicted ($)   │ Confidence      │',
        '├─────────┼──────────────┼────────────────────┼─────────────────┤',
        '│ Q1 2027 │ $141,600     │ $143,200           │ 97.4%           │',
        '│ Q2 2027 │ $167,088     │ $169,450           │ 96.8%           │',
        '│ Q3 2027 │ $197,164     │ $195,800           │ 95.1%           │',
        '│ Q4 2027 │ $232,653     │ $238,900           │ 94.7%           │',
        '└─────────┴──────────────┴────────────────────┴─────────────────┘',
        'Execution completed in 42ms. Zero memory leaks detected.',
      ]);
      toast.success('Script executed successfully in sandbox!');
    }, 600);
  };

  const handleAICodeReview = () => {
    setOutput((prev) => [
      ...prev,
      '🔍 [Nova AI Code Review]:',
      '✔ Complexity: O(N) linear performance',
      '✔ Type safety: 100% strictly typed',
      '✔ Suggestion: Vectorize financial computation if scaling past 100,000 simulations',
    ]);
    toast.success('AI Code Quality Review completed!');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--nova-bg)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--nova-border)', background: 'var(--nova-bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <Code2 size={18} style={{ color: '#14b8a6' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--nova-text)' }}>NovaCode Studio</span>
          <span className="text-xs px-2 py-0.5 rounded-md font-mono" style={{ background: 'var(--nova-bg-tertiary)', color: 'var(--nova-text-muted)' }}>
            model_forecasting.ts
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg outline-none"
            style={{ background: 'var(--nova-bg-tertiary)', color: 'var(--nova-text)', border: '1px solid var(--nova-border)' }}
          >
            <option>TypeScript</option>
            <option>JavaScript</option>
            <option>Python</option>
            <option>SQL</option>
            <option>Rust</option>
          </select>

          <button
            onClick={handleAICodeReview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: 'var(--nova-accent-light)', color: 'var(--nova-accent)', border: '1px solid rgba(139, 92, 246, 0.3)' }}
          >
            <Sparkles size={14} /> AI Review
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
          >
            <Play size={14} fill="currentColor" /> {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Editor & Console Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Input */}
        <div className="flex-1 flex flex-col border-r" style={{ borderColor: 'var(--nova-border)' }}>
          <div className="flex items-center justify-between px-4 py-1.5 border-b text-[11px]" style={{ borderColor: 'var(--nova-border)', background: 'var(--nova-bg-secondary)', color: 'var(--nova-text-muted)' }}>
            <span>TypeScript Sandbox • ES2024 Strict Mode</span>
            <button onClick={() => { navigator.clipboard.writeText(code); toast.success('Code copied to clipboard'); }} className="hover:text-white flex items-center gap-1">
              <Copy size={12} /> Copy
            </button>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 p-4 bg-transparent outline-none font-mono text-xs leading-relaxed resize-none text-emerald-300 selection:bg-indigo-700"
            style={{ tabSize: 2 }}
          />
        </div>

        {/* Console / Terminal Output */}
        <div className="w-[420px] flex flex-col" style={{ background: '#0a0a14' }}>
          <div className="flex items-center justify-between px-4 py-2 border-b text-xs font-mono font-semibold" style={{ borderColor: 'var(--nova-border)', color: 'var(--nova-text-muted)' }}>
            <span className="flex items-center gap-1.5">
              <Terminal size={14} /> Output Console
            </span>
            <button onClick={() => setOutput(['Console cleared.'])} className="hover:text-white text-[11px]">Clear</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1.5 text-gray-300">
            {output.map((line, idx) => (
              <div key={idx} className="whitespace-pre-wrap">{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
