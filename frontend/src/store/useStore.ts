import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  role: string;
  profile?: any;
}

interface VoicePreferences {
  enabled: boolean;
  autoRead: boolean;
  speed: number;
  readNotifications: boolean;
  globalMute: boolean;
  selectedVoiceId: string;
  voiceIntensity: number;
}

interface AppState {
  user: User | null;
  token: string | null;
  voicePreferences: VoicePreferences;
  selectedCourse: any | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setSelectedCourse: (course: any | null) => void;
  logout: () => void;
  updateVoicePreferences: (prefs: Partial<VoicePreferences>) => void;
}

// Load initial voice preferences from localStorage
const getInitialVoicePreferences = (): VoicePreferences => {
  const stored = localStorage.getItem('voicePreferences');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse voice preferences', e);
    }
  }
  return {
    enabled: true,
    autoRead: false,
    speed: 1.0,
    readNotifications: true,
    globalMute: false,
    selectedVoiceId: "EXAVITQu4vr4xnSDxMaL", // Default to Sarah
    voiceIntensity: 0.2 // Default style exaggeration
  };
};

export const useStore = create<AppState>()((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  voicePreferences: getInitialVoicePreferences(),
  selectedCourse: null,
  
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  updateVoicePreferences: (prefs) => set((state) => {
    const newPrefs = { ...state.voicePreferences, ...prefs };
    localStorage.setItem('voicePreferences', JSON.stringify(newPrefs));
    return { voicePreferences: newPrefs };
  })
}));
