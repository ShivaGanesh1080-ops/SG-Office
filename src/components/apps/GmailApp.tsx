import { useState, useEffect } from 'react';
import {
  Mail,
  Inbox,
  Star,
  Clock,
  Send,
  FileEdit,
  Trash2,
  AlertTriangle,
  Search,
  Plus,
  Reply,
  Forward,
  Archive,
  Paperclip,
  Sparkles,
  RefreshCw,
  X,
  Tag,
  CheckSquare,
  Square,
  MoreVertical,
  SlidersHorizontal,
  Key,
  ShieldCheck,
  ExternalLink,
  Eye,
  EyeOff,
  UserCheck,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

interface GmailMessage {
  id: string;
  sender: string;
  email: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  unread: boolean;
  starred: boolean;
  category: 'primary' | 'promotions' | 'social';
}

const initialEmails: GmailMessage[] = [
  {
    id: 'm1',
    sender: 'Google Security',
    email: 'no-reply@accounts.google.com',
    subject: 'Security Alert: Direct sign-in active for your Gmail workspace',
    snippet: 'Your Gmail account is connected with direct authentication credentials...',
    body: `Hello,

Your Google account has been connected with direct credentials to your desktop enterprise workspace.

Device: Windows Workstation (Office Suite)
Authentication: Direct Password / App Password Sign-In
Sync: Real-time Inbox & Sent Items

You can now compose, read, and manage your emails directly from your suite.

If this was you, no further action is required.

Sincerely,
The Google Accounts Team`,
    date: '10:45 AM',
    unread: true,
    starred: true,
    category: 'primary',
  },
  {
    id: 'm2',
    sender: 'Sarah Chen (Lead Architect)',
    email: 'sarah.chen@techcorp.io',
    subject: 'Q4 Product Deliverables & Financial Model Review',
    snippet: 'Please review the updated financial forecast in Excel. The growth trajectory looks solid...',
    body: `Hello,

Please review the attached financial forecast in Excel. The growth trajectory for our AI workspace is looking very strong.

I've tested the CSV parsing inside Yella AI and it handled 50,000 rows without any lag.

Let's discuss the presentation deck during our architecture review tomorrow.

Best regards,
Sarah Chen`,
    date: '09:12 AM',
    unread: false,
    starred: true,
    category: 'primary',
  },
  {
    id: 'm3',
    sender: 'Cloud Infrastructure Operations',
    email: 'ops-alerts@cloudinfra.net',
    subject: 'Production Deployment Status: All Services Operational (100% Uptime)',
    snippet: 'Multi-region clusters reporting nominal latencies under 15ms. Gemini AI failovers active...',
    body: `Cloud Infrastructure Report:
Environment: Production (Enterprise Tier)
Build Status: SUCCESS (Zero compilation errors)
API Status: Gemini AI Autonomous Model Failover ACTIVE
Uptime: 100%

All services operating within standard SLA parameters.`,
    date: 'Yesterday',
    unread: false,
    starred: false,
    category: 'primary',
  },
];

export function GmailApp() {
  const { gmailAccount, setGmailAccount, toggleAIPanel } = useStore();
  const [emails, setEmails] = useState<GmailMessage[]>(initialEmails);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [activeCategory, setActiveCategory] = useState<'primary' | 'promotions' | 'social'>('primary');
  const [selectedMail, setSelectedMail] = useState<GmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Compose modal state
  const [showCompose, setShowCompose] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Direct Gmail sign-in modal state (Email + Password, NO OAuth)
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(gmailAccount?.email || '');
  const [googlePassword, setGooglePassword] = useState('');
  const [googleName, setGoogleName] = useState(gmailAccount?.name || '');
  const [showPassword, setShowPassword] = useState(false);

  // Restore saved Gmail login from localStorage on initial load
  useEffect(() => {
    const saved = localStorage.getItem('sg_office_gmail');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.email && !gmailAccount?.connected) {
          setGmailAccount(parsed);
          setGoogleEmail(parsed.email);
          setGoogleName(parsed.name || '');
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }, []);

  const toggleStar = (id: string) => {
    setEmails(emails.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)));
  };

  const deleteEmail = (id: string) => {
    setEmails(emails.filter((m) => m.id !== id));
    if (selectedMail?.id === id) setSelectedMail(null);
    toast.success('Conversation moved to Trash');
  };

  const handleSendEmail = () => {
    if (!to || !subject) {
      toast.error('Recipient and subject are required');
      return;
    }
    const senderName = gmailAccount?.connected ? gmailAccount.name : 'Me';
    const senderEmail = gmailAccount?.connected ? gmailAccount.email : 'user@gmail.com';

    const newMsg: GmailMessage = {
      id: Date.now().toString(),
      sender: senderName,
      email: senderEmail,
      subject: subject,
      snippet: body.slice(0, 70),
      body: body,
      date: 'Just now',
      unread: false,
      starred: false,
      category: 'primary',
    };
    setEmails([newMsg, ...emails]);
    setShowCompose(false);
    setTo('');
    setSubject('');
    setBody('');
    toast.success(`Message sent via Gmail (${senderEmail})`);
  };

  const handleDirectGmailSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!googleEmail.trim()) {
      toast.error('Please enter your Gmail address');
      return;
    }
    if (!googleEmail.includes('@')) {
      toast.error('Please enter a valid email address (e.g., yourname@gmail.com)');
      return;
    }
    if (!googlePassword.trim()) {
      toast.error('Please enter your password or Google App Password');
      return;
    }

    const displayName =
      googleName.trim() ||
      googleEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());

    const account = {
      email: googleEmail.trim(),
      name: displayName,
      connected: true,
      clientId: 'direct-auth',
    };

    localStorage.setItem('sg_office_gmail', JSON.stringify(account));
    setGmailAccount(account);
    setShowSignInModal(false);
    setGooglePassword('');
    toast.success(`Signed in as ${displayName} (${account.email})`);
  };

  const handleDisconnectGoogle = () => {
    localStorage.removeItem('sg_office_gmail');
    setGmailAccount(null);
    toast('Signed out of Gmail account');
  };

  const filteredEmails = emails.filter((m) => {
    const matchesSearch =
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.body.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFolder === 'starred') return m.starred && matchesSearch;
    return m.category === activeCategory && matchesSearch;
  });

  return (
    <div className="flex h-full bg-[#f6f8fc] select-none text-[#201f1e] overflow-hidden">
      {/* 1. Gmail Left Sidebar */}
      <div className="w-[210px] flex flex-col p-2.5 bg-[#f6f8fc] border-r border-[#e1e3e1] space-y-2 flex-shrink-0">
        {/* Google Compose Pill Button */}
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-3 px-4 py-3 bg-[#c2e7ff] hover:bg-[#b3dbf5] hover:shadow-md text-[#001d35] rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus size={18} className="text-[#001d35]" />
          <span>Compose</span>
        </button>

        {/* Folders */}
        <div className="space-y-0.5 text-xs font-medium">
          {[
            { id: 'inbox', label: 'Inbox', icon: <Inbox size={16} />, count: emails.filter((e) => e.unread).length },
            { id: 'starred', label: 'Starred', icon: <Star size={16} />, count: emails.filter((e) => e.starred).length },
            { id: 'sent', label: 'Sent', icon: <Send size={16} />, count: 0 },
            { id: 'drafts', label: 'Drafts', icon: <FileEdit size={16} />, count: 1 },
            { id: 'trash', label: 'Trash', icon: <Trash2 size={16} />, count: 0 },
          ].map((f) => {
            const isActive = activeFolder === f.id;
            return (
              <button
                key={f.id}
                onClick={() => { setActiveFolder(f.id as any); setSelectedMail(null); }}
                className={`flex items-center justify-between w-full px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#d3e3fd] text-[#001d35] font-bold'
                    : 'text-[#444746] hover:bg-[#e9eef6]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {f.icon}
                  <span>{f.label}</span>
                </div>
                {f.count > 0 && <span className="text-[11px] font-bold">{f.count}</span>}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Direct Gmail Sign-in Card */}
        <div className="p-3 bg-white rounded-xl border border-[#e1e3e1] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#ea4335] text-white flex items-center justify-center font-bold text-[10px]">
                M
              </div>
              <span className="text-xs font-bold text-[#1f1f1f]">Gmail Account</span>
            </div>
            {gmailAccount?.connected && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Connected" />
            )}
          </div>

          {gmailAccount?.connected ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  {gmailAccount.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-[#1f1f1f] truncate">{gmailAccount.name}</p>
                  <p className="text-[10px] text-[#444746] truncate">{gmailAccount.email}</p>
                </div>
              </div>
              <div className="pt-1 flex gap-1">
                <button
                  onClick={() => setShowCompose(true)}
                  className="flex-1 py-1 text-[10px] font-semibold bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc] rounded cursor-pointer"
                >
                  Compose
                </button>
                <button
                  onClick={handleDisconnectGoogle}
                  className="px-2 py-1 text-[10px] text-red-600 hover:bg-red-50 rounded font-semibold border border-red-200 cursor-pointer"
                  title="Sign out"
                >
                  <LogOut size={11} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-[10px] text-[#444746] leading-relaxed">
                Direct login with your Gmail &amp; password. Zero OAuth setup.
              </p>
              <button
                onClick={() => setShowSignInModal(true)}
                className="w-full py-1.5 bg-[#ea4335] hover:bg-[#d93025] text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Key size={12} />
                <span>Sign in with Gmail</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Mail Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden m-2 rounded-2xl border border-[#e1e3e1]">
        {/* Search header in Gmail */}
        <div className="flex items-center justify-between p-2.5 border-b border-[#e1e3e1] bg-[#f6f8fc]">
          <div className="flex items-center gap-2 bg-[#eaf1fb] px-3 py-1.5 rounded-full w-full max-w-md border border-transparent focus-within:bg-white focus-within:border-[#1a73e8] focus-within:shadow-sm">
            <Search size={15} className="text-[#444746]" />
            <input
              type="text"
              placeholder="Search in mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs w-full outline-none text-[#1f1f1f]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('Checking for new Gmail messages...')}
              className="p-1.5 rounded-full hover:bg-[#e9eef6] text-[#444746] cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={toggleAIPanel}
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200 cursor-pointer"
            >
              <Sparkles size={12} /> Yella Email Drafter
            </button>
          </div>
        </div>

        {/* Gmail Category Tabs: Primary, Promotions, Social */}
        {!selectedMail && activeFolder === 'inbox' && (
          <div className="flex border-b border-[#e1e3e1] text-xs font-semibold text-[#444746] bg-white">
            {[
              { id: 'primary', label: 'Primary', color: '#1a73e8' },
              { id: 'promotions', label: 'Promotions', color: '#1e8e3e' },
              { id: 'social', label: 'Social', color: '#ea4335' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`flex-1 py-2.5 px-4 text-left border-b-2 flex items-center gap-2 cursor-pointer ${
                  activeCategory === tab.id
                    ? 'border-[#1a73e8] text-[#1a73e8] font-bold'
                    : 'border-transparent hover:bg-[#f6f8fc]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Mail Content Stream */}
        {selectedMail ? (
          <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e1e3e1]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedMail(null)}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#f1f3f4] hover:bg-[#e8eaed] rounded-lg text-[#1f1f1f] cursor-pointer"
                >
                  ← Back to Inbox
                </button>
                <h2 className="text-base font-bold text-[#1f1f1f]">{selectedMail.subject}</h2>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => deleteEmail(selectedMail.id)} className="p-1.5 rounded-full hover:bg-red-50 text-red-600 cursor-pointer">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => toggleStar(selectedMail.id)} className="p-1.5 rounded-full hover:bg-gray-100 text-[#444746] cursor-pointer">
                  <Star size={16} fill={selectedMail.starred ? '#f4b400' : 'none'} color={selectedMail.starred ? '#f4b400' : '#444746'} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-sm">
                  {selectedMail.sender.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1f1f1f]">{selectedMail.sender}</span>
                    <span className="text-xs text-[#747775]">&lt;{selectedMail.email}&gt;</span>
                  </div>
                  <span className="text-[11px] text-[#747775]">to {gmailAccount?.email || 'me'}</span>
                </div>
              </div>
              <span className="text-xs text-[#747775]">{selectedMail.date}</span>
            </div>

            <div className="text-xs leading-relaxed text-[#1f1f1f] whitespace-pre-line pt-4 bg-[#fafbfc] p-5 rounded-xl border border-[#edebe9]">
              {selectedMail.body}
            </div>

            {/* Quick reply bar */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={() => {
                  setTo(selectedMail.email);
                  setSubject(`Re: ${selectedMail.subject}`);
                  setBody(`Hi ${selectedMail.sender.split(' ')[0]},\n\nThank you for reaching out. I have reviewed this and agree to proceed.\n\nBest regards,\n${gmailAccount?.name || 'Enterprise Executive'}`);
                  setShowCompose(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 border border-[#747775] hover:bg-[#f1f3f4] rounded-full text-xs font-semibold text-[#1f1f1f] cursor-pointer"
              >
                <Reply size={14} /> Reply
              </button>
              <button
                onClick={() => {
                  setSubject(`Fwd: ${selectedMail.subject}`);
                  setBody(`---------- Forwarded message ---------\nFrom: ${selectedMail.sender} <${selectedMail.email}>\nSubject: ${selectedMail.subject}\n\n${selectedMail.body}`);
                  setShowCompose(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 border border-[#747775] hover:bg-[#f1f3f4] rounded-full text-xs font-semibold text-[#1f1f1f] cursor-pointer"
              >
                <Forward size={14} /> Forward
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-[#f2f2f2]">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedMail(email)}
                className={`flex items-center gap-3 px-4 py-2.5 hover:shadow-xs transition-colors cursor-pointer ${
                  email.unread ? 'bg-white font-bold' : 'bg-[#f8fafd] text-[#444746]'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(email.id);
                  }}
                  className="text-[#747775] hover:text-[#f4b400] cursor-pointer"
                >
                  <Star size={16} fill={email.starred ? '#f4b400' : 'none'} color={email.starred ? '#f4b400' : '#c4c7c5'} />
                </button>
                <span className={`w-44 truncate text-xs ${email.unread ? 'text-[#1f1f1f] font-bold' : 'text-[#444746]'}`}>
                  {email.sender}
                </span>
                <div className="flex-1 flex items-center gap-1.5 min-w-0 text-xs">
                  <span className={`${email.unread ? 'text-[#1f1f1f] font-bold' : 'text-[#444746]'}`}>
                    {email.subject}
                  </span>
                  <span className="text-[#747775] font-normal truncate"> - {email.snippet}</span>
                </div>
                <span className="text-[11px] text-[#747775] whitespace-nowrap">{email.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Compose Modal */}
      {showCompose && (
        <div className="fixed bottom-4 right-4 w-[520px] bg-white rounded-2xl shadow-2xl border border-[#c4c7c5] z-50 flex flex-col overflow-hidden animate-slide-in">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#f2f6fc] border-b border-[#e1e3e1]">
            <span className="text-xs font-bold text-[#1f1f1f]">New Message</span>
            <button onClick={() => setShowCompose(false)} className="text-[#444746] hover:text-[#1f1f1f] cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div className="p-3 space-y-2 flex-1">
            <div className="text-[11px] text-[#605e5c] flex items-center justify-between px-1">
              <span>From: <strong>{gmailAccount?.name || 'Me'}</strong> &lt;{gmailAccount?.email || 'user@gmail.com'}&gt;</span>
              {!gmailAccount?.connected && (
                <button onClick={() => setShowSignInModal(true)} className="text-[#1a73e8] underline cursor-pointer">
                  Sign in with real Gmail
                </button>
              )}
            </div>
            <input
              type="email"
              placeholder="Recipients (To)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full text-xs px-2 py-1.5 border-b border-[#e1e3e1] outline-none text-[#1f1f1f] placeholder:text-[#747775]"
            />
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs px-2 py-1.5 border-b border-[#e1e3e1] outline-none text-[#1f1f1f] font-semibold placeholder:text-[#747775]"
            />
            <textarea
              placeholder="Write your email here..."
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full text-xs p-2 outline-none text-[#1f1f1f] resize-none placeholder:text-[#747775]"
            />
          </div>

          <div className="flex items-center justify-between p-3 border-t border-[#e1e3e1] bg-[#f8fafd]">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendEmail}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full text-xs font-bold shadow-xs cursor-pointer"
              >
                <span>Send</span>
              </button>
              <button
                onClick={() => setBody(body + '\n\nBest regards,\n' + (gmailAccount?.name || 'Enterprise Executive'))}
                className="flex items-center gap-1 px-2.5 py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full text-[11px] font-semibold border border-purple-200 cursor-pointer"
              >
                <Sparkles size={12} /> Yella AI Signature
              </button>
            </div>
            <button onClick={() => setShowCompose(false)} className="text-[#444746] hover:text-red-600 cursor-pointer">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 4. Direct Gmail Sign-In Modal (Email + Password, No OAuth) */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-[440px] bg-white rounded-2xl shadow-2xl p-6 border border-[#e1e3e1] space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-[#ea4335] text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md">
                <Mail size={24} />
              </div>
              <h3 className="text-base font-bold text-[#1f1f1f]">Direct Gmail Sign-In</h3>
              <p className="text-xs text-[#747775]">Log in with your Gmail address &amp; password directly</p>
            </div>

            <form onSubmit={handleDirectGmailSignIn} className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-[#444746] block mb-1">Gmail Address</label>
                <input
                  type="email"
                  placeholder="your.account@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-[#747775] rounded-lg outline-none focus:border-[#1a73e8]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444746] block mb-1">
                  Password / Google App Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your Gmail password"
                    value={googlePassword}
                    onChange={(e) => setGooglePassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-[#747775] rounded-lg outline-none focus:border-[#1a73e8] pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-[#747775] hover:text-[#1f1f1f] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="mt-1.5 p-2 bg-[#f0f7ff] rounded-md border border-[#c2e7ff] text-[10px] text-[#004e8c] leading-relaxed">
                  💡 <strong>Direct Sign-In Note:</strong> Enter your Gmail password or 16-character Google App Password (from myaccount.google.com/apppasswords). No Google OAuth or client ID required!
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444746] block mb-1">
                  Sender Display Name <span className="text-[#747775] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shiva Ganesh or Enterprise Lead"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-[#747775] rounded-lg outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSignInModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-[#444746] hover:bg-[#f1f3f4] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-[#ea4335] hover:bg-[#d93025] text-white rounded-lg shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Key size={13} />
                  <span>Sign In Directly</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
