export const themes = {
  midnight: {
    primary: '#2563eb',
    secondary: '#7c3aed',
    background: '#09090b',
    surface: '#18181b',
    border: '#27272a',
    text: { primary: '#fafafa', secondary: '#a1a1aa', muted: '#71717a' },
  },
  ocean: {
    primary: '#0891b2',
    secondary: '#06b6d4',
    background: '#0c1222',
    surface: '#131c31',
    border: '#1e2d4a',
    text: { primary: '#f0f9ff', secondary: '#94a3b8', muted: '#64748b' },
  },
  forest: {
    primary: '#16a34a',
    secondary: '#22c55e',
    background: '#0a0f0d',
    surface: '#141f1a',
    border: '#1e3328',
    text: { primary: '#f0fdf4', secondary: '#86efac', muted: '#4ade80' },
  },
  sunset: {
    primary: '#f97316',
    secondary: '#ef4444',
    background: '#0c0a09',
    surface: '#1c1917',
    border: '#292524',
    text: { primary: '#fefce8', secondary: '#fbbf24', muted: '#a16207' },
  },
  lavender: {
    primary: '#8b5cf6',
    secondary: '#a78bfa',
    background: '#0f0b1e',
    surface: '#1a1333',
    border: '#2e1f5e',
    text: { primary: '#f5f3ff', secondary: '#c4b5fd', muted: '#7c3aed' },
  },
  arctic: {
    primary: '#f8fafc',
    secondary: '#e2e8f0',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: { primary: '#0f172a', secondary: '#475569', muted: '#94a3b8' },
  },
} as const;

export type ThemeName = keyof typeof themes;
export type ThemeColors = (typeof themes)[ThemeName];
