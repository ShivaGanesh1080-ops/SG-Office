import { create } from 'zustand';
import { AppState, AppType, Document, AIMessage } from '../types';

interface StoreActions {
  setCurrentApp: (app: AppType | null) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  addDocument: (doc: Document) => void;
  setActiveDocument: (doc: Document | null) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  toggleStarDocument: (id: string) => void;
  addAIMessage: (message: AIMessage) => void;
  clearAIMessages: () => void;
  toggleAIPanel: () => void;
  setSearchQuery: (query: string) => void;
  toggleSearch: () => void;
  
  // Custom user data for live editing
  activeDocContent: string;
  setActiveDocContent: (content: string) => void;
  activeDocTitle: string;
  setActiveDocTitle: (title: string) => void;
  
  spreadsheetData: Record<string, string>;
  setSpreadsheetData: (data: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  
  gmailAccount: { email: string; name: string; connected: boolean; clientId?: string } | null;
  setGmailAccount: (account: { email: string; name: string; connected: boolean; clientId?: string } | null) => void;
}

const initialSpreadsheet: Record<string, string> = {
  'A1': 'Item Description', 'B1': 'Category', 'C1': 'Unit Price ($)', 'D1': 'Units Sold', 'E1': 'Gross Total ($)', 'F1': 'Profit Margin',
  'A2': 'Cloud Infrastructure Pro', 'B2': 'Software', 'C2': '120', 'D2': '450', 'E2': '=C2*D2', 'F2': '65%',
  'A3': 'AI Assistant Annual Pass', 'B3': 'Subscription', 'C3': '240', 'D3': '320', 'E3': '=C3*D3', 'F3': '82%',
  'A4': 'Security Compliance Suite', 'B4': 'Enterprise', 'C4': '500', 'D4': '85', 'E4': '=C4*D4', 'F4': '70%',
  'A5': 'Developer API Compute', 'B5': 'Add-on', 'C5': '50', 'D5': '920', 'E5': '=C5*D5', 'F5': '55%',
  'A6': '', 'B6': '', 'C6': '', 'D6': '', 'E6': '', 'F6': '',
  'A7': 'Total Revenue', 'B7': '', 'C7': '', 'D7': '=SUM(D2:D5)', 'E7': '=SUM(E2:E5)', 'F7': 'Average Margin',
};

// Load saved data from localStorage if available
const loadSavedDocs = (): Document[] => {
  try {
    const saved = localStorage.getItem('sg_office_documents');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: 'doc-1',
      title: 'Project Roadmap 2027.docx',
      content: '<h1>Project Roadmap 2027</h1><p>Welcome to your personal SG-Office Word document. Start typing or ask Yella AI to write your content.</p>',
      createdAt: new Date(),
      updatedAt: new Date(),
      type: 'document',
      tags: ['Strategy'],
      starred: true,
    },
    {
      id: 'sheet-1',
      title: 'Annual Budget & Projections.xlsx',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      type: 'spreadsheet',
      tags: ['Finance'],
      starred: true,
    },
    {
      id: 'slide-1',
      title: 'Executive Pitch Deck.pptx',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      type: 'presentation',
      tags: ['Keynote'],
      starred: false,
    },
  ];
};

export const useStore = create<AppState & StoreActions>((set) => ({
  currentApp: null,
  sidebarCollapsed: false,
  theme: 'light',
  documents: loadSavedDocs(),
  activeDocument: null,
  aiMessages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am **Yella**, your personalized office AI assistant. I can:\n- ✍️ Create, edit, and format documents in **Word**\n- 📊 Parse CSV / Excel files, calculate formulas, and chart data in **Excel**\n- 🎨 Build complete presentation slides in **PowerPoint**\n- 📬 Compose and organize emails in **Gmail**\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ],
  aiPanelOpen: false,
  notifications: [],
  searchQuery: '',
  searchOpen: false,

  activeDocContent: '',
  setActiveDocContent: (content) => set({ activeDocContent: content }),
  activeDocTitle: 'Untitled Document.docx',
  setActiveDocTitle: (title) => set({ activeDocTitle: title }),

  spreadsheetData: (() => {
    try {
      const saved = localStorage.getItem('sg_office_sheet');
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialSpreadsheet;
  })(),
  setSpreadsheetData: (updater) =>
    set((state) => {
      const newData = typeof updater === 'function' ? updater(state.spreadsheetData) : updater;
      try { localStorage.setItem('sg_office_sheet', JSON.stringify(newData)); } catch {}
      return { spreadsheetData: newData };
    }),

  gmailAccount: (() => {
    try {
      const saved = localStorage.getItem('sg_office_gmail');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  })(),
  setGmailAccount: (acc) => {
    try { localStorage.setItem('sg_office_gmail', JSON.stringify(acc)); } catch {}
    set({ gmailAccount: acc });
  },

  setCurrentApp: (app) => set({ currentApp: app }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  addDocument: (doc) =>
    set((state) => {
      const updated = [doc, ...state.documents];
      try { localStorage.setItem('sg_office_documents', JSON.stringify(updated)); } catch {}
      return { documents: updated };
    }),
  setActiveDocument: (doc) => set({ activeDocument: doc }),
  updateDocument: (id, updates) =>
    set((state) => {
      const updated = state.documents.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d));
      try { localStorage.setItem('sg_office_documents', JSON.stringify(updated)); } catch {}
      return { documents: updated };
    }),
  deleteDocument: (id) =>
    set((state) => {
      const updated = state.documents.filter((d) => d.id !== id);
      try { localStorage.setItem('sg_office_documents', JSON.stringify(updated)); } catch {}
      return {
        documents: updated,
        activeDocument: state.activeDocument?.id === id ? null : state.activeDocument,
      };
    }),
  toggleStarDocument: (id) =>
    set((state) => {
      const updated = state.documents.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d));
      try { localStorage.setItem('sg_office_documents', JSON.stringify(updated)); } catch {}
      return { documents: updated };
    }),
  addAIMessage: (message) => set((state) => ({ aiMessages: [...state.aiMessages, message] })),
  clearAIMessages: () =>
    set({
      aiMessages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: "Chat cleared! I'm Yella. Ask me to draft a document, analyze a CSV/Excel file, or generate a presentation.",
          timestamp: new Date(),
        },
      ],
    }),
  toggleAIPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
}));
