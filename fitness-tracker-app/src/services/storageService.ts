import AsyncStorage from '@react-native-async-storage/async-storage';
import { Repository } from '@/types';

/**
 * Generic repository over AsyncStorage.
 * Every domain store (workouts, metrics, water, goals) composes this instead
 * of re-implementing read/write/parse logic. Keeps CRUD behavior identical
 * and testable in one place.
 */
export class AsyncStorageRepository<T extends { id: string }>
  implements Repository<T>
{
  constructor(private readonly storageKey: string) {}

  private async readAll(): Promise<T[]> {
    try {
      const raw = await AsyncStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch (err) {
      console.warn(`[storage] failed to read ${this.storageKey}`, err);
      return [];
    }
  }

  private async writeAll(items: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (err) {
      console.warn(`[storage] failed to write ${this.storageKey}`, err);
      throw err;
    }
  }

  async getAll(): Promise<T[]> {
    return this.readAll();
  }

  async getById(id: string): Promise<T | undefined> {
    const items = await this.readAll();
    return items.find((i) => i.id === id);
  }

  async create(item: T): Promise<T> {
    const items = await this.readAll();
    items.unshift(item);
    await this.writeAll(items);
    return item;
  }

  async update(id: string, patch: Partial<T>): Promise<T | undefined> {
    const items = await this.readAll();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    const updated = { ...items[idx], ...patch };
    items[idx] = updated;
    await this.writeAll(items);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const items = await this.readAll();
    await this.writeAll(items.filter((i) => i.id !== id));
  }

  async replaceAll(items: T[]): Promise<void> {
    await this.writeAll(items);
  }
}

export const STORAGE_KEYS = {
  workouts: '@fittrack/workouts',
  metrics: '@fittrack/metrics',
  water: '@fittrack/water',
  goals: '@fittrack/goals',
  profile: '@fittrack/profile',
  settings: '@fittrack/settings',
} as const;

/**
 * Wipes all user fitness data (workouts, metrics, water, goals, profile) so the
 * app returns to a first-launch state. Appearance/language preferences in
 * `settings` are intentionally left untouched — those are app prefs, not data.
 */
export async function wipeAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.workouts,
    STORAGE_KEYS.metrics,
    STORAGE_KEYS.water,
    STORAGE_KEYS.goals,
    STORAGE_KEYS.profile,
  ]);
}
