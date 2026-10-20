import { useState } from 'react';
import {
  Mail,
  Inbox,
  Send,
  Trash2,
  Star,
  Search,
  Plus,
  Reply,
  Forward,
  Archive,
  Paperclip,
  Sparkles,
  RefreshCw,
  X,
  Wand2,
  Tag,
  Users,
  AlertCircle,
  Clock,
  FileText,
  CheckCircle2,
  Minimize2,
  Maximize2,
  MoreVertical,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { queryYellaAI } from '../../services/aiService';

interface EmailData {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
  category: 'primary' | 'promotions' | 'social' | 'updates';
  folder: 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash';
  avatarColor: string;
}

const initialEmails: EmailData[] = [
  {
    id: 'e1',
    from: 'Google Workspace Team',
    fromEmail: 'workspace-noreply@google.com',
    to: 'me',
    subject: 'Google Account connected to SG-Office',
    preview: 'Your Google Account has been verified for synchronized mailbox operations...',
    body: `Hello,

Your Google Account has been successfully authorized for SG-Office. You can now compose, search, and manage your mail workflows directly inside your personalized desktop workspace.

Key Active Permissions:
• Real-time message composition & Yella AI drafting
• End-to-end data privacy with zero intermediate logging
• Seamless document attachments from Word & Excel

Welcome to the future of integrated productivity.

Best regards,
The Google Workspace Team`,
    date: '11:42 AM',
    read: false,
    starred: true,
    category: 'primary',
    folder: 'inbox',
    avatarColor: '#ea4335',
  },
  {
    id: 'e2',
    from: 'Satya Nadella (Executive)',
    fromEmail: 'satya.nadella@enterprise.com',
    to: 'me',
    subject: 'Incredible progress on SG-Office 365 Architecture',
    preview: 'Hi Shiva, I reviewed the updated Office 365 Ribbon and Excel calculation engine...',
    body: `Hi Shiva,

I reviewed the updated Office 365 suite. The single-row responsive Ribbon, TipTap Word tables, and Excel live formula calculation engine are phenomenal.

Having Yella AI automatically handle rate-limit failovers across Gemini models is a massive competitive advantage.

Keep up the outstanding engineering velocity.

Warm regards,
Satya Nadella`,
    date: '10:15 AM',
    read: false,
    starred: true,
    category: 'primary',
    folder: 'inbox',
    avatarColor: '#185abd',
  },
  {
    id: 'e3',
    from: 'Google Cloud Platform',
    fromEmail: 'cloud-billing@google.com',
    to: 'me',
    subject: 'Gemini 2.0 Flash Quota & API Analytics',
    preview: 'Your API key quotas are healthy. Automated failover cascade is monitored...',
    body: `Your Google Gemini API quotas have been synced. The multi-model failover pipeline (Flash -> 2.0-Flash -> Flash-8B -> Pro) has processed all requests within standard SLA thresholds.`,
    date: 'Yesterday',
    read: true,
    starred: false,
    category: 'updates',
    folder: 'inbox',
    avatarColor: '#4285f4',
  },
  {
    id: 'e4',
    from: 'GitHub Notifications',
    fromEmail: 'notifications@github.com',
    to: 'me',
    subject: '[ShivaGanesh1080-ops/SG-Office] Production deployment succeeded',
    preview: 'Your latest commit successfully built and deployed in 25 seconds with 0 errors...',
    body: `Run 39467885944 completed successfully on branch main.
Artifacts: github-pages (1,217 kB).
Status: Live and operational.`,
    date: 'Oct 20',
    read: true,
    starred: false,
    category: 'updates',
    folder: 'inbox',
    avatarColor: '#24292f',
  },
  {
    id: 'e5',
    from: 'Google AI Studio',
    fromEmail: 'ai-studio-news@google.com',
    to: 'me',
    subject: 'Special Offer: Extra developer tokens for Gemini 1.5 Pro',
    preview: 'Claim your high-volume inference tier on Google AI Studio...',
    body: `Activate experimental features and multimodal token reasoning on Google AI Studio.`,
    date: 'Oct 19',
    read: true,
    starred: false,
    category: 'promotions',
    folder: 'inbox',
    avatarColor: '#0f9d58',
  },
];

export function EmailApp() {
  const { gmailAccount, setGmailAccount, toggleAIPanel } = useStore();
  const [emails, setEmails] = useState<EmailData[]>(initialEmails);
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(initialEmails[0]);
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'>('inbox');
  const [activeCategory, setActiveCategory] = useState<'primary' | 'promotions' | 'social' | 'updates'>('primary');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isComposingAI, setIsComposingAI] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState('');

  // Filtered emails
  const filteredEmails = emails.filter((e) => {
    if (activeFolder === 'starred') return e.starred;
    if (activeFolder !== 'inbox' && e.folder !== activeFolder) return false;
    if (activeFolder === 'inbox' && e.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.subject.toLowerCase().includes(q) || e.from.toLowerCase().includes(q) || e.body.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((item) => (item.id === id ? { ...item, starred: !item.starred } : item))
    );
  };

  const handleSelectEmail = (email: EmailData) => {
    setSelectedEmail(email);
    // Mark as read
    setEmails((prev) =>
      prev.map((item) => (item.id === email.id ? { ...item, read: true } : item))
    );
  };

  const deleteEmail = (id: string) => {
    setEmails((prev) => prev.filter((item) => item.id !== id));
    if (selectedEmail?.id === id) {
      setSelectedEmail(null);
    }
    toast.success('Email moved to Trash');
  };

  // Send Email
  const handleSendEmail = () => {
    if (!composeTo.trim()) {
      toast.error('Please specify at least one recipient');
      return;
    }

    const newEmail: EmailData = {
      id: Date.now().toString(),
      from: gmailAccount?.name || 'Me',
      fromEmail: gmailAccount?.email || 'me@gmail.com',
      to: composeTo,
      subject: composeSubject || '(No Subject)',
      preview: composeBody.slice(0, 80),
      body: composeBody,
      date: 'Just now',
      read: true,
      starred: false,
      category: 'primary',
      folder: 'sent',
      avatarColor: '#ea4335',
    };

    setEmails([newEmail, ...emails]);
    setShowCompose(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    toast.success('Message sent via Gmail');
  };

  // AI "Help Me Write"
  const handleAICompose = async () => {
    const prompt = window.prompt(
      'What email would you like Yella to write? (e.g., "Ask for project status update" or "Polite reschedule")',
      composeSubject || 'Project Update'
    );
    if (!prompt) return;

    setIsComposingAI(true);
    toast.loading('Yella is drafting your email...', { id: 'gmail-ai' });

    try {
      const draft = await queryYellaAI(
        `Draft a professional, well-formatted email regarding: "${prompt}". Provide only the email body text.`,
        'Gmail Compose Context'
      );
      setComposeBody(draft);
      if (!composeSubject) setComposeSubject(prompt);
      toast.dismiss('gmail-ai');
      toast.success('Yella generated your email draft!');
    } catch {
      toast.dismiss('gmail-ai');
      toast.error('Draft generation completed');
    } finally {
      setIsComposingAI(false);
    }
  };

  // Connect Google Account
  const handleConnectGoogle = () => {
    if (!customEmailInput.includes('@')) {
      toast.error('Please enter a valid Gmail address');
      return;
    }
    setGmailAccount({
      connected: true,
      email: customEmailInput.trim(),
      name: customEmailInput.split('@')[0],
    });
    setShowConnectModal(false);
    toast.success(`Connected to ${customEmailInput}!`);
  };

  return (
    <div className="flex h-full bg-[#f6f8fc] select-none text-[#201f1e] overflow-hidden">
      {/* 1. Gmail Left Sidebar Drawer */}
      <div className="w-56 bg-[#f6f8fc] p-3 flex flex-col justify-between border-r border-[#e0e3e7] flex-shrink-0">
        <div className="space-y-4">
          {/* Google Compose Pill Button */}
          <button
            onClick={() => setShowCompose(true)}
            className="flex items-center gap-3 px-5 py-3.5 bg-[#c2e7ff] hover:bg-[#b3dbf5] text-[#001d35] rounded-2xl shadow-sm hover:shadow font-semibold text-xs transition-all w-36"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <Plus size={18} className="text-[#001d35]" />
            </div>
            <span>Compose</span>
          </button>

          {/* Folder Navigation */}
          <nav className="space-y-0.5 text-xs font-medium">
            <button
              onClick={() => { setActiveFolder('inbox'); setSelectedEmail(null); }}
              className={`flex items-center justify-between w-full px-4 py-2 rounded-full transition-colors ${
                activeFolder === 'inbox' ? 'bg-[#d3e3fd] text-[#041e49] font-bold' : 'text-[#444746] hover:bg-[#eaebef]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox size={16} />
                <span>Inbox</span>
              </div>
              <span className="text-[11px] font-bold text-[#041e49]">
                {emails.filter((e) => !e.read).length}
              </span>
            </button>

            <button
              onClick={() => { setActiveFolder('starred'); setSelectedEmail(null); }}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-full transition-colors ${
                activeFolder === 'starred' ? 'bg-[#d3e3fd] text-[#041e49] font-bold' : 'text-[#444746] hover:bg-[#eaebef]'
              }`}
            >
              <Star size={16} />
              <span>Starred</span>
            </button>

            <button
              onClick={() => { setActiveFolder('sent'); setSelectedEmail(null); }}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-full transition-colors ${
                activeFolder === 'sent' ? 'bg-[#d3e3fd] text-[#041e49] font-bold' : 'text-[#444746] hover:bg-[#eaebef]'
              }`}
            >
              <Send size={16} />
              <span>Sent</span>
            </button>

            <button
              onClick={() => { setActiveFolder('drafts'); setSelectedEmail(null); }}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-full transition-colors ${
                activeFolder === 'drafts' ? 'bg-[#d3e3fd] text-[#041e49] font-bold' : 'text-[#444746] hover:bg-[#eaebef]'
              }`}
            >
              <FileText size={16} />
              <span>Drafts</span>
            </button>

            <button
              onClick={() => { setActiveFolder('trash'); setSelectedEmail(null); }}
              className={`flex items-center gap-3 w-full px-4 py-2 rounded-full transition-colors ${
                activeFolder === 'trash' ? 'bg-[#d3e3fd] text-[#041e49] font-bold' : 'text-[#444746] hover:bg-[#eaebef]'
              }`}
            >
              <Trash2 size={16} />
              <span>Trash</span>
            </button>
          </nav>
        </div>

        {/* Google Account Status Badge */}
        <div className="p-3 bg-white rounded-xl border border-[#e0e3e7] shadow-2xs space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-[11px]">
              G
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold truncate text-[#201f1e]">
                {gmailAccount?.connected ? gmailAccount.email : 'Google Account'}
              </p>
              <p className="text-[10px] text-[#605e5c]">
                {gmailAccount?.connected ? 'Mail Synced' : 'Not Linked'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowConnectModal(true)}
            className="w-full py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
          >
            {gmailAccount?.connected ? 'Change Account' : 'Sign in with Google'}
          </button>
        </div>
      </div>

      {/* 2. Main Gmail Content Container */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden m-2 rounded-2xl border border-[#e0e3e7] shadow-sm">
        {/* Top Gmail Search & Action Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#e0e3e7] bg-white gap-3 flex-shrink-0">
          {/* Search Box */}
          <div className="flex-1 max-w-xl flex items-center gap-2.5 px-4 py-1.5 bg-[#edf2fc] rounded-full focus-within:bg-white focus-within:shadow-md focus-within:border focus-within:border-[#e0e3e7] transition-all">
            <Search size={15} className="text-[#444746]" />
            <input
              type="text"
              placeholder="Search in mail..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent outline-none text-[#1f1f1f]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => toast.success('Mailbox refreshed')}
              className="p-2 rounded-full hover:bg-[#f2f2f2] text-[#444746]"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={toggleAIPanel}
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full font-bold hover:bg-purple-100"
            >
              <Sparkles size={13} /> Ask Yella
            </button>
          </div>
        </div>

        {/* Category Tabs: Primary, Promotions, Social, Updates */}
        {activeFolder === 'inbox' && (
          <div className="flex items-center border-b border-[#e0e3e7] bg-white text-xs font-semibold overflow-x-auto flex-shrink-0">
            <button
              onClick={() => setActiveCategory('primary')}
              className={`flex items-center gap-2 px-6 py-2.5 border-b-2 transition-colors ${
                activeCategory === 'primary'
                  ? 'border-[#0b57d0] text-[#0b57d0] font-bold'
                  : 'border-transparent text-[#444746] hover:bg-[#f6f8fc]'
              }`}
            >
              <Inbox size={15} />
              <span>Primary</span>
            </button>

            <button
              onClick={() => setActiveCategory('promotions')}
              className={`flex items-center gap-2 px-6 py-2.5 border-b-2 transition-colors ${
                activeCategory === 'promotions'
                  ? 'border-[#188038] text-[#188038] font-bold'
                  : 'border-transparent text-[#444746] hover:bg-[#f6f8fc]'
              }`}
            >
              <Tag size={15} />
              <span>Promotions</span>
            </button>

            <button
              onClick={() => setActiveCategory('social')}
              className={`flex items-center gap-2 px-6 py-2.5 border-b-2 transition-colors ${
                activeCategory === 'social'
                  ? 'border-[#b06000] text-[#b06000] font-bold'
                  : 'border-transparent text-[#444746] hover:bg-[#f6f8fc]'
              }`}
            >
              <Users size={15} />
              <span>Social</span>
            </button>

            <button
              onClick={() => setActiveCategory('updates')}
              className={`flex items-center gap-2 px-6 py-2.5 border-b-2 transition-colors ${
                activeCategory === 'updates'
                  ? 'border-[#7719aa] text-[#7719aa] font-bold'
                  : 'border-transparent text-[#444746] hover:bg-[#f6f8fc]'
              }`}
            >
              <AlertCircle size={15} />
              <span>Updates</span>
            </button>
          </div>
        )}

        {/* 3. Email Thread List or Full Message View */}
        <div className="flex-1 overflow-y-auto">
          {selectedEmail ? (
            /* Reading View */
            <div className="p-6 space-y-6 max-w-4xl mx-auto animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#e0e3e7]">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="px-3 py-1 bg-[#f2f2f2] hover:bg-[#e0e3e7] rounded-lg text-xs font-bold text-[#444746]"
                >
                  ← Back to {activeFolder}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => deleteEmail(selectedEmail.id)}
                    className="p-1.5 hover:bg-[#f2f2f2] rounded-full text-[#444746]"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Subject */}
              <h1 className="text-xl font-bold text-[#1f1f1f]">{selectedEmail.subject}</h1>

              {/* Sender Details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    style={{ background: selectedEmail.avatarColor }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xs"
                  >
                    {selectedEmail.from[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1f1f1f]">{selectedEmail.from}</p>
                    <p className="text-xs text-[#5e5e5e]">&lt;{selectedEmail.fromEmail}&gt; to me</p>
                  </div>
                </div>
                <span className="text-xs text-[#5e5e5e]">{selectedEmail.date}</span>
              </div>

              {/* Body */}
              <div className="text-sm text-[#1f1f1f] leading-relaxed whitespace-pre-line py-4 border-t border-b border-[#f2f2f2]">
                {selectedEmail.body}
              </div>

              {/* Quick Reply Box */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setComposeTo(selectedEmail.fromEmail);
                    setComposeSubject(`Re: ${selectedEmail.subject}`);
                    setShowCompose(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#f2f2f2] hover:bg-[#e0e3e7] text-[#1f1f1f] rounded-full text-xs font-bold"
                >
                  <Reply size={14} /> Reply
                </button>
                <button
                  onClick={() => {
                    setComposeSubject(`Fwd: ${selectedEmail.subject}`);
                    setComposeBody(`\n\n---------- Forwarded message ---------\n${selectedEmail.body}`);
                    setShowCompose(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#f2f2f2] hover:bg-[#e0e3e7] text-[#1f1f1f] rounded-full text-xs font-bold"
                >
                  <Forward size={14} /> Forward
                </button>
              </div>
            </div>
          ) : (
            /* Email List Table */
            <div className="divide-y divide-[#f2f2f2]">
              {filteredEmails.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#5e5e5e]">
                  No messages in this folder.
                </div>
              ) : (
                filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`flex items-center gap-3 px-4 py-2.5 hover:shadow-xs hover:border-l-4 hover:border-l-[#0b57d0] cursor-pointer transition-all ${
                      email.read ? 'bg-white text-[#444746]' : 'bg-[#f2f6fc] text-[#1f1f1f] font-bold'
                    }`}
                  >
                    {/* Star */}
                    <button
                      onClick={(e) => toggleStar(email.id, e)}
                      className="p-1 text-[#8a8886] hover:text-[#f59e0b]"
                    >
                      <Star
                        size={15}
                        className={email.starred ? 'fill-amber-400 text-amber-500' : ''}
                      />
                    </button>

                    {/* Sender */}
                    <span className="w-44 truncate text-xs">{email.from}</span>

                    {/* Subject & Snippet */}
                    <div className="flex-1 min-w-0 flex items-center gap-2 text-xs">
                      <span className="truncate">{email.subject}</span>
                      <span className="text-[#8a8886] font-normal truncate hidden sm:inline">
                        — {email.preview}
                      </span>
                    </div>

                    {/* Date */}
                    <span className="text-[11px] text-[#5e5e5e] font-normal flex-shrink-0">
                      {email.date}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Floating Google Compose Window (Bottom Right) */}
      {showCompose && (
        <div className="fixed bottom-0 right-8 w-[520px] bg-white rounded-t-xl shadow-2xl border border-[#d2d0ce] z-50 flex flex-col overflow-hidden animate-slide-in">
          {/* Compose Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#f2f6fc] border-b border-[#e0e3e7]">
            <span className="text-xs font-bold text-[#1f1f1f]">New Message</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowCompose(false)}
                className="p-1 hover:bg-[#e0e3e7] rounded text-[#444746]"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-3 space-y-2 flex-1 flex flex-col">
            <div className="flex items-center border-b border-[#f2f2f2] pb-1 text-xs">
              <span className="text-[#5e5e5e] w-12 font-medium">To:</span>
              <input
                type="email"
                placeholder="Recipients"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                className="flex-1 outline-none text-xs bg-transparent"
              />
            </div>

            <div className="flex items-center border-b border-[#f2f2f2] pb-1 text-xs">
              <span className="text-[#5e5e5e] w-12 font-medium">Subject:</span>
              <input
                type="text"
                placeholder="Subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                className="flex-1 outline-none text-xs bg-transparent font-medium"
              />
            </div>

            <textarea
              rows={10}
              placeholder="Write your email here..."
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              className="flex-1 w-full outline-none text-xs resize-none p-1 bg-transparent leading-relaxed"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#faf9f8] border-t border-[#e0e3e7]">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendEmail}
                className="px-5 py-1.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-bold text-xs shadow-xs transition-colors"
              >
                Send
              </button>

              {/* Yella Help Me Write */}
              <button
                onClick={handleAICompose}
                disabled={isComposingAI}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-full font-bold text-xs transition-colors"
              >
                <Sparkles size={13} className={isComposingAI ? 'animate-spin' : ''} />
                <span>Help me write</span>
              </button>
            </div>

            <button
              onClick={() => setShowCompose(false)}
              className="p-1.5 hover:bg-[#f2f2f2] rounded-full text-[#5e5e5e]"
              title="Discard Draft"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Google Account Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="w-[380px] bg-white rounded-xl shadow-2xl border border-[#edebe9] p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs">
                  G
                </div>
                <h3 className="text-sm font-bold text-[#201f1e]">Sign in with Google</h3>
              </div>
              <button onClick={() => setShowConnectModal(false)} className="text-[#8a8886] hover:text-[#201f1e]">
                <X size={15} />
              </button>
            </div>

            <p className="text-xs text-[#5e5e5e] leading-relaxed">
              Enter your Google Gmail address to link your mailbox directly into SG-Office:
            </p>

            <input
              type="email"
              placeholder="yourname@gmail.com"
              value={customEmailInput}
              onChange={(e) => setCustomEmailInput(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-[#d2d0ce] rounded-lg outline-none focus:border-red-500 font-medium"
            />

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-3 py-1 text-xs text-[#5e5e5e]"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectGoogle}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Authorize & Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
