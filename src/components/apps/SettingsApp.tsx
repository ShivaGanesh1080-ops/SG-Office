import { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Shield,
  Palette,
  Cpu,
  Key,
  HardDrive,
  User,
  Bell,
  CheckCircle2,
  Lock,
  Zap,
  RefreshCw,
  Layers,
} from 'lucide-react';
import {
  getAIConfig,
  saveAIConfig,
  GEMINI_MODELS,
  onModelSwitch,
} from '../../services/aiService';
import toast from 'react-hot-toast';

export function SettingsApp() {
  const [activeTab, setActiveTab] = useState<'ai' | 'account' | 'security' | 'storage'>('ai');
  const [apiKey, setApiKey] = useState(() => getAIConfig().apiKey || '');
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'local'>(() => getAIConfig().provider || 'gemini');
  const [selectedModel, setSelectedModel] = useState<string>(() => getAIConfig().model || 'gemini-1.5-flash');
  const [currentActiveModel, setCurrentActiveModel] = useState<string>(() => getAIConfig().model || 'gemini-1.5-flash');
  const [zeroTelemetry, setZeroTelemetry] = useState(true);
  const [crossDocMemory, setCrossDocMemory] = useState(true);

  useEffect(() => {
    const unsubscribe = onModelSwitch((event) => {
      setCurrentActiveModel(event.toModel);
      setSelectedModel(event.toModel);
    });
    return unsubscribe;
  }, []);

  const handleSaveAISettings = () => {
    saveAIConfig({
      provider,
      apiKey: apiKey.trim(),
      model: selectedModel,
      autoSwitchModel: true,
    });
    setCurrentActiveModel(selectedModel);
    toast.success('AI configuration saved! Automatic quota failover is active.');
  };

  const tabs = [
    { id: 'ai', label: 'Yella AI & Multi-Model Engine', icon: <Sparkles size={16} /> },
    { id: 'security', label: 'Security & Sovereignty', icon: <Shield size={16} /> },
    { id: 'storage', label: 'Storage & Sync', icon: <HardDrive size={16} /> },
    { id: 'account', label: 'Personalization & Workspace', icon: <User size={16} /> },
  ];

  return (
    <div className="flex h-full bg-[#f3f2f1] text-[#201f1e] select-none">
      {/* Settings Navigation */}
      <div className="w-[240px] border-r border-[#edebe9] bg-white p-4 space-y-1.5 flex-shrink-0">
        <div className="flex items-center gap-2 mb-4 px-2">
          <Settings size={18} className="text-[#0078d4]" />
          <h2 className="text-sm font-bold text-[#201f1e]">Office Settings</h2>
        </div>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-[#e8f0fe] text-[#185abd]'
                : 'text-[#605e5c] hover:bg-[#f3f2f1]'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Body */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#201f1e]">Yella AI & Automated Model Failover</h2>
              <p className="text-xs text-[#605e5c] mt-0.5">
                Configure your Google Gemini API key. If rate limits or quota caps (HTTP 429) are reached, Yella automatically cascades to available fallback models in real time.
              </p>
            </div>

            {/* Provider and Key Card */}
            <div className="p-5 rounded-xl border border-[#edebe9] bg-white shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-[#201f1e] uppercase tracking-wider flex items-center gap-2">
                <Key size={14} className="text-purple-600" />
                Live AI Provider & API Key
              </h3>

              <div className="flex gap-2">
                <button
                  onClick={() => setProvider('gemini')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border ${
                    provider === 'gemini'
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-[#d2d0ce] text-[#605e5c]'
                  }`}
                >
                  Google Gemini (Free API Key)
                </button>
                <button
                  onClick={() => setProvider('openai')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold border ${
                    provider === 'openai'
                      ? 'bg-purple-50 border-purple-500 text-purple-700'
                      : 'border-[#d2d0ce] text-[#605e5c]'
                  }`}
                >
                  OpenAI
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-[#605e5c]">
                  {provider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
                </label>
                <input
                  type="password"
                  placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-2.5 rounded-lg text-xs border border-[#d2d0ce] outline-none focus:border-purple-600 font-mono bg-[#faf9f8]"
                />
                <p className="text-[10px] text-[#8a8886]">
                  Keys remain strictly inside your browser's private localStorage. Never sent to any third-party telemetry.
                </p>
              </div>
            </div>

            {/* Model Cascade Card */}
            {provider === 'gemini' && (
              <div className="p-5 rounded-xl border border-[#edebe9] bg-white shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#201f1e] uppercase tracking-wider flex items-center gap-2">
                    <Zap size={14} className="text-emerald-600" />
                    Automatic Model Switching Sequence
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    Active & Protected
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-[#605e5c]">Primary Preferred Gemini Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-xs border border-[#d2d0ce] outline-none focus:border-purple-600 bg-[#faf9f8]"
                  >
                    <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Versatile - 15 RPM)</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (Next-Gen Fast)</option>
                    <option value="gemini-1.5-flash-8b">gemini-1.5-flash-8b (High Volume / Lightweight)</option>
                    <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite (Ultra Fast)</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Complex Reasoning)</option>
                  </select>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
                  <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <RefreshCw size={13} className="text-purple-700" />
                    Failover Cascade Pipeline
                  </h4>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    When Google returns an HTTP 429 rate limit or quota exceeded error, Yella automatically pivots to the next model in this sequence without failing your request:
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
                    <span className="px-2 py-1 rounded bg-white border border-purple-300 font-bold text-purple-900">
                      1.5-Flash
                    </span>
                    <span className="text-purple-400">➔</span>
                    <span className="px-2 py-1 rounded bg-white border border-purple-300 font-bold text-purple-900">
                      2.0-Flash
                    </span>
                    <span className="text-purple-400">➔</span>
                    <span className="px-2 py-1 rounded bg-white border border-purple-300 font-bold text-purple-900">
                      Flash-8B
                    </span>
                    <span className="text-purple-400">➔</span>
                    <span className="px-2 py-1 rounded bg-white border border-purple-300 font-bold text-purple-900">
                      2.0-Lite
                    </span>
                    <span className="text-purple-400">➔</span>
                    <span className="px-2 py-1 rounded bg-white border border-purple-300 font-bold text-purple-900">
                      1.5-Pro
                    </span>
                    <span className="text-purple-400">➔</span>
                    <span className="px-2 py-1 rounded bg-white border border-purple-300 font-bold text-purple-900">
                      Autonomous Core
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div>
              <button
                onClick={handleSaveAISettings}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 shadow-sm"
              >
                Save AI Configuration
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#201f1e]">Privacy & Sovereignty Shield</h2>
              <p className="text-xs text-[#605e5c] mt-0.5">
                Full on-device data sovereignty ensures your files and tables remain strictly yours.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#edebe9] bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#201f1e]">Zero-Telemetry Policy</h4>
                  <p className="text-[11px] text-[#605e5c]">
                    All analytics, keystroke telemetry, and diagnostic tracking are fully blocked.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={zeroTelemetry}
                  onChange={(e) => setZeroTelemetry(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#edebe9]">
                <div>
                  <h4 className="text-xs font-bold text-[#201f1e]">Local Document Isolation</h4>
                  <p className="text-[11px] text-[#605e5c]">
                    Documents, spreadsheets, and slides are stored on-device in browser IndexedDB/LocalStorage.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={14} /> ACTIVE
                </span>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'storage' || activeTab === 'account') && (
          <div className="p-5 rounded-xl border border-[#edebe9] bg-white shadow-2xs space-y-2">
            <h3 className="text-xs font-bold text-[#201f1e]">Enterprise Workspace: Microsoft 365 AI Suite</h3>
            <p className="text-xs text-[#605e5c]">
              Real-time document rendering, live formula parsing, and multi-model autonomous Gemini AI integration active.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
