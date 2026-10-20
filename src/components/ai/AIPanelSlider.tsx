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
  RefreshCw,
  Zap,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  queryYellaAI,
  getAIConfig,
  saveAIConfig,
  GEMINI_MODELS,
  onModelSwitch,
} from '../../services/aiService';
import toast from 'react-hot-toast';

export function AIPanelSlider() {
  const {
    toggleAIPanel,
    currentApp,
    setCurrentApp,
    aiMessages,
    addAIMessage,
    setActiveDocContent,
    setActiveDocTitle,
    setSpreadsheetData,
    setActiveSheetTitle,
    setActivePresentationTitle,
  } = useStore();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getAIConfig().apiKey || '');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'local'>(() => getAIConfig().provider || 'gemini');
  const [selectedModel, setSelectedModel] = useState<string>(() => getAIConfig().model || 'gemini-1.5-flash');
  const [currentActiveModel, setCurrentActiveModel] = useState<string>(() => getAIConfig().model || 'gemini-1.5-flash');
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to automated model failover events
  useEffect(() => {
    const unsubscribe = onModelSwitch((event) => {
      setCurrentActiveModel(event.toModel);
      setSelectedModel(event.toModel);
      toast.dismiss('model-failover');
      toast(
        `⚡ Quota failover: now using ${event.toModel}`,
        { id: 'model-failover', duration: 3000, icon: '🔄' }
      );
    });
    return unsubscribe;
  }, []);

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
        content: `Uploaded data file: "${file.name}" with ${lines.length} rows. Please analyze and apply to Excel spreadsheet.`,
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
      setActiveSheetTitle(file.name);
      setCurrentApp('spreadsheet');

      const analysisPrompt = `The user uploaded a CSV dataset named "${file.name}" with ${lines.length} rows. Headers: ${rows[0]?.join(', ')}. Provide a concise statistical breakdown and confirmation.`;
      const aiReply = await queryYellaAI(analysisPrompt, 'Spreadsheet context');

      addAIMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply || `✅ Successfully parsed **${file.name}** and mapped all ${lines.length} rows into your active **Excel** worksheet! Click below to view and chart your data.`,
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

    // 1. Live Document Generation Action
    if (
      lower.includes('document') ||
      lower.includes('write doc') ||
      lower.includes('draft proposal') ||
      lower.includes('create a policy') ||
      lower.includes('write an essay') ||
      lower.includes('contract') ||
      lower.includes('report')
    ) {
      const topic = userPrompt
        .replace(/create a document about|create a document on|write a document on|write a doc on|draft a proposal for|draft report on/gi, '')
        .trim() || 'Executive Operational Strategy';

      const docHtml = `<h1>${topic.toUpperCase()}</h1>
<p><em>Authored by Yella AI Assistant for Microsoft 365 Enterprise.</em></p>

<h2>1. Executive Summary & Vision</h2>
<p>This comprehensive document articulates the strategic architecture, governance standards, and operational workstreams for <strong>${topic}</strong>. The goal is to maximize enterprise velocity while maintaining complete data sovereignty.</p>

<h2>2. Core Workstreams & Deliverable Matrix</h2>
<table style="width:100%; border-collapse:collapse; margin:16px 0;">
  <thead>
    <tr style="background:#185abd; color:white;">
      <th style="border:1px solid #d2d0ce; padding:8px 12px; text-align:left;">Workstream</th>
      <th style="border:1px solid #d2d0ce; padding:8px 12px; text-align:left;">Objective</th>
      <th style="border:1px solid #d2d0ce; padding:8px 12px; text-align:left;">Target SLA</th>
      <th style="border:1px solid #d2d0ce; padding:8px 12px; text-align:left;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Architecture Audit</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Validate data boundaries</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">100% Verified</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;"><strong>Complete</strong></td>
    </tr>
    <tr style="background:#f8f9fa;">
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Cross-Suite Sync</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Word, Excel & Gmail bidirectional sync</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">40ms Response</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;"><strong>Active</strong></td>
    </tr>
    <tr>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Executive Rollout</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">Deploy across all department seats</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;">99.9% Uptime</td>
      <td style="border:1px solid #d2d0ce; padding:8px 12px;"><strong>Scheduled</strong></td>
    </tr>
  </tbody>
</table>

<h2>3. Risk Mitigation & Compliance</h2>
<ul>
  <li><strong>Data Sovereignty</strong>: Strict on-device boundaries prevent unauthorized telemetry.</li>
  <li><strong>Continuous Monitoring</strong>: Autonomous multi-model failover ensures zero AI disruption.</li>
  <li><strong>Audit Logging</strong>: Immutable record keeping across all enterprise document mutations.</li>
</ul>

<blockquote>"Delivering high-velocity Microsoft Office fidelity with zero compromise on privacy, performance, or AI responsiveness."</blockquote>`;

      setActiveDocTitle(`${topic}.docx`);
      setActiveDocContent(docHtml);
      setCurrentApp('document');
      toast.success('Generated document and opened in Word!');
    }
    // 2. Live Spreadsheet / Financial Model Action
    else if (
      lower.includes('spreadsheet') ||
      lower.includes('excel') ||
      lower.includes('budget') ||
      lower.includes('financial') ||
      lower.includes('sales data') ||
      lower.includes('expense')
    ) {
      const customSheet: Record<string, string> = {
        'A1': 'Product / Service', 'B1': 'Category', 'C1': 'Unit Price ($)', 'D1': 'Units Sold', 'E1': 'Gross Revenue ($)', 'F1': 'COGS ($)', 'G1': 'Net Profit ($)', 'H1': 'Profit Margin',
        'A2': 'Cloud Infrastructure Pro', 'B2': 'Cloud Services', 'C2': '120', 'D2': '450', 'E2': '=C2*D2', 'F2': '=E2*0.35', 'G2': '=E2-F2', 'H2': '=G2/E2',
        'A3': 'AI Assistant Annual Pass', 'B3': 'AI & ML', 'C3': '240', 'D3': '320', 'E3': '=C3*D3', 'F3': '=E3*0.25', 'G3': '=E3-F3', 'H3': '=G3/E3',
        'A4': 'Security Compliance Suite', 'B4': 'Cybersecurity', 'C4': '500', 'D4': '85', 'E4': '=C4*D4', 'F4': '=E4*0.30', 'G4': '=E4-F4', 'H4': '=G4/E4',
        'A5': 'Developer API Compute', 'B5': 'Developer Tools', 'C5': '50', 'D5': '920', 'E5': '=C5*D5', 'F5': '=E5*0.40', 'G5': '=E5-F5', 'H5': '=G5/E5',
        'A6': 'Enterprise Dedicated Support', 'B6': 'Consulting', 'C6': '800', 'D6': '40', 'E6': '=C6*D6', 'F6': '=E6*0.45', 'G6': '=E6-F6', 'H6': '=G6/E6',
        'A7': '', 'B7': '', 'C7': '', 'D7': '', 'E7': '', 'F7': '', 'G7': '', 'H7': '',
        'A8': 'Total / Summary', 'B8': '5 Active Offerings', 'C8': '=AVERAGE(C2:C6)', 'D8': '=SUM(D2:D6)', 'E8': '=SUM(E2:E6)', 'F8': '=SUM(F2:F6)', 'G8': '=SUM(G2:G6)', 'H8': '=AVERAGE(H2:H6)',
      };
      setSpreadsheetData(customSheet);
      setActiveSheetTitle('Financial Model & Revenue Projections.xlsx');
      setCurrentApp('spreadsheet');
      toast.success('Generated financial model in Excel!');
    }
    // 3. Live Presentation Action
    else if (
      lower.includes('presentation') ||
      lower.includes('slide') ||
      lower.includes('pitch deck') ||
      lower.includes('powerpoint')
    ) {
      setCurrentApp('presentation');
      toast.success('Opened PowerPoint Studio with executive layouts!');
    }

    // Call Yella AI Service (Gemini cascade / Local Engine)
    const contextStr = `Current workspace application: ${currentApp ? currentApp.toUpperCase() : 'MICROSOFT 365 SUITE'}`;
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
    <div className="fixed top-0 right-0 h-full w-[380px] z-50 flex flex-col bg-white shadow-2xl border-l border-[#edebe9] animate-slide-in select-none text-[#201f1e]">
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
            <h3 className="font-bold text-xs flex items-center gap-1.5 text-[#201f1e]">
              <span>Yella AI</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700">
                M365 Copilot
              </span>
            </h3>
            <p className="text-[10px] text-[#605e5c] truncate">
              Model: <span className="font-mono text-purple-700">{currentActiveModel}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowKeyModal(true)}
            className="p-1 hover:bg-[#edebe9] rounded text-purple-700"
            title="AI Model & Key Settings"
          >
            <Key size={14} />
          </button>
          <button
            onClick={toggleAIPanel}
            className="p-1 hover:bg-[#edebe9] rounded text-[#605e5c]"
            title="Close Copilot"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Active Model & Sovereign Status Bar */}
      <div className="px-3 py-1.5 bg-[#fbf9fe] border-b border-[#edebe9] flex items-center justify-between text-[11px]">
        <span className="text-[#605e5c] flex items-center gap-1">
          <ShieldCheck size={12} className="text-emerald-600" />
          <span>Sovereign Engine Active</span>
        </span>
        <button
          onClick={() => setShowKeyModal(true)}
          className="text-[10px] text-purple-700 font-semibold hover:underline"
        >
          {apiKeyInput ? 'Change Key' : '+ Connect API Key'}
        </button>
      </div>

      {/* Quick Launch App Pills */}
      <div className="px-3 py-2 bg-white border-b border-[#edebe9] flex items-center justify-between gap-1 text-[11px]">
        <button
          onClick={() => setCurrentApp('document')}
          className={`flex-1 py-1 rounded font-semibold text-center border transition-all ${
            currentApp === 'document' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          📄 Word
        </button>
        <button
          onClick={() => setCurrentApp('spreadsheet')}
          className={`flex-1 py-1 rounded font-semibold text-center border transition-all ${
            currentApp === 'spreadsheet' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          📊 Excel
        </button>
        <button
          onClick={() => setCurrentApp('presentation')}
          className={`flex-1 py-1 rounded font-semibold text-center border transition-all ${
            currentApp === 'presentation' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          🎨 PowerPoint
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#faf9f8]">
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
                className={`p-3 rounded-xl max-w-[90%] text-xs leading-relaxed border shadow-2xs ${
                  isUser
                    ? 'bg-[#e8f0fe] border-[#c7e0f4] text-[#185abd]'
                    : 'bg-white border-[#edebe9] text-[#201f1e]'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Direct Action Buttons for Assistant */}
                {!isUser && (
                  <div className="pt-2 mt-2 border-t border-gray-100 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setCurrentApp('document')}
                      className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-[#185abd] rounded font-bold text-[10px] flex items-center gap-1"
                    >
                      <FileText size={10} /> Open in Word
                    </button>
                    <button
                      onClick={() => setCurrentApp('spreadsheet')}
                      className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-[#107c41] rounded font-bold text-[10px] flex items-center gap-1"
                    >
                      <Table2 size={10} /> Open in Excel
                    </button>
                    <button
                      onClick={() => setCurrentApp('presentation')}
                      className="px-2 py-0.5 bg-orange-50 hover:bg-orange-100 text-[#c43e1c] rounded font-bold text-[10px] flex items-center gap-1"
                    >
                      <Presentation size={10} /> Open in PowerPoint
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-purple-700 font-semibold p-2 bg-purple-50 rounded-lg">
            <Sparkles size={14} className="animate-spin text-purple-600" />
            <span>Yella is thinking and drafting your content...</span>
          </div>
        )}
      </div>

      {/* Prompt Input Box */}
      <div className="p-3 bg-white border-t border-[#edebe9] space-y-2">
        <div className="flex items-center gap-1.5 p-1 bg-[#f3f2f1] rounded-lg border border-[#edebe9] focus-within:bg-white focus-within:border-purple-600">
          <input
            type="text"
            placeholder="e.g. 'Create a document on AI', 'Build a budget'..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSendPrompt(); }}
            className="flex-1 px-2 text-xs bg-transparent outline-none text-[#201f1e]"
          />
          <button
            onClick={handleSendPrompt}
            disabled={!prompt.trim() || isGenerating}
            className="p-1.5 rounded bg-gradient-to-r from-purple-600 to-indigo-600 text-white disabled:opacity-40 hover:opacity-90 transition-transform active:scale-95"
          >
            <Send size={13} />
          </button>
        </div>
        <div className="flex justify-between items-center text-[10px] text-[#8a8886]">
          <button
            onClick={() => csvInputRef.current?.click()}
            className="hover:text-emerald-700 flex items-center gap-1 text-[#107c41] font-bold"
          >
            <Upload size={11} /> Upload CSV/Dataset
          </button>
          <span>Context: {currentApp ? currentApp.toUpperCase() : 'MICROSOFT 365'}</span>
        </div>
      </div>

      {/* API Key Modal */}
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
              Enter your Google Gemini or OpenAI API Key to give Yella live web intelligence with automatic quota protection:
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
                  <label className="text-[10px] text-[#8a8886] block">Default Starting Model:</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full text-xs px-2 py-1 border border-[#d2d0ce] rounded outline-none"
                  >
                    {GEMINI_MODELS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#edebe9]">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-3 py-1 text-xs text-[#605e5c] hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="px-4 py-1 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded hover:opacity-90"
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
