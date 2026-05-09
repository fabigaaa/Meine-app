import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'app_settings';

export interface AppSettings {
  // Aussehen
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';

  // Kalender
  weekStartsOn: 0 | 1;           // 0 = Sonntag, 1 = Montag
  defaultEventDuration: number;  // Minuten
  defaultReminderMinutes: number; // 0 = keine

  // Benachrichtigungen
  notificationsEnabled: boolean;
  dailySummaryEnabled: boolean;

  // KI-Assistent
  anthropicApiKey: string;
  aiModel: string;

  // Aufgaben
  hideCompletedTodos: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  accentColor: '#4F46E5',
  fontSize: 'medium',
  weekStartsOn: 1,
  defaultEventDuration: 60,
  defaultReminderMinutes: 15,
  notificationsEnabled: true,
  dailySummaryEnabled: false,
  anthropicApiKey: '',
  aiModel: 'claude-sonnet-4-6',
  hideCompletedTodos: false,
};

interface SettingsState extends AppSettings {
  isLoaded: boolean;
  load: () => Promise<void>;
  update: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetAll: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<AppSettings>;
        set({ ...DEFAULT_SETTINGS, ...saved, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  update: async (key, value) => {
    set({ [key]: value } as Partial<SettingsState>);
    const s = get();
    const toSave: AppSettings = {
      accentColor: s.accentColor,
      fontSize: s.fontSize,
      weekStartsOn: s.weekStartsOn,
      defaultEventDuration: s.defaultEventDuration,
      defaultReminderMinutes: s.defaultReminderMinutes,
      notificationsEnabled: s.notificationsEnabled,
      dailySummaryEnabled: s.dailySummaryEnabled,
      anthropicApiKey: s.anthropicApiKey,
      aiModel: s.aiModel,
      hideCompletedTodos: s.hideCompletedTodos,
    };
    toSave[key] = value;
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(toSave));
  },

  resetAll: async () => {
    await AsyncStorage.removeItem(SETTINGS_KEY);
    set({ ...DEFAULT_SETTINGS });
  },
}));
