import { create } from 'zustand';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/services/storageService';
import { UnitSystem } from '@/utils/units';
import {
  cancelWaterReminders,
  cancelWorkoutReminders,
  scheduleWaterReminders,
  scheduleWorkoutReminders,
} from '@/services/notificationService';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'fil' | 'ja';

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fil', label: 'Filipino' },
  { code: 'ja', label: '日本語' },
];

interface Settings {
  themeMode: ThemeMode;
  language: Language;
  units: UnitSystem;
  waterRemindersEnabled: boolean;
  workoutRemindersEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  themeMode: 'system',
  language: 'en',
  units: 'metric',
  waterRemindersEnabled: false,
  workoutRemindersEnabled: false,
};

interface SettingsState {
  settings: Settings;
  systemScheme: 'light' | 'dark';
  isLoading: boolean;
  hydrate: () => Promise<void>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
  setUnits: (units: UnitSystem) => Promise<void>;
  setWaterRemindersEnabled: (enabled: boolean) => Promise<boolean>;
  setWorkoutRemindersEnabled: (enabled: boolean) => Promise<boolean>;
}

const persist = (settings: Settings) =>
  AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  systemScheme: Appearance.getColorScheme() === 'light' ? 'light' : 'dark',
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.settings);
      const settings = raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
      set({ settings, isLoading: false });
    } catch {
      set({ settings: DEFAULT_SETTINGS, isLoading: false });
    }

    Appearance.addChangeListener(({ colorScheme }) => {
      set({ systemScheme: colorScheme === 'light' ? 'light' : 'dark' });
    });
  },

  setThemeMode: async (themeMode) => {
    const next = { ...get().settings, themeMode };
    await persist(next);
    set({ settings: next });
  },

  setLanguage: async (language) => {
    const next = { ...get().settings, language };
    await persist(next);
    set({ settings: next });
  },

  setUnits: async (units) => {
    const next = { ...get().settings, units };
    await persist(next);
    set({ settings: next });
  },

  // Returns the enabled state that actually took effect (permission may be denied).
  setWaterRemindersEnabled: async (enabled) => {
    const granted = enabled ? await scheduleWaterReminders() : await cancelWaterReminders();
    const next = { ...get().settings, waterRemindersEnabled: enabled && granted };
    await persist(next);
    set({ settings: next });
    return next.waterRemindersEnabled;
  },

  setWorkoutRemindersEnabled: async (enabled) => {
    const granted = enabled ? await scheduleWorkoutReminders() : await cancelWorkoutReminders();
    const next = { ...get().settings, workoutRemindersEnabled: enabled && granted };
    await persist(next);
    set({ settings: next });
    return next.workoutRemindersEnabled;
  },
}));

export function useResolvedThemeMode(): 'light' | 'dark' {
  const themeMode = useSettingsStore((s) => s.settings.themeMode);
  const systemScheme = useSettingsStore((s) => s.systemScheme);
  return themeMode === 'system' ? systemScheme : themeMode;
}
