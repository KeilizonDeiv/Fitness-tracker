import { create } from 'zustand';
import { BodyMetric } from '@/types';
import { AsyncStorageRepository, STORAGE_KEYS } from '@/services/storageService';
import { generateId } from '@/utils/id';
import { todayISO } from '@/utils/date';

const repo = new AsyncStorageRepository<BodyMetric>(STORAGE_KEYS.metrics);

interface MetricsState {
  metrics: BodyMetric[];
  isLoading: boolean;
  hydrate: () => Promise<void>;
  addMetric: (data: Omit<BodyMetric, 'id' | 'createdAt'>) => Promise<void>;
  updateMetric: (id: string, patch: Partial<BodyMetric>) => Promise<void>;
  deleteMetric: (id: string) => Promise<void>;
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  metrics: [],
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    const metrics = await repo.getAll();
    set({ metrics, isLoading: false });
  },

  addMetric: async (data) => {
    const metric: BodyMetric = { ...data, id: generateId(), createdAt: todayISO() };
    await repo.create(metric);
    set((state) => ({ metrics: [metric, ...state.metrics] }));
  },

  updateMetric: async (id, patch) => {
    const updated = await repo.update(id, patch);
    if (!updated) return;
    set((state) => ({
      metrics: state.metrics.map((m) => (m.id === id ? updated : m)),
    }));
  },

  deleteMetric: async (id) => {
    await repo.remove(id);
    set((state) => ({ metrics: state.metrics.filter((m) => m.id !== id) }));
  },
}));
