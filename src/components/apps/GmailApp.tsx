import { useState } from 'react';
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
    sender: 'Google Cloud Platform',
    email: 'cloud-noreply@google.com',
    subject: 'Google Workspace API Credentials Active for SG-Office',
    snippet: 'Your OAuth 2.0 client credentials have been authorized. Gmail sync scopes [https://mail.google.com/] are verified...',
    body: `Hello Developer,

Your Google Workspace OAuth 2.0 client credentials have been authorized for SG-Office.

Project: SG-Office-Enterprise
Authorized Redirect URIs: http://localhost:5173/oauth2callback
Scopes Granted:
- https://www.googleapis.com/auth/gmail.readonly
- https://www.googleapis.com/auth/gmail.send
- https://www.googleapis.com/auth/gmail.compose

You can now send and receive real emails directly through your custom Google Workspace connection.

Sincerely,
Google Cloud Team`,
    date: '10:45 AM',
    unread: true,
    starred: true,
    category: 'primary',
  },
  {
    id: 'm2',
    sender: 'Sarah Chen',
    email: 'sarah.chen@techcorp.io',
    subject: 'Q4 Product Deliverables & Financial Model Review',
    snippet: 'Hey Shiva, please review the attached financial forecast in Excel. The growth trajectory looks solid...',
    body: `Hi Shiva,

Please review the attached financial forecast in Excel. The growth trajectory for our AI workspace is looking very strong.

I've tested the CSV parsing inside Yella AI and it handled 50,000 rows without any lag.

Let's discuss the presentation deck during our standup tomorrow.

Best,
Sarah`,
    date: '09:12 AM',
    unread: false,
    starred: true,
    category: 'primary',
  },
  {
    id: 'm3',
    sender: 'GitHub Notifications',
    email: 'notifications@github.com',
    subject: '[ShivaGanesh1080-ops/SG-Office] Repository deployment status: Success',
    snippet: 'Branch main has been successfully pushed and build verification passed with 0 warnings...',
    body: `GitHub Actions: Deployment Completed
Repository: ShivaGanesh1080-ops/SG-Office
Ref: refs/heads/main
Status: SUCCESS

All unit tests and Vite production builds compiled cleanly.`,
    date: 'Yesterday',
    unread: false,
    starred: false,
    category: 'social',
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

  // Google OAuth sign-in modal state
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleClientId, setGoogleClientId] = useState('');

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
    const newMsg: GmailMessage = {
      id: Date.now().toString(),
      sender: gmailAccount?.connected ? gmailAccount.name : 'Me',
      email: gmailAccount?.connected ? gmailAccount.email : 'user@gmail.com',
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
    toast.success('Message sent via Gmail');
  };

  const handleConnectGoogle = () => {
    if (!googleEmail) {
      toast.error('Please enter your Google/Gmail address');
      return;
    }
    const account = {
      email: googleEmail,
      name: googleEmail.split('@')[0],
      connected: true,
      clientId: googleClientId || '78912345678-sg-office.apps.googleusercontent.com',
    };
    setGmailAccount(account);
    setShowSignInModal(false);
    toast.success(`Google Account connected: ${googleEmail}`);
  };

  const handleDisconnectGoogle = () => {
    setGmailAccount(null);
    toast('Google Account disconnected');
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
      <div className="w-[200px] flex flex-col p-2.5 bg-[#f6f8fc] border-r border-[#e1e3e1] space-y-2 flex-shrink-0">
        {/* Google Compose Pill Button */}
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center gap-3 px-4 py-3 bg-[#c2e7ff] hover:bg-[#b3dbf5] hover:shadow-md text-[#001d35] rounded-2xl text-xs font-bold transition-all shadow-xs"
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
                className={`flex items-center justify-between w-full px-3 py-1.5 rounded-full text-xs transition-colors ${
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

        {/* Google Sign-in Card */}
        <div className="p-3 bg-white rounded-xl border border-[#e1e3e1] shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-[10px]">
              G
            </div>
            <span className="text-xs font-bold text-[#1f1f1f]">Google Account</span>
          </div>

          {gmailAccount?.connected ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-[#1e8e3e] flex items-center gap-1">
                <ShieldCheck size={13} /> Connected
              </p>
              <p className="text-[10px] text-[#444746] truncate">{gmailAccount.email}</p>
              <button
                onClick={handleDisconnectGoogle}
                className="w-full text-center py-1 text-[10px] text-red-600 hover:bg-red-50 rounded font-semibold border border-red-200"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className="text-[10px] text-[#444746]">
                Connect your real @gmail.com or Workspace account.
              </p>
              <button
                onClick={() => setShowSignInModal(true)}
                className="w-full py-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Sign in with Google</span>
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
              className="p-1.5 rounded-full hover:bg-[#e9eef6] text-[#444746]"
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={toggleAIPanel}
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200"
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
                className={`flex-1 py-2.5 px-4 text-left border-b-2 flex items-center gap-2 ${
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
                  className="px-2.5 py-1 text-xs font-semibold bg-[#f1f3f4] hover:bg-[#e8eaed] rounded-lg text-[#1f1f1f]"
                >
                  ← Back to Inbox
                </button>
                <h2 className="text-base font-bold text-[#1f1f1f]">{selectedMail.subject}</h2>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => deleteEmail(selectedMail.id)} className="p-1.5 rounded-full hover:bg-red-50 text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-xs">
                  {selectedMail.sender.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1f1f1f]">{selectedMail.sender}</p>
                  <p className="text-[11px] text-[#444746]">&lt;{selectedMail.email}&gt; • {selectedMail.date}</p>
                </div>
              </div>
              <button
                onClick={() => toggleStar(selectedMail.id)}
                className="p-1 rounded-full text-amber-500"
              >
                <Star size={16} fill={selectedMail.starred ? '#f59e0b' : 'none'} />
              </button>
            </div>

            <div className="p-5 bg-[#f8fafd] rounded-xl border border-[#e1e3e1] text-xs leading-relaxed whitespace-pre-line text-[#1f1f1f]">
              {selectedMail.body}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setTo(selectedMail.email);
                  setSubject(`Re: ${selectedMail.subject}`);
                  setBody(`Hi ${selectedMail.sender.split(' ')[0]},\n\nThank you for reaching out. I have reviewed this and agree to proceed.\n\nBest regards,\n${gmailAccount?.name || 'Shiva'}`);
                  setShowCompose(true);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#f1f3f4] hover:bg-[#e8eaed] rounded-full text-xs font-semibold text-[#1f1f1f]"
              >
                <Reply size={14} /> Reply
              </button>
              <button
                onClick={() => {
                  toast.success('Yella generated smart reply');
                  setTo(selectedMail.email);
                  setSubject(`Re: ${selectedMail.subject}`);
                  setBody('Sounds great! Let us connect on Google Meet tomorrow to finalize.');
                  setShowCompose(true);
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-200"
              >
                <Sparkles size={13} /> Yella Quick Reply
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-[#e1e3e1]">
            {filteredEmails.length > 0 ? (
              filteredEmails.map((mail) => (
                <div
                  key={mail.id}
                  onClick={() => setSelectedMail(mail)}
                  className={`flex items-center gap-3 px-4 py-2.5 hover:shadow-xs hover:bg-[#f2f6fc] cursor-pointer text-xs transition-colors ${
                    mail.unread ? 'bg-white font-bold text-[#1f1f1f]' : 'bg-[#fafafc] text-[#444746]'
                  }`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStar(mail.id); }}
                    className="text-[#c4c7c5] hover:text-amber-500 flex-shrink-0"
                  >
                    <Star size={16} fill={mail.starred ? '#f59e0b' : 'none'} className={mail.starred ? 'text-amber-500' : ''} />
                  </button>
                  <span className="w-40 truncate flex-shrink-0">{mail.sender}</span>
                  <div className="flex-1 truncate">
                    <span className="text-[#1f1f1f]">{mail.subject}</span>
                    <span className="text-[#747775] font-normal"> — {mail.snippet}</span>
                  </div>
                  <span className="text-[11px] text-[#747775] flex-shrink-0">{mail.date}</span>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-[#747775] text-xs">
                No emails in this folder.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Floating Google Compose Modal */}
      {showCompose && (
        <div className="fixed bottom-0 right-10 w-[520px] bg-white rounded-t-xl shadow-2xl border border-[#c4c7c5] z-50 flex flex-col overflow-hidden animate-slide-in">
          <div className="flex items-center justify-between px-4 py-2 bg-[#f2f6fc] border-b border-[#e1e3e1]">
            <span className="text-xs font-bold text-[#1f1f1f]">New Message</span>
            <button onClick={() => setShowCompose(false)} className="text-[#444746] hover:text-[#1f1f1f]">
              <X size={15} />
            </button>
          </div>
          <div className="p-3 space-y-2">
            <input
              type="text"
              placeholder="Recipients (To)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full text-xs px-2 py-1 border-b border-[#e1e3e1] outline-none"
            />
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-xs px-2 py-1 border-b border-[#e1e3e1] outline-none"
            />
            <textarea
              placeholder="Compose your email or let Yella draft it..."
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full text-xs p-2 outline-none resize-none leading-relaxed"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#f6f8fc] border-t border-[#e1e3e1]">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendEmail}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full text-xs font-bold shadow-xs"
              >
                <span>Send</span>
              </button>
              <button
                onClick={() => setBody(body + '\n\nBest regards,\n' + (gmailAccount?.name || 'Shiva Ganesh'))}
                className="flex items-center gap-1 px-2.5 py-1 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full text-[11px] font-semibold border border-purple-200"
              >
                <Sparkles size={12} /> Yella AI Polish
              </button>
            </div>
            <button onClick={() => setShowCompose(false)} className="text-[#444746] hover:text-red-600">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 4. Google Sign-In & Workspace Connect Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-[440px] bg-white rounded-2xl shadow-2xl p-6 border border-[#e1e3e1] space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-sm">
                G
              </div>
              <h3 className="text-base font-bold text-[#1f1f1f]">Sign in with Google</h3>
              <p className="text-xs text-[#747775]">Connect your Gmail account to SG-Office</p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-[#444746] block mb-1">Your Gmail Address</label>
                <input
                  type="email"
                  placeholder="e.g. shiva.ganesh@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-[#747775] rounded-lg outline-none focus:border-[#1a73e8]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#444746] block mb-1">
                  Google OAuth Client ID <span className="text-[#747775] font-normal">(Optional for custom API)</span>
                </label>
                <input
                  type="text"
                  placeholder="apps.googleusercontent.com"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-[#747775] rounded-lg outline-none focus:border-[#1a73e8]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setShowSignInModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-[#444746] hover:bg-[#f1f3f4] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectGoogle}
                className="flex-1 py-2 text-xs font-bold bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg shadow-xs"
              >
                Authorize & Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
