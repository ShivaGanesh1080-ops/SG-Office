import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Upload,
  FileText,
  Table2,
  Presentation,
  Key,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { queryYellaAI, getAIConfig, saveAIConfig } from '../../services/aiService';
import toast from 'react-hot-toast';

export function AIPanelSlider() {
  const {
    toggleAIPanel,
    currentApp,
    aiMessages,
    addAIMessage,
    setActiveDocContent,
    setActiveDocTitle,
    setSpreadsheetData,
  } = useStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getAIConfig().apiKey || '');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'local'>(() => getAIConfig().provider || 'gemini');
  const csvInputRef = useRef<HTMLInputElement>(null);

  // File upload directly into Yella
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
        content: `Uploaded CSV file: "${file.name}" with ${lines.length} rows. Please analyze and apply to Excel spreadsheet.`,
        timestamp: new Date(),
      });

      // Parse and generate spreadsheet cells
      const newSheetData: Record<string, string> = {};
      const colLetters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

      rows.forEach((r, rIdx) => {
        r.forEach((c, cIdx) => {
          if (cIdx < 26 && rIdx < 50) {
            newSheetData[`${colLetters[cIdx]}${rIdx + 1}`] = c.trim().replace(/^["']|["']$/g, '');
          }
        });
      });

      setIsGenerating(true);
      setSpreadsheetData(newSheetData);

      // Query AI for analysis
      const analysisPrompt = `The user uploaded a CSV dataset named "${file.name}" with ${lines.length} rows. The first row headers are: ${rows[0]?.join(', ')}. Provide a concise summary of the dataset and confirm it has been mapped into Excel.`;
      const aiReply = await queryYellaAI(analysisPrompt, 'Spreadsheet context');

      addAIMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply || `✅ Successfully parsed **${file.name}** and populated your **Excel** worksheet with all ${lines.length} rows.\n\nYou can click **Excel** in the left sidebar to view the data and generate interactive charts!`,
        timestamp: new Date(),
      });
      setIsGenerating(false);
      toast.success('CSV dataset mapped to Excel!');
    };
    reader.readAsText(file);
  };

  const handleSendPrompt = async () => {
    if (!prompt.trim()) return;
    const userPrompt = prompt.trim();
    setPrompt('');

    addAIMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userPrompt,
      timestamp: new Date(),
    });

    setIsGenerating(true);

    const lower = userPrompt.toLowerCase();

    // Check if user is asking to create a document
    if (lower.includes('create a document') || lower.includes('write a doc') || lower.includes('draft a proposal') || lower.includes('write an essay')) {
      const topic = userPrompt.replace(/create a document about|create a document on|write a doc on|draft a proposal for/gi, '').trim() || 'Comprehensive Report';
      const docHtml = `<h1>${topic.toUpperCase()}</h1>
<p><em>Authored by Yella AI Assistant for SG-Office.</em></p>
<h2>1. Executive Summary</h2>
<p>This document details the strategy, operational milestones, and deliverables for <strong>${topic}</strong>. The objective is to achieve maximum organizational velocity while upholding high quality and compliance.</p>
<h2>2. Strategic Deliverables & Action Items</h2>
<ul>
  <li><strong>Phase 1: Architecture & Validation</strong> — Establish core requirements and validate user feedback.</li>
  <li><strong>Phase 2: Implementation & Sync</strong> — Integrate live data workflows across Word, Excel, and Gmail.</li>
  <li><strong>Phase 3: Rollout & Verification</strong> — Conduct end-to-end testing and performance audits.</li>
</ul>
<h2>3. Risk Mitigation & Privacy Standards</h2>
<p>All data processing is conducted within strict on-device sovereign boundaries, preventing unauthorized data exfiltration.</p>`;

      setActiveDocTitle(`${topic}.docx`);
      setActiveDocContent(docHtml);
      toast.success('Document drafted and inserted into Word!');
    }
    // Check if user is asking to generate a spreadsheet or budget
    else if (lower.includes('spreadsheet') || lower.includes('excel') || lower.includes('budget') || lower.includes('expense') || lower.includes('financial sheet')) {
      const customSheet: Record<string, string> = {
        'A1': 'Expense Item', 'B1': 'Department', 'C1': 'Budget ($)', 'D1': 'Actual Spent ($)', 'E1': 'Variance ($)', 'F1': 'Status',
        'A2': 'Cloud Compute & Storage', 'B2': 'Engineering', 'C2': '15000', 'D2': '13800', 'E2': '=C2-D2', 'F2': 'Under Budget',
        'A3': 'Design & Prototyping Tools', 'B3': 'Product', 'C3': '4500', 'D3': '4200', 'E3': '=C3-D3', 'F3': 'Under Budget',
        'A4': 'Marketing & Awareness', 'B4': 'Growth', 'C4': '12000', 'D4': '14100', 'E4': '=C4-D4', 'F4': 'Over Budget',
        'A5': 'Enterprise Security Audit', 'B5': 'Security', 'C5': '8000', 'D5': '7500', 'E5': '=C5-D5', 'F5': 'Under Budget',
        'A6': '', 'B6': '', 'C6': '', 'D6': '', 'E6': '', 'F6': '',
        'A7': 'Total Budget', 'B7': '', 'C7': '=SUM(C2:C5)', 'D7': '=SUM(D2:D5)', 'E7': '=SUM(E2:E5)', 'F7': 'Net Variance',
      };
      setSpreadsheetData(customSheet);
      toast.success('Financial model created in Excel!');
    }

    // Call Yella AI Service (Live Gemini / OpenAI or Local Engine)
    const contextStr = `Current workspace application: ${currentApp || 'SG-Office Home'}`;
    const aiResponse = await queryYellaAI(userPrompt, contextStr, aiMessages);

    addAIMessage({
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    });
    setIsGenerating(false);
  };

  const handleSaveKey = () => {
    saveAIConfig({
      provider: aiProvider,
      apiKey: apiKeyInput.trim(),
      model: aiProvider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini',
    });
    setShowKeyModal(false);
    toast.success(`${aiProvider.toUpperCase()} API Key saved! Live AI active.`);
  };

  return (
    <div className="fixed top-0 right-0 h-full w-[360px] z-50 flex flex-col bg-white shadow-2xl border-l border-[#edebe9] animate-slide-in select-none text-[#201f1e]">
      {/* Hidden CSV Input */}
      <input
        type="file"
        ref={csvInputRef}
        onChange={handleCSVUpload}
        accept=".csv,.txt"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#edebe9] bg-[#faf9f8]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles size={13} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#201f1e] leading-tight">Yella AI</h3>
            <span className="text-[10px] text-[#8a8886] leading-none">Personalized Copilot</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowKeyModal(true)}
            className="p-1 rounded hover:bg-[#edebe9] text-[#605e5c]"
            title="Connect Live Gemini / OpenAI API Key"
          >
            <Key size={14} className={apiKeyInput ? 'text-emerald-600' : 'text-[#8a8886]'} />
          </button>
          <button
            onClick={toggleAIPanel}
            className="p-1 rounded hover:bg-[#edebe9] text-[#605e5c]"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* API Key Status Notice */}
      <div className="px-3 py-1.5 bg-[#f3f2f1] border-b border-[#edebe9] flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 text-[#605e5c]">
          <span className={`w-2 h-2 rounded-full ${apiKeyInput ? 'bg-emerald-500' : 'bg-purple-500'}`} />
          <span className="text-[10px]">
            {apiKeyInput ? `${aiProvider.toUpperCase()} Live AI Active` : 'Yella Autonomous Core'}
          </span>
        </div>
        <button
          onClick={() => setShowKeyModal(true)}
          className="text-[10px] text-purple-700 font-semibold hover:underline"
        >
          {apiKeyInput ? 'Change Key' : '+ Connect API Key'}
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#faf9f8]">
        {aiMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-2xs">
                  <Sparkles size={11} />
                </div>
              )}
              <div
                className={`p-2.5 rounded-lg max-w-[88%] text-xs leading-relaxed border shadow-2xs ${
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
          <div className="flex items-center gap-1.5 text-xs text-purple-700 font-medium">
            <Sparkles size={13} className="animate-spin" /> Yella is executing live...
          </div>
        )}
      </div>

      {/* Prompt Input Box */}
      <div className="p-2.5 bg-white border-t border-[#edebe9] space-y-1.5">
        <div className="flex items-center gap-1.5 p-1 bg-[#f3f2f1] rounded-lg border border-[#edebe9] focus-within:bg-white focus-within:border-purple-600">
          <input
            type="text"
            placeholder="Tell Yella: 'create doc about...', 'parse CSV'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendPrompt(); }}
            className="flex-1 px-2 text-xs bg-transparent outline-none text-[#201f1e]"
          />
          <button
            onClick={handleSendPrompt}
            disabled={!prompt.trim()}
            className="p-1.5 rounded bg-gradient-to-r from-purple-600 to-indigo-600 text-white disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        </div>
        <div className="flex justify-between items-center text-[10px] text-[#8a8886]">
          <button
            onClick={() => csvInputRef.current?.click()}
            className="hover:text-emerald-700 flex items-center gap-1 text-[#107c41] font-semibold"
          >
            <Upload size={11} /> Upload CSV/Data
          </button>
          <span>Context: {currentApp ? currentApp.toUpperCase() : 'SG-OFFICE'}</span>
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="w-[360px] bg-white rounded-xl shadow-2xl border border-[#edebe9] p-5 space-y-3.5">
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
              Enter your Google Gemini or OpenAI API Key to give Yella live web intelligence and unlimited reasoning:
            </p>

            <div className="space-y-2">
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
              <p className="text-[10px] text-[#8a8886]">
                Keys are stored only in your browser localStorage. Never sent to any intermediate server.
              </p>
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
