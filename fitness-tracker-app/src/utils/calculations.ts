import { Workout, BodyMetric, WaterLog } from '@/types';
import { isSameDay, startOfWeekISO, dayKey } from './date';

export function totalVolumeKg(workout: Workout): number {
  return workout.exercises.reduce((sum, ex) => {
    const exVolume = ex.sets.reduce((s, set) => s + set.reps * set.weightKg, 0);
    return sum + exVolume;
  }, 0);
}

export function totalSets(workout: Workout): number {
  return workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
}

export function workoutsThisWeek(workouts: Workout[]): number {
  const weekStart = startOfWeekISO();
  return workouts.filter((w) => w.date >= weekStart).length;
}

export function currentStreakDays(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;
  const sortedDays = Array.from(
    new Set(workouts.map((w) => dayKey(w.date)))
  ).sort((a, b) => (a < b ? 1 : -1));

  let streak = 0;
  let cursor = new Date();

  for (const day of sortedDays) {
    const cursorKey = dayKey(cursor.toISOString());
    if (day === cursorKey) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (streak === 0 && day === dayKey(new Date(Date.now() - 86400000).toISOString())) {
      // allow "yesterday" to still count as an active streak start
      streak += 1;
      cursor = new Date(day);
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function latestWeight(metrics: BodyMetric[]): BodyMetric | undefined {
  return [...metrics].sort((a, b) => (a.date > b.date ? -1 : 1))[0];
}

export function weightChangeKg(metrics: BodyMetric[]): number | undefined {
  if (metrics.length < 2) return undefined;
  const sorted = [...metrics].sort((a, b) => (a.date > b.date ? -1 : 1));
  return sorted[0].weightKg - sorted[sorted.length - 1].weightKg;
}

export function waterTodayMl(logs: WaterLog[]): number {
  const now = new Date().toISOString();
  return logs
    .filter((l) => isSameDay(l.date, now))
    .reduce((sum, l) => sum + l.amountMl, 0);
}

export function bmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}
