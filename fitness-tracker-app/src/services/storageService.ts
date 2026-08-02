import AsyncStorage from '@react-native-async-storage/async-storage';
// Legacy (string-based) FileSystem API — still the simplest fit for a one-shot JSON export/import.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
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

const BACKUP_FORMAT_VERSION = 1;

/**
 * Bundles every AsyncStorage key (including settings) into one JSON file and
 * opens the native share sheet so the user can save it wherever they like.
 */
export async function exportAllData(): Promise<void> {
  const keys = Object.values(STORAGE_KEYS);
  const pairs = await AsyncStorage.multiGet(keys);

  const data: Record<string, unknown> = {};
  for (const [key, raw] of pairs) {
    if (raw != null) data[key] = JSON.parse(raw);
  }

  const bundle = {
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };

  const fileUri = `${FileSystem.documentDirectory}fittrack-backup.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(bundle, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, { mimeType: 'application/json' });
  }
}

/**
 * Opens a file picker for a previously-exported backup JSON and restores it,
 * overwriting whatever is currently stored under each key present in the file.
 */
export async function importAllData(): Promise<'imported' | 'cancelled'> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
  if (result.canceled || !result.assets?.[0]) return 'cancelled';

  const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
  const bundle = JSON.parse(raw) as { data?: Record<string, unknown> };
  if (!bundle.data) throw new Error('Invalid backup file');

  const validKeys = new Set<string>(Object.values(STORAGE_KEYS));
  const pairs: [string, string][] = Object.entries(bundle.data)
    .filter(([key]) => validKeys.has(key))
    .map(([key, value]) => [key, JSON.stringify(value)]);

  await AsyncStorage.multiSet(pairs);
  return 'imported';
}
