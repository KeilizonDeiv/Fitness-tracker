// Centralized design tokens. Never hardcode colors in screens/components — use useColors() instead.
const darkColors = {
  bg: '#0F172A',
  bgElevated: '#1A2436',
  card: '#1E293B',
  border: '#2C3A52',

  primary: '#22D3EE',
  primaryDark: '#0891B2',
  accent: '#A78BFA',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',

  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  overlay: 'rgba(0,0,0,0.55)',
} as const;

const lightColors: typeof darkColors = {
  bg: '#F8FAFC',
  bgElevated: '#FFFFFF',
  card: '#F1F5F9',
  border: '#E2E8F0',

  primary: '#0891B2',
  primaryDark: '#0E7490',
  accent: '#7C3AED',
  success: '#059669',
  warning: '#D97706',
  danger: '#DC2626',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  overlay: 'rgba(15,23,42,0.35)',
};

export const themes = { dark: darkColors, light: lightColors };

// Static default (dark) — kept only for modules that can't use the hook (e.g. outside React tree).
export const colors = darkColors;

export type AppColors = typeof darkColors;
export type AppColor = keyof AppColors;
