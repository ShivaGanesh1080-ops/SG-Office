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
}

const sampleDocuments: Document[] = [
  {
    id: '1',
    title: 'Project Proposal - Q4 2024',
    content: '<h1>Project Proposal</h1><p>This is a comprehensive proposal for our Q4 initiatives...</p>',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-15'),
    type: 'document',
    tags: ['work', 'proposal'],
    starred: true,
  },
  {
    id: '2',
    title: 'Financial Report',
    content: '',
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-10-10'),
    type: 'spreadsheet',
    tags: ['finance'],
    starred: false,
  },
  {
    id: '3',
    title: 'Team Meeting Slides',
    content: '',
    createdAt: new Date('2024-10-05'),
    updatedAt: new Date('2024-10-12'),
    type: 'presentation',
    tags: ['meeting'],
    starred: true,
  },
  {
    id: '4',
    title: 'Design Ideas',
    content: '# Design Ideas\n\n- New color scheme\n- Updated typography\n- Modern layout concepts',
    createdAt: new Date('2024-10-08'),
    updatedAt: new Date('2024-10-14'),
    type: 'note',
    tags: ['design'],
    starred: false,
  },
  {
    id: '5',
    title: 'API Integration Script',
    content: 'const fetchData = async () => {\n  const res = await fetch("/api/data");\n  return res.json();\n};',
    createdAt: new Date('2024-10-10'),
    updatedAt: new Date('2024-10-16'),
    type: 'code',
    tags: ['development'],
    starred: false,
  },
];

export const useStore = create<AppState & StoreActions>((set) => ({
  currentApp: null,
  sidebarCollapsed: false,
  theme: 'dark',
  documents: sampleDocuments,
  activeDocument: null,
  aiMessages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm Nova AI, your intelligent assistant. I can help you write documents, analyze data, create presentations, generate code, and much more. What would you like to do?",
      timestamp: new Date(),
    }
  ],
  aiPanelOpen: false,
  notifications: [],
  searchQuery: '',
  searchOpen: false,

  setCurrentApp: (app) => set({ currentApp: app }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  setActiveDocument: (doc) => set({ activeDocument: doc }),
  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date() } : d
      ),
    })),
  deleteDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      activeDocument: state.activeDocument?.id === id ? null : state.activeDocument,
    })),
  toggleStarDocument: (id) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, starred: !d.starred } : d
      ),
    })),
  addAIMessage: (message) =>
    set((state) => ({ aiMessages: [...state.aiMessages, message] })),
  clearAIMessages: () =>
    set({
      aiMessages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: "Chat cleared! I'm ready to help you with anything. What would you like to do?",
          timestamp: new Date(),
        },
      ],
    }),
  toggleAIPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
}));
