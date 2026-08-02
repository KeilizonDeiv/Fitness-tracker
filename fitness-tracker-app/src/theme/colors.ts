// Centralized design tokens. Never hardcode colors in screens/components — import from here.
export const colors = {
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

export type AppColor = keyof typeof colors;
