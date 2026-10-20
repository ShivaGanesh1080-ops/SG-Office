// Document types
export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  type: 'document' | 'spreadsheet' | 'presentation' | 'note' | 'code';
  tags: string[];
  starred: boolean;
}

// Spreadsheet types
export interface CellData {
  value: string;
  formula?: string;
  format?: CellFormat;
  type: 'text' | 'number' | 'formula' | 'date';
}

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
}

export interface SpreadsheetData {
  cells: Record<string, CellData>;
  columnWidths: Record<number, number>;
  rowHeights: Record<number, number>;
}

// Presentation types
export interface Slide {
  id: string;
  elements: SlideElement[];
  background: string;
  transition: 'none' | 'fade' | 'slide' | 'zoom';
  notes: string;
}

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'chart';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  style: Record<string, string | number>;
}

// AI types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface AICapability {
  id: string;
  name: string;
  description: string;
  icon: string;
  action: string;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  description: string;
  allDay: boolean;
}

// Mail types
export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: Date;
  read: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam';
  attachments: string[];
}

// Store types
export interface AppState {
  currentApp: AppType | null;
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  documents: Document[];
  activeDocument: Document | null;
  aiMessages: AIMessage[];
  aiPanelOpen: boolean;
  notifications: Notification[];
  searchQuery: string;
  searchOpen: boolean;
}

export type AppType = 
  | 'dashboard'
  | 'document' 
  | 'spreadsheet' 
  | 'presentation' 
  | 'email' 
  | 'calendar' 
  | 'notes' 
  | 'code-editor'
  | 'pdf'
  | 'whiteboard'
  | 'ai-chat'
  | 'settings';

export interface AppInfo {
  id: AppType;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
}
