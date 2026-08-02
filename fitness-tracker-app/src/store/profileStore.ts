import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/types';
import { STORAGE_KEYS } from '@/services/storageService';

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  heightCm: 170,
  startingWeightKg: 70,
  weeklyWorkoutTarget: 4,
  dailyWaterTargetMl: 2500,
  hasOnboarded: false,
};

interface ProfileState {
  profile: UserProfile;
  isLoading: boolean;
  hydrate: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: DEFAULT_PROFILE,
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.profile);
      const profile = raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
      set({ profile, isLoading: false });
    } catch {
      set({ profile: DEFAULT_PROFILE, isLoading: false });
    }
  },

  updateProfile: async (patch) => {
    const next = { ...get().profile, ...patch };
    await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(next));
    set({ profile: next });
  },
}));
