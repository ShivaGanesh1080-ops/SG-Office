import { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Wand2,
  BookOpen,
  Languages,
  CheckCircle2,
  Bot,
  User,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

export function AIPanelSlider() {
  const { toggleAIPanel, currentApp, aiMessages, addAIMessage } = useStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleQuickAction = (actionTitle: string) => {
    setIsGenerating(true);
    addAIMessage({
      id: Date.now().toString(),
      role: 'user',
      content: `${actionTitle} in ${currentApp ? currentApp.toUpperCase() : 'Document'}`,
      timestamp: new Date(),
    });

    setTimeout(() => {
      let output = '';
      if (actionTitle.includes('Rewrite')) {
        output = 'I refined your selection with clear professional tone, active voice, and improved structure:\n\n"In Q4 2026, the enterprise successfully integrated the SG-Office 365 suite, accelerating team productivity by 340% while preserving strict zero-telemetry data sovereignty."';
      } else if (actionTitle.includes('Summarize')) {
        output = '📌 **Document Summary:**\n- **Objective:** Deploy SG-Office 365 across corporate divisions.\n- **Primary Metric:** 340% draft acceleration, 99.4% formula accuracy.\n- **Recommendation:** Proceed with full production rollout.';
      } else {
        output = `Completed: ${actionTitle}.\nI have analyzed your document context and synchronized the updates.`;
      }

      addAIMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: output,
        timestamp: new Date(),
      });
      setIsGenerating(false);
      toast.success('Copilot completed action');
    }, 600);
  };

  const handleSendPrompt = () => {
    if (!prompt.trim()) return;
    const p = prompt;
    setPrompt('');
    setIsGenerating(true);

    addAIMessage({
      id: Date.now().toString(),
      role: 'user',
      content: p,
      timestamp: new Date(),
    });

    setTimeout(() => {
      addAIMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed your document regarding "${p}". Here are the suggested edits, calculations, and content blocks ready to apply.`,
        timestamp: new Date(),
      });
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="fixed top-0 right-0 h-full w-[380px] z-50 flex flex-col bg-white shadow-2xl border-l border-[#edebe9] animate-slide-in select-none text-[#201f1e]">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#edebe9] bg-[#faf9f8]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md copilot-gradient flex items-center justify-center text-white shadow-xs">
            <Sparkles size={13} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#201f1e] leading-none">Copilot</h3>
            <span className="text-[10px] text-[#8a8886] leading-none">for Microsoft 365</span>
          </div>
        </div>
        <button
          onClick={toggleAIPanel}
          className="p-1 rounded hover:bg-[#edebe9] text-[#605e5c]"
          title="Close Copilot"
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. Context bar */}
      <div className="px-5 py-2 bg-[#f3f2f1] border-b border-[#edebe9] flex items-center justify-between text-[11px] text-[#605e5c]">
        <span>Working on: <strong>{currentApp ? currentApp.toUpperCase() : 'SG-Office'}</strong></span>
        <span className="text-[10px] text-[#107c41] font-semibold">● Grounded in your files</span>
      </div>

      {/* 3. Suggested Action Chips */}
      <div className="p-4 border-b border-[#edebe9] space-y-2 bg-white">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a8886]">Suggestions</span>
        <div className="flex flex-wrap gap-1.5">
          {[
            'Rewrite text',
            'Summarize document',
            'Suggest formulas',
            'Create presentation',
          ].map((act) => (
            <button
              key={act}
              onClick={() => handleQuickAction(act)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f3f2f1] hover:bg-[#edebe9] text-[#201f1e] border border-[#edebe9] transition-colors"
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Chat Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf9f8]">
        {aiMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-6 h-6 rounded-md copilot-gradient flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <Sparkles size={12} />
                </div>
              )}
              <div
                className={`p-3 rounded-lg max-w-[85%] text-xs leading-relaxed border shadow-xs ${
                  isUser
                    ? 'bg-[#e8f0fe] border-[#c7e0f4] text-[#185abd]'
                    : 'bg-white border-[#edebe9] text-[#201f1e]'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
              </div>
            </div>
          );
        })}
        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-[#8a44f8]">
            <Sparkles size={14} className="animate-spin" /> Copilot is drafting...
          </div>
        )}
      </div>

      {/* 5. Prompt Input Bar */}
      <div className="p-3 bg-white border-t border-[#edebe9]">
        <div className="flex items-center gap-2 p-1.5 bg-[#f3f2f1] rounded-lg border border-[#edebe9] focus-within:border-[#185abd] focus-within:bg-white">
          <input
            type="text"
            placeholder="Ask Copilot, write text, calculate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendPrompt(); }}
            className="flex-1 px-2 text-xs bg-transparent outline-none text-[#201f1e]"
          />
          <button
            onClick={handleSendPrompt}
            disabled={!prompt.trim()}
            className="p-1.5 rounded-md text-[#185abd] hover:bg-[#e8f0fe] disabled:opacity-40"
          >
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-[#8a8886] text-center mt-1.5">
          AI generated content may contain inaccuracies.
        </p>
      </div>
    </div>
  );
}
