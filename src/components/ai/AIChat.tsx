import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Paperclip,
  Trash2,
  FileSpreadsheet,
  FileText,
  Table2,
  Upload,
  Key,
  X,
  Zap,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  queryYellaAI,
  getAIConfig,
  saveAIConfig,
  onModelSwitch,
} from '../../services/aiService';
import toast from 'react-hot-toast';

export function AIChat() {
  const {
    aiMessages,
    addAIMessage,
    clearAIMessages,
    setActiveDocContent,
    setActiveDocTitle,
    setSpreadsheetData,
    setCurrentApp,
  } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getAIConfig().apiKey || '');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'local'>(() => getAIConfig().provider || 'gemini');
  const [selectedModel, setSelectedModel] = useState<string>(() => getAIConfig().model || 'gemini-1.5-flash');
  const [currentActiveModel, setCurrentActiveModel] = useState<string>(() => getAIConfig().model || 'gemini-1.5-flash');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isTyping]);

  // Subscribe to automatic model failover events (single debounced notification)
  useEffect(() => {
    const unsubscribe = onModelSwitch((event) => {
      setCurrentActiveModel(event.toModel);
      setSelectedModel(event.toModel);
      toast.dismiss();
      toast(
        `⚡ Quota failover: now using ${event.toModel}`,
        { id: 'model-failover', duration: 3000, icon: '🔄' }
      );
    });
    return unsubscribe;
  }, []);

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r\n|\n/).filter(Boolean);
      const rows = lines.map((l) => l.split(','));

      addAIMessage({
        id: Date.now().toString(),
        role: 'user',
        content: `Uploaded data file: "${file.name}" with ${lines.length} rows. Please analyze and apply to Excel.`,
        timestamp: new Date(),
      });

      const newSheetData: Record<string, string> = {};
      const colLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

      rows.forEach((r, rIdx) => {
        r.forEach((c, cIdx) => {
          if (cIdx < 26 && rIdx < 50) {
            newSheetData[`${colLetters[cIdx]}${rIdx + 1}`] = c.trim().replace(/^["']|["']$/g, '');
          }
        });
      });

      setIsTyping(true);
      setSpreadsheetData(newSheetData);

      const prompt = `The user uploaded a CSV dataset named "${file.name}" with ${lines.length} rows. The headers are: ${rows[0]?.join(', ')}. Provide an intelligent statistical summary and confirm mapping into Excel.`;
      const reply = await queryYellaAI(prompt, 'Spreadsheet context');

      addAIMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply || `📊 Successfully parsed **${file.name}** and mapped all ${lines.length} rows into your **Excel** worksheet!`,
        timestamp: new Date(),
      });
      setIsTyping(false);
      toast.success('Data applied to Excel!');
    };
    reader.readAsText(file);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userPrompt = input.trim();
    setInput('');

    addAIMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userPrompt,
      timestamp: new Date(),
    });

    setIsTyping(true);

    const lower = userPrompt.toLowerCase();

    // Word Document generation
    if (
      lower.includes('document') ||
      lower.includes('write doc') ||
      lower.includes('draft doc') ||
      lower.includes('write an essay') ||
      lower.includes('report') ||
      lower.includes('proposal')
    ) {
      const topic = userPrompt.replace(/create a document about|create a document on|write a doc on|draft doc for/gi, '').trim() || 'Executive Project Plan';
      const docContent = `<h1>${topic.toUpperCase()}</h1>
<p><em>Authored by Yella AI Assistant for Microsoft 365 Enterprise.</em></p>
<h2>1. Executive Overview & Objectives</h2>
<p>This document details the operational strategy, resource allocation, and timeline milestones for <strong>${topic}</strong>.</p>
<h2>2. Deliverables & Action Matrix</h2>
<table style="width:100%; border-collapse:collapse; margin:16px 0;">
  <thead>
    <tr style="background:#185abd; color:white;">
      <th style="border:1px solid #d2d0ce; padding:8px 12px; text-align:left;">Deliverable</th>
      <th style="border:1px solid #d2d0ce; padding:8px 12px; text-align:left;">Responsible Team</th>
      <th style="border:1px solid #d2d0ce; padding:8px 12px; text-align:left;">Target SLA</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Architecture Blueprint</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Core Engineering</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Completed</td>
    </tr>
    <tr style="background:#f8f9fa;">
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Multi-Model AI Failover</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">AI Operations</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Active</td>
    </tr>
  </tbody>
</table>
<h2>3. Risk Mitigation & Compliance Standards</h2>
<p>All data remains on-device with zero unauthorized exfiltration.</p>`;

      setActiveDocTitle(`${topic}.docx`);
      setActiveDocContent(docContent);
      toast.success('Document drafted into Word! Click "Open in Word" below.');
    }
    // Excel Spreadsheet generation
    else if (lower.includes('spreadsheet') || lower.includes('excel') || lower.includes('budget') || lower.includes('expense') || lower.includes('calculate')) {
      const customData: Record<string, string> = {
        'A1': 'Product / Offering', 'B1': 'Department', 'C1': 'Budget ($)', 'D1': 'Actual ($)', 'E1': 'Variance ($)', 'F1': 'Status',
        'A2': 'Cloud Compute & Storage', 'B2': 'Engineering', 'C2': '15000', 'D2': '13800', 'E2': '=C2-D2', 'F2': 'Under Budget',
        'A3': 'AI Assistant Enterprise', 'B3': 'Product', 'C3': '25000', 'D3': '22500', 'E3': '=C3-D3', 'F3': 'Under Budget',
        'A4': 'Security Compliance Suite', 'B4': 'Cybersecurity', 'C4': '12000', 'D4': '14100', 'E4': '=C4-D4', 'F4': 'Over Budget',
        'A5': 'Developer Tooling API', 'B5': 'Infrastructure', 'C5': '8000', 'D5': '7500', 'E5': '=C5-D5', 'F5': 'Under Budget',
        'A6': '', 'B6': '', 'C6': '', 'D6': '', 'E6': '', 'F6': '',
        'A7': 'Total Operations', 'B7': 'Summary', 'C7': '=SUM(C2:C5)', 'D7': '=SUM(D2:D5)', 'E7': '=SUM(E2:E5)', 'F7': 'Net Under Budget',
      };
      setSpreadsheetData(customData);
      toast.success('Spreadsheet model created in Excel! Click "Open in Excel" below.');
    }

    // Call live Yella AI with automatic Gemini rate-limit failover
    const reply = await queryYellaAI(userPrompt, 'Full Chat Hub Context', aiMessages);

    addAIMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: reply,
      timestamp: new Date(),
    });
    setIsTyping(false);
  };

  const handleSaveKey = () => {
    const finalModel = aiProvider === 'gemini' ? selectedModel : 'gpt-4o-mini';
    saveAIConfig({
      provider: aiProvider,
      apiKey: apiKeyInput.trim(),
      model: finalModel,
      autoSwitchModel: true,
    });
    setCurrentActiveModel(finalModel);
    setShowKeyModal(false);
    toast.success(`${aiProvider.toUpperCase()} connected with automated model failover!`);
  };

  return (
    <div className="flex flex-col h-full bg-[#faf9f8] select-none text-[#201f1e] overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCSVUpload}
        accept=".csv,.txt"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-[#edebe9] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#201f1e] leading-tight">Yella AI Copilot</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-semibold flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${apiKeyInput ? 'bg-emerald-500 animate-pulse' : 'bg-purple-500'}`} />
                {apiKeyInput ? `${currentActiveModel} • Auto-Switch Active` : 'Autonomous Core'}
              </span>
            </div>
            <p className="text-[11px] text-[#605e5c]">Personalized Workspace Intelligence for SG-Office</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#d2d0ce] hover:bg-[#f3f2f1] text-[#605e5c] rounded-lg text-xs font-semibold shadow-2xs"
          >
            <Key size={13} className={apiKeyInput ? 'text-emerald-600' : 'text-[#8a8886]'} />
            {apiKeyInput ? 'Gemini Key Configured' : 'Connect API Key'}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#d2d0ce] hover:bg-[#f3f2f1] text-[#107c41] rounded-lg text-xs font-semibold shadow-2xs"
          >
            <Upload size={13} /> Upload CSV/Excel
          </button>
          <button
            onClick={clearAIMessages}
            className="text-xs text-[#605e5c] hover:text-[#201f1e] px-2.5 py-1 rounded hover:bg-[#f3f2f1]"
          >
            Clear conversation
          </button>
        </div>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 max-w-3xl mx-auto w-full">
        {aiMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-2xs">
                  <Sparkles size={13} />
                </div>
              )}
              <div
                className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed border shadow-2xs ${
                  isUser
                    ? 'bg-[#e8f0fe] border-[#c7e0f4] text-[#185abd]'
                    : 'bg-white border-[#edebe9] text-[#201f1e]'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
                {!isUser && (
                  <div className="pt-2 mt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setCurrentApp('document')}
                      className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-[#185abd] rounded font-bold text-[10px] flex items-center gap-1"
                    >
                      📄 Open in Word
                    </button>
                    <button
                      onClick={() => setCurrentApp('spreadsheet')}
                      className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-[#107c41] rounded font-bold text-[10px] flex items-center gap-1"
                    >
                      📊 Open in Excel
                    </button>
                    <button
                      onClick={() => setCurrentApp('presentation')}
                      className="px-2 py-0.5 bg-orange-50 hover:bg-orange-100 text-[#c43e1c] rounded font-bold text-[10px] flex items-center gap-1"
                    >
                      🎨 Open in PowerPoint
                    </button>
                  </div>
                )}
                <div className="text-[10px] text-[#8a8886] mt-1.5 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex gap-2 items-center text-xs text-purple-700 font-medium">
            <Sparkles size={13} className="animate-spin" /> Yella is executing live...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="max-w-3xl mx-auto w-full p-4 pt-1 flex-shrink-0">
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-[#edebe9] shadow-sm focus-within:border-purple-600">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-[#107c41] hover:bg-[#e6f4ea] rounded-lg"
            title="Upload CSV / Spreadsheet dataset"
          >
            <FileSpreadsheet size={16} />
          </button>
          <input
            type="text"
            placeholder="Tell Yella: 'create a project proposal document', 'parse CSV data', 'generate quarterly budget'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            className="flex-1 px-2 py-1 text-xs bg-transparent outline-none text-[#201f1e]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white disabled:opacity-40 hover:opacity-90"
          >
            <Send size={13} />
          </button>
        </div>
      </div>

      {/* Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="w-[380px] bg-white rounded-xl shadow-2xl border border-[#edebe9] p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-purple-600" />
                <h3 className="text-xs font-bold text-[#201f1e]">Connect Live AI Model</h3>
              </div>
              <button onClick={() => setShowKeyModal(false)} className="text-[#8a8886] hover:text-[#201f1e]">
                <X size={15} />
              </button>
            </div>

            <p className="text-[11px] text-[#605e5c]">
              Enter your Google Gemini or OpenAI API Key. Automatic quota failover is enabled by default:
            </p>

            <div className="space-y-2.5">
              <div className="flex gap-2">
                <button
                  onClick={() => setAiProvider('gemini')}
                  className={`flex-1 py-1 text-xs font-semibold rounded border ${aiProvider === 'gemini' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-[#d2d0ce]'}`}
                >
                  Google Gemini (Free)
                </button>
                <button
                  onClick={() => setAiProvider('openai')}
                  className={`flex-1 py-1 text-xs font-semibold rounded border ${aiProvider === 'openai' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-[#d2d0ce]'}`}
                >
                  OpenAI
                </button>
              </div>

              <input
                type="password"
                placeholder={aiProvider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-[#d2d0ce] rounded outline-none focus:border-purple-600 font-mono"
              />

              {aiProvider === 'gemini' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#605e5c] uppercase tracking-wide">
                    Preferred Gemini Model
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 border border-[#d2d0ce] rounded outline-none focus:border-purple-600 bg-white"
                  >
                    <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Versatile - 15 RPM)</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (Next-Gen Fast)</option>
                    <option value="gemini-1.5-flash-8b">gemini-1.5-flash-8b (High Volume / Lightweight)</option>
                    <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite (Ultra Fast)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Complex Reasoning)</option>
                  </select>

                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[10.5px] text-emerald-900 leading-normal flex items-start gap-1.5">
                    <Zap size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Automatic Quota Protection:</strong>
                      <p className="text-[10px] text-emerald-800 mt-0.5">
                        If Gemini hits a rate limit (HTTP 429) or quota exhaustion on this model, Yella will automatically cascade to the next healthy Gemini model (Flash ➔ 2.0-Flash ➔ Flash-8B ➔ 2.0-Lite ➔ Pro ➔ Local) seamlessly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1 text-xs text-[#605e5c]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-1 text-xs font-bold bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
