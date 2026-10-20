import { useState } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';

export function SettingsApp() {
  const [activeTab, setActiveTab] = useState<'ai' | 'account' | 'security' | 'storage'>('ai');
  const [aiModel, setAiModel] = useState('Nova Ultra Reasoning 3.5 (Local + Cloud)');
  const [temperature, setTemperature] = useState(0.7);
  const [zeroTelemetry, setZeroTelemetry] = useState(true);
  const [crossDocMemory, setCrossDocMemory] = useState(true);

  const tabs = [
    { id: 'ai', label: 'AI Intelligence & Models', icon: <Sparkles size={16} /> },
    { id: 'security', label: 'Security & Privacy', icon: <Shield size={16} /> },
    { id: 'storage', label: 'Offline Sync & Cloud', icon: <HardDrive size={16} /> },
    { id: 'account', label: 'Personalization & Profile', icon: <User size={16} /> },
  ];

  return (
    <div className="flex h-full" style={{ background: 'var(--nova-bg)' }}>
      {/* Settings Navigation */}
      <div className="w-[260px] border-r p-4 space-y-2" style={{ borderColor: 'var(--nova-border)', background: 'var(--nova-bg-secondary)' }}>
        <div className="flex items-center gap-2 mb-4 px-2">
          <Settings size={20} style={{ color: 'var(--nova-primary)' }} />
          <h2 className="text-base font-bold" style={{ color: 'var(--nova-text)' }}>Suite Settings</h2>
        </div>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: activeTab === t.id ? 'var(--nova-primary-light)' : 'transparent',
              color: activeTab === t.id ? 'var(--nova-primary-hover)' : 'var(--nova-text-secondary)',
            }}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Settings Body */}
      <div className="flex-1 overflow-y-auto p-10 max-w-4xl">
        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--nova-text)' }}>Personalized AI Configuration</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--nova-text-muted)' }}>
                Fine-tune your personal autonomous copilot, contextual memory, and model engines.
              </p>
            </div>

            <div className="p-6 rounded-2xl border space-y-4" style={{ background: 'var(--nova-bg-secondary)', borderColor: 'var(--nova-border)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--nova-text)' }}>Active AI Model Engine</h3>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full p-3 rounded-xl text-xs outline-none font-medium"
                style={{ background: 'var(--nova-bg-tertiary)', color: 'var(--nova-text)', border: '1px solid var(--nova-border)' }}
              >
                <option>Nova Ultra Reasoning 3.5 (Local + Cloud Hybrid) [Fastest & Most Intelligent]</option>
                <option>Nova Private Local Core (100% On-Device, No Internet Required)</option>
                <option>Claude 3.7 Sonnet / Opus Reasoning Engine</option>
                <option>Gemini 2.5 Pro Multimodal Deep Analysis</option>
              </select>

              <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--nova-border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: 'var(--nova-text)' }}>Cross-Document Semantic Memory</h4>
                    <p className="text-[11px]" style={{ color: 'var(--nova-text-muted)' }}>
                      Allows AI to connect insights between your NovaDocs, NovaSheets, and NovaSlides seamlessly.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={crossDocMemory}
                    onChange={(e) => setCrossDocMemory(e.target.checked)}
                    className="w-5 h-5 accent-indigo-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: 'var(--nova-text)' }}>Creativity & Temperature ({temperature})</h4>
                    <p className="text-[11px]" style={{ color: 'var(--nova-text-muted)' }}>
                      Lower values produce deterministic reports, higher values boost creative ideas.
                    </p>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-32 accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border space-y-3" style={{ background: 'var(--nova-bg-secondary)', borderColor: 'var(--nova-border)' }}>
              <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--nova-text)' }}>
                <Key size={16} className="text-indigo-400" /> Custom API Keys (Optional)
              </h3>
              <p className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>
                NovaSuite comes pre-activated with unlimited Pro AI tier. You can also hook your own custom enterprise API endpoints.
              </p>
              <input
                type="password"
                placeholder="sk-nova-enterprise-key-..."
                className="w-full p-2.5 rounded-xl text-xs bg-black/20 outline-none border"
                style={{ borderColor: 'var(--nova-border)', color: 'var(--nova-text)' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--nova-text)' }}>Enterprise Security & Zero-Leakage Shield</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--nova-text-muted)' }}>
                Unlike MS Office Copilot, NovaSuite ensures your proprietary document data is never sent to ad-networks or public training sets.
              </p>
            </div>

            <div className="p-6 rounded-2xl border space-y-4" style={{ background: 'var(--nova-bg-secondary)', borderColor: 'var(--nova-border)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--nova-text)' }}>Strict Zero-Telemetry Policy</h4>
                  <p className="text-[11px]" style={{ color: 'var(--nova-text-muted)' }}>
                    Disable all telemetry, keystroke telemetry, and analytical pings.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={zeroTelemetry}
                  onChange={(e) => setZeroTelemetry(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--nova-border)' }}>
                <div>
                  <h4 className="text-xs font-bold" style={{ color: 'var(--nova-text)' }}>End-to-End Vault Encryption</h4>
                  <p className="text-[11px]" style={{ color: 'var(--nova-text-muted)' }}>
                    Documents are encrypted using AES-256-GCM before write-to-disk.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> ACTIVE
                </span>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'storage' || activeTab === 'account') && (
          <div className="p-6 rounded-2xl border space-y-3" style={{ background: 'var(--nova-bg-secondary)', borderColor: 'var(--nova-border)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--nova-text)' }}>Active Profile: NovaSuite Pro Enterprise</h3>
            <p className="text-xs" style={{ color: 'var(--nova-text-muted)' }}>
              Local storage quota: 2.4 GB used of 100 GB. Auto-synchronization active across desktop and mobile.
            </p>
          </div>
        )}

        <div className="pt-6">
          <button
            onClick={() => toast.success('Settings saved successfully!')}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            Save All Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
