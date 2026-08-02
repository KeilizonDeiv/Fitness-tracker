import { themes, AppColors } from './colors';
import { useResolvedThemeMode } from '@/store/settingsStore';

export function useColors(): AppColors {
  const mode = useResolvedThemeMode();
  return themes[mode];
}
