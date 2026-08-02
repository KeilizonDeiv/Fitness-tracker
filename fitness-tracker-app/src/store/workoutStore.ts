import { create } from 'zustand';
import { Workout, Exercise, SetEntry } from '@/types';
import { AsyncStorageRepository, STORAGE_KEYS } from '@/services/storageService';
import { generateId } from '@/utils/id';
import { todayISO } from '@/utils/date';

const repo = new AsyncStorageRepository<Workout>(STORAGE_KEYS.workouts);

interface WorkoutState {
  workouts: Workout[];
  isLoading: boolean;
  hydrate: () => Promise<void>;

  // Workout-level CRUD
  addWorkout: (data: Omit<Workout, 'id' | 'createdAt' | 'updatedAt' | 'exercises'>) => Promise<Workout>;
  updateWorkout: (id: string, patch: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  getWorkout: (id: string) => Workout | undefined;

  // Nested exercise CRUD
  addExercise: (workoutId: string, name: string) => Promise<void>;
  removeExercise: (workoutId: string, exerciseId: string) => Promise<void>;

  // Nested set CRUD
  addSet: (workoutId: string, exerciseId: string, reps: number, weightKg: number) => Promise<void>;
  updateSet: (workoutId: string, exerciseId: string, setId: string, patch: Partial<SetEntry>) => Promise<void>;
  removeSet: (workoutId: string, exerciseId: string, setId: string) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  workouts: [],
  isLoading: false,

  hydrate: async () => {
    set({ isLoading: true });
    const workouts = await repo.getAll();
    set({ workouts, isLoading: false });
  },

  addWorkout: async (data) => {
    const now = todayISO();
    const workout: Workout = {
      ...data,
      id: generateId(),
      exercises: [],
      createdAt: now,
      updatedAt: now,
    };
    await repo.create(workout);
    set((state) => ({ workouts: [workout, ...state.workouts] }));
    return workout;
  },

  updateWorkout: async (id, patch) => {
    const updated = await repo.update(id, { ...patch, updatedAt: todayISO() });
    if (!updated) return;
    set((state) => ({
      workouts: state.workouts.map((w) => (w.id === id ? updated : w)),
    }));
  },

  deleteWorkout: async (id) => {
    await repo.remove(id);
    set((state) => ({ workouts: state.workouts.filter((w) => w.id !== id) }));
  },

  getWorkout: (id) => get().workouts.find((w) => w.id === id),

  addExercise: async (workoutId, name) => {
    const workout = get().getWorkout(workoutId);
    if (!workout) return;
    const exercise: Exercise = { id: generateId(), name, sets: [] };
    await get().updateWorkout(workoutId, {
      exercises: [...workout.exercises, exercise],
    });
  },

  removeExercise: async (workoutId, exerciseId) => {
    const workout = get().getWorkout(workoutId);
    if (!workout) return;
    await get().updateWorkout(workoutId, {
      exercises: workout.exercises.filter((e) => e.id !== exerciseId),
    });
  },

  addSet: async (workoutId, exerciseId, reps, weightKg) => {
    const workout = get().getWorkout(workoutId);
    if (!workout) return;
    const newSet: SetEntry = { id: generateId(), reps, weightKg };
    const exercises = workout.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex
    );
    await get().updateWorkout(workoutId, { exercises });
  },

  updateSet: async (workoutId, exerciseId, setId, patch) => {
    const workout = get().getWorkout(workoutId);
    if (!workout) return;
    const exercises = workout.exercises.map((ex) =>
      ex.id === exerciseId
        ? {
            ...ex,
            sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
          }
        : ex
    );
    await get().updateWorkout(workoutId, { exercises });
  },

  removeSet: async (workoutId, exerciseId, setId) => {
    const workout = get().getWorkout(workoutId);
    if (!workout) return;
    const exercises = workout.exercises.map((ex) =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
        : ex
    );
    await get().updateWorkout(workoutId, { exercises });
  },
}));
