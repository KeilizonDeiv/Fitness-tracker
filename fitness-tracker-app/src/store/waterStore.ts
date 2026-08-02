import { create } from 'zustand';
import { WaterLog } from '@/types';
import { AsyncStorageRepository, STORAGE_KEYS } from '@/services/storageService';
import { generateId } from '@/utils/id';
import { todayISO } from '@/utils/date';

const repo = new AsyncStorageRepository<WaterLog>(STORAGE_KEYS.water);

interface WaterState {
  logs: WaterLog[];
  isLoading: boolean;
  hydrate: () => Promise<void>;
  addLog: (amountMl: number) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
}

export const useWaterStore = create<WaterState>((set, get) => ({
  logs: [],
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    const logs = await repo.getAll();
    set({ logs, isLoading: false });
  },

  addLog: async (amountMl) => {
    const log: WaterLog = { id: generateId(), date: todayISO(), amountMl, createdAt: todayISO() };
    await repo.create(log);
    set((state) => ({ logs: [log, ...state.logs] }));
  },

  removeLog: async (id) => {
    await repo.remove(id);
    set((state) => ({ logs: state.logs.filter((l) => l.id !== id) }));
  },
}));
