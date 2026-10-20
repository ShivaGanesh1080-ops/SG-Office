import { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  Search,
  Sparkles,
  Share2,
  User,
  LogOut,
  Sliders,
  Check,
} from 'lucide-react';
import { OfficeLogo } from '../common/OfficeLogo';
import toast from 'react-hot-toast';

export function TopBar() {
  const { currentApp, toggleAIPanel, aiPanelOpen, toggleSearch, gmailAccount, setCurrentApp } = useStore();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="flex items-center justify-between h-[46px] px-4 bg-white border-b border-[#edebe9] select-none text-[#201f1e] gap-3 flex-shrink-0 z-20">
      {/* Left: Office Brand & Home Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* 9-dot Waffle App Launcher */}
        <button
          onClick={toggleSearch}
          title="App Launcher (Ctrl+K)"
          className="p-1.5 rounded-md hover:bg-[#f3f2f1] text-[#605e5c] transition-colors flex-shrink-0"
        >
          <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-0.5 h-0.5 bg-[#444746] rounded-full" />
            ))}
          </div>
        </button>

        <div className="flex items-center gap-2">
          <OfficeLogo size={20} />
          <span className="font-extrabold text-sm text-[#201f1e] tracking-tight">
            Microsoft 365
          </span>
          <span className="text-xs text-[#8a8886] hidden sm:inline">• Enterprise Workspace</span>
        </div>
      </div>

      {/* Center: Search Box */}
      <div className="flex-1 max-w-md mx-2 hidden sm:block">
        <button
          onClick={toggleSearch}
          className="w-full flex items-center gap-2.5 px-3 py-1.5 bg-[#f3f2f1] hover:bg-[#edebe9] rounded-lg text-xs text-[#605e5c] transition-all border border-transparent hover:border-[#d2d0ce]"
        >
          <Search size={14} className="text-[#605e5c]" />
          <span className="truncate flex-1 text-left text-xs">Search files, tools, or ask Yella AI...</span>
          <kbd className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#edebe9] font-mono text-[#8a8886]">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Yella AI, Share & User Profile */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={toggleAIPanel}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-xs transition-all ${
            aiPanelOpen
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white ring-2 ring-purple-300'
              : 'bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700'
          }`}
          title="Open Yella AI Assistant"
        >
          <Sparkles size={13} />
          <span>Yella AI</span>
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Workspace link copied to clipboard!');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f3f2f1] hover:bg-[#edebe9] text-[#201f1e] rounded-lg text-xs font-semibold transition-colors"
        >
          <Share2 size={13} />
          <span className="hidden md:inline">Share</span>
        </button>

        {/* Profile Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0078d4] to-[#107c41] text-white flex items-center justify-center font-bold text-xs shadow-xs hover:ring-2 hover:ring-offset-1 hover:ring-[#0078d4] transition-all"
            title="User Profile"
          >
            {gmailAccount?.name ? gmailAccount.name.charAt(0).toUpperCase() : 'U'}
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-[#edebe9] p-4 z-50 animate-fade-in text-xs space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-[#edebe9]">
                <div className="w-10 h-10 rounded-full bg-[#0078d4] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {gmailAccount?.name ? gmailAccount.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-[#201f1e] truncate">
                    {gmailAccount?.name || 'Enterprise User'}
                  </p>
                  <p className="text-[11px] text-[#605e5c] truncate">
                    {gmailAccount?.email || 'user@enterprise.m365'}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
                    Sovereign Pro • Unlimited AI
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => { setCurrentApp('settings'); setShowProfile(false); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#f3f2f1] text-[#201f1e] flex items-center gap-2"
                >
                  <Sliders size={13} />
                  <span>Workspace Preferences</span>
                </button>
                <button
                  onClick={() => { setCurrentApp('email'); setShowProfile(false); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#f3f2f1] text-[#201f1e] flex items-center gap-2"
                >
                  <span>✉️ Manage Connected Gmail</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#edebe9]">
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 font-semibold flex items-center gap-2"
                >
                  <LogOut size={13} />
                  <span>Reset Workspace Cache</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
