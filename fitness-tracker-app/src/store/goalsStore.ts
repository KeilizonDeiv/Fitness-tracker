import { create } from 'zustand';
import { Goal } from '@/types';
import { AsyncStorageRepository, STORAGE_KEYS } from '@/services/storageService';
import { generateId } from '@/utils/id';
import { todayISO } from '@/utils/date';

const repo = new AsyncStorageRepository<Goal>(STORAGE_KEYS.goals);

interface GoalsState {
  goals: Goal[];
  isLoading: boolean;
  hydrate: () => Promise<void>;
  addGoal: (data: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, patch: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    const goals = await repo.getAll();
    set({ goals, isLoading: false });
  },

  addGoal: async (data) => {
    const goal: Goal = { ...data, id: generateId(), createdAt: todayISO() };
    await repo.create(goal);
    set((state) => ({ goals: [goal, ...state.goals] }));
  },

  updateGoal: async (id, patch) => {
    const updated = await repo.update(id, patch);
    if (!updated) return;
    set((state) => ({ goals: state.goals.map((g) => (g.id === id ? updated : g)) }));
  },

  deleteGoal: async (id) => {
    await repo.remove(id);
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },
}));
