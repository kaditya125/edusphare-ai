export type ViewState = 'landing' | 'chat' | 'knowledge' | 'faculty' | 'notices' | 'dashboard' | 'admin' | 'calendar' | 'settings' | 'ilearn';

export interface User {
  id: string;
  name: string;
  role: 'student' | 'admin' | 'faculty';
  avatar: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: {
    id: string;
    text: string;
    source: string;
  }[];
}

export interface Faculty {
  id: string;
  name: string;
  designation: string;
  department: string;
  researchInterests: string[];
  email: string;
  location: string;
  status: 'available' | 'busy' | 'offline';
  avatar: string;
}

export interface Notice {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  pinned: boolean;
}

export interface Document {
  id: string;
  name: string;
  uploadDate: string;
  size: string;
  pages: number;
  status: 'ready' | 'processing' | 'failed';
}
