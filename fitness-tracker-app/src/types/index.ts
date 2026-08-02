// ---- Core domain models ----

export interface SetEntry {
  id: string;
  reps: number;
  weightKg: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: SetEntry[];
}

export type WorkoutCategory =
  | 'strength'
  | 'cardio'
  | 'flexibility'
  | 'sports'
  | 'other';

export interface Workout {
  id: string;
  name: string;
  category: WorkoutCategory;
  date: string; // ISO string
  durationMin: number;
  caloriesBurned: number;
  exercises: Exercise[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BodyMetric {
  id: string;
  date: string; // ISO string
  weightKg: number;
  bodyFatPct?: number;
  notes?: string;
  createdAt: string;
}

export interface WaterLog {
  id: string;
  date: string; // ISO string (day-level, yyyy-mm-dd used for grouping)
  amountMl: number;
  createdAt: string;
}

export type GoalType = 'weight_target' | 'weekly_workouts' | 'daily_water_ml';

export interface Goal {
  id: string;
  type: GoalType;
  label: string;
  target: number;
  deadline?: string; // ISO date
  createdAt: string;
}

export interface UserProfile {
  name: string;
  heightCm: number;
  startingWeightKg: number;
  weeklyWorkoutTarget: number;
  dailyWaterTargetMl: number;
  hasOnboarded: boolean;
}

// ---- Generic CRUD contract used by the storage layer ----
export interface Repository<T extends { id: string }> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | undefined>;
  create(item: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T | undefined>;
  remove(id: string): Promise<void>;
}
