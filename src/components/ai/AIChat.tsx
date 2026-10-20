import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Paperclip,
  Trash2,
  Copy,
  BookOpen,
  FileText,
  Table2,
  Presentation,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';

export function AIChat() {
  const { aiMessages, addAIMessage, clearAIMessages } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');

    addAIMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      timestamp: new Date(),
    });

    setIsTyping(true);

    setTimeout(() => {
      let replyContent = '';
      const lower = userMsg.toLowerCase();

      if (lower.includes('write') || lower.includes('document')) {
        replyContent = `Here is a drafted outline ready to insert into **Word**:\n\n### Strategic Plan 2027\n1. **Objective**: Expand autonomous AI workspace adoption.\n2. **Metrics**: Accelerate document turnaround by 340%.\n3. **Data Security**: Enforce end-to-end zero-telemetry local encryption.\n\n*Click on Word in the left rail to edit this document in real time.*`;
      } else if (lower.includes('formula') || lower.includes('sheet') || lower.includes('excel')) {
        replyContent = `Here is the formula for your **Excel** workbook:\n\n\`\`\`excel\n=XLOOKUP(A2, Products!A:A, Products!B:B, 0) * (1 + GrowthRate)\n\`\`\`\n\nThis will dynamically calculate projected revenue based on your product index table.`;
      } else {
        replyContent = `I have reviewed your request regarding: "${userMsg}".\n\nAs your Copilot in SG-Office, I can:\n- 📝 Draft and refine text in **Word**\n- 📊 Generate formulas and data forecasts in **Excel**\n- 🎨 Build slide presentations in **PowerPoint**\n- 📬 Triage messages in **Outlook**\n\nWhat would you like me to create next?`;
      }

      addAIMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyContent,
        timestamp: new Date(),
      });
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-[#faf9f8] select-none text-[#201f1e]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-3.5 bg-white border-b border-[#edebe9]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg copilot-gradient flex items-center justify-center text-white shadow-xs">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#201f1e]">Microsoft Copilot</h2>
            <p className="text-xs text-[#605e5c]">Personalized AI Assistant for SG-Office 365</p>
          </div>
        </div>
        <button
          onClick={clearAIMessages}
          className="text-xs text-[#605e5c] hover:text-[#201f1e] px-3 py-1.5 rounded-md hover:bg-[#f3f2f1]"
        >
          Clear chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-4 max-w-4xl mx-auto w-full">
        {aiMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-lg copilot-gradient flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <Sparkles size={14} />
                </div>
              )}
              <div
                className={`p-4 rounded-xl max-w-[80%] text-sm leading-relaxed border shadow-xs ${
                  isUser
                    ? 'bg-[#e8f0fe] border-[#c7e0f4] text-[#185abd]'
                    : 'bg-white border-[#edebe9] text-[#201f1e]'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
                <div className="text-[10px] text-[#8a8886] mt-2 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex gap-2 items-center text-xs text-[#8a44f8]">
            <Sparkles size={14} className="animate-spin" /> Copilot is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="max-w-4xl mx-auto w-full p-6 pt-2">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[#edebe9] shadow-sm focus-within:border-[#185abd]">
          <input
            type="text"
            placeholder="Ask Copilot anything about your documents, sheets, or presentations..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            className="flex-1 px-3 py-1.5 text-xs bg-transparent outline-none text-[#201f1e]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-[#185abd] text-white hover:bg-[#106ebe] disabled:opacity-40 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
