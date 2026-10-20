import { useState } from 'react';
import {
  Mail,
  Inbox,
  Send,
  FileEdit,
  Trash2,
  AlertTriangle,
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
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  folder: string;
  avatar: string;
  labels: string[];
}

const sampleEmails: EmailData[] = [
  {
    id: '1',
    from: 'Sarah Chen (VP Engineering)',
    fromEmail: 'sarah.chen@enterprise.io',
    to: 'me',
    subject: 'Approved: SG-Office 365 Architecture Blueprint',
    preview: 'Hi Shiva, I reviewed the updated SG-Office 365 design. The clean Microsoft Office Ribbon and clean white UI look fantastic...',
    body: `Hi Shiva,

I reviewed the updated SG-Office 365 design. The clean Microsoft Office Ribbon and clean white UI look fantastic. It provides the exact familiarity of Office 365 while significantly outperforming it with embedded Copilot intelligence.

Key approvals:
1. Universal Command Palette (Ctrl+K)
2. Zero-telemetry on-device encryption
3. Cross-document intelligence across Word, Excel, and PowerPoint

Please proceed with repository deployment to GitHub (SG-Office).

Warm regards,
Sarah Chen
VP Engineering`,
    date: '10:32 AM',
    read: false,
    starred: true,
    folder: 'inbox',
    avatar: 'SC',
    labels: ['High Priority'],
  },
  {
    id: '2',
    from: 'Elena Rostova',
    fromEmail: 'elena@vcfund.capital',
    to: 'me',
    subject: 'Investment Partnership & Enterprise Rollout',
    preview: 'Hi Shiva, our team was deeply impressed with the responsiveness of your office suite...',
    body: `Hi Shiva,

Our team was deeply impressed with the responsiveness of your office suite. Having local Copilot intelligence with no data leakage is a top priority for our institutional partners.

Looking forward to our sync on Thursday.

Best,
Elena`,
    date: 'Yesterday',
    read: true,
    starred: true,
    folder: 'inbox',
    avatar: 'ER',
    labels: ['Partnership'],
  },
];

export function EmailApp() {
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(sampleEmails[0]);
  const [showCompose, setShowCompose] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [emails, setEmails] = useState(sampleEmails);

  const handleSend = () => {
    if (!composeTo || !composeSubject) {
      toast.error('Recipient and Subject are required');
      return;
    }
    const newMail: EmailData = {
      id: Date.now().toString(),
      from: 'Shiva Ganesh',
      fromEmail: 'shiva@sgoffice.com',
      to: composeTo,
      subject: composeSubject,
      preview: composeBody.slice(0, 80),
      body: composeBody,
      date: 'Just now',
      read: true,
      starred: false,
      folder: 'sent',
      avatar: 'SG',
      labels: ['Sent'],
    };
    setEmails([newMail, ...emails]);
    setShowCompose(false);
    toast.success('Email dispatched via Outlook Gateway');
  };

  return (
    <div className="flex h-full bg-white select-none text-[#201f1e]">
      {/* 1. Outlook Folder Rail */}
      <div className="w-[180px] bg-[#f3f2f1] border-r border-[#edebe9] p-3 space-y-1">
        <button
          onClick={() => setShowCompose(true)}
          className="flex items-center justify-center gap-2 w-full py-2 rounded-md bg-[#0078d4] hover:bg-[#005a9e] text-white text-xs font-semibold mb-3 shadow-xs"
        >
          <Plus size={15} /> New mail
        </button>
        {[
          { label: 'Inbox', icon: <Inbox size={15} />, count: 2 },
          { label: 'Starred', icon: <Star size={15} />, count: 1 },
          { label: 'Sent Items', icon: <Send size={15} />, count: 12 },
          { label: 'Drafts', icon: <FileEdit size={15} />, count: 1 },
          { label: 'Deleted Items', icon: <Trash2 size={15} />, count: 0 },
        ].map((f) => (
          <div
            key={f.label}
            className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-[#edebe9] text-xs font-medium text-[#605e5c] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {f.icon}
              <span>{f.label}</span>
            </div>
            {f.count > 0 && <span className="text-[10px] font-bold text-[#0078d4]">{f.count}</span>}
          </div>
        ))}
      </div>

      {/* 2. Message List */}
      <div className="w-[320px] border-r border-[#edebe9] flex flex-col bg-white">
        <div className="p-2.5 border-b border-[#edebe9] bg-[#faf9f8]">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-[#d2d0ce] rounded-md text-xs">
            <Search size={14} className="text-[#8a8886]" />
            <input type="text" placeholder="Search Outlook..." className="w-full bg-transparent outline-none text-xs" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-[#edebe9]">
          {emails.map((mail) => (
            <div
              key={mail.id}
              onClick={() => setSelectedEmail(mail)}
              className={`p-3 cursor-pointer transition-colors ${
                selectedEmail?.id === mail.id
                  ? 'bg-[#e8f0fe] border-l-4 border-l-[#0078d4]'
                  : 'hover:bg-[#f8f9fa]'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs ${!mail.read ? 'font-bold text-[#0078d4]' : 'font-semibold text-[#201f1e]'}`}>
                  {mail.from}
                </span>
                <span className="text-[10px] text-[#8a8886]">{mail.date}</span>
              </div>
              <p className="text-xs font-medium text-[#201f1e] truncate mb-0.5">{mail.subject}</p>
              <p className="text-[11px] text-[#605e5c] line-clamp-2">{mail.preview}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Message Body */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedEmail ? (
          <>
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#edebe9] bg-[#faf9f8]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setComposeTo(selectedEmail.fromEmail);
                    setComposeSubject(`Re: ${selectedEmail.subject}`);
                    setComposeBody(`Hi ${selectedEmail.from.split(' ')[0]},\n\nThank you for the update.\n\nBest regards,\nShiva Ganesh`);
                    setShowCompose(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#d2d0ce] hover:bg-[#edebe9] rounded text-xs font-semibold text-[#201f1e]"
                >
                  <Reply size={13} /> Reply
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#d2d0ce] hover:bg-[#edebe9] rounded text-xs font-semibold text-[#201f1e]">
                  <Forward size={13} /> Forward
                </button>
              </div>
              <button
                onClick={() => toast.success('Copilot drafted instant reply')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold copilot-gradient text-white"
              >
                <Sparkles size={12} /> Copilot Quick Reply
              </button>
            </div>

            <div className="p-8 space-y-6 flex-1 overflow-y-auto">
              <div>
                <h2 className="text-xl font-bold text-[#201f1e] mb-3">{selectedEmail.subject}</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0078d4] text-white flex items-center justify-center font-bold text-xs">
                    {selectedEmail.avatar}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#201f1e] block">{selectedEmail.from}</span>
                    <span className="text-[11px] text-[#8a8886] block">&lt;{selectedEmail.fromEmail}&gt; • {selectedEmail.date}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border border-[#edebe9] rounded-lg shadow-xs text-xs leading-relaxed whitespace-pre-line text-[#201f1e]">
                {selectedEmail.body}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#8a8886] text-xs">
            Select a message to read
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-[600px] bg-white rounded-lg shadow-2xl border border-[#edebe9] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0078d4] text-white">
              <span className="text-xs font-bold">New Message - Outlook</span>
              <button onClick={() => setShowCompose(false)}><X size={16} /></button>
            </div>
            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="To:"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-[#d2d0ce] rounded outline-none focus:border-[#0078d4]"
              />
              <input
                type="text"
                placeholder="Subject:"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-[#d2d0ce] rounded outline-none focus:border-[#0078d4]"
              />
              <textarea
                placeholder="Type your email or let Copilot write it..."
                rows={9}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#d2d0ce] rounded outline-none resize-none focus:border-[#0078d4]"
              />
            </div>
            <div className="flex justify-between items-center px-4 py-2.5 bg-[#faf9f8] border-t border-[#edebe9]">
              <button
                onClick={() => setComposeBody(composeBody + '\n\nLooking forward to hearing from you.\nBest regards,\nShiva Ganesh')}
                className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold text-[#8a44f8] hover:bg-purple-50"
              >
                <Sparkles size={12} /> Copilot Polish
              </button>
              <button
                onClick={handleSend}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0078d4] hover:bg-[#005a9e] text-white rounded text-xs font-semibold"
              >
                <Send size={13} /> Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
