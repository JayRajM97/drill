// Design tokens — "Quiet Cards" system.
// Soft grey canvas, pure-white floating cards with large radii and a single
// electric-blue accent. Everything is built for a phone in one hand: big type,
// generous spacing, one idea per card.

import type { Category } from '@/types/question';

export const colors = {
  bg: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF0F3',
  surfaceHigh: '#E4E7EC',
  border: '#E6E8EC',
  text: '#0F1115',
  textMuted: '#6B7280',
  textFaint: '#9CA3AF',
  accent: '#1F5EFF',
  accentDeep: '#1547CC',
  accentSoft: '#E9EFFF',
  onAccent: '#FFFFFF',
  onAccentMuted: 'rgba(255,255,255,0.72)',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  easy: '#16A34A',
  medium: '#D97706',
  hard: '#DC2626',
  // Legacy aliases kept so any stray import still compiles.
  primary: '#1F5EFF',
  secondary: '#6B7280',
  outline: '#9CA3AF',
  bgElevated: '#FFFFFF',
  onSecondary: '#FFFFFF',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#991B1B',
  error: '#DC2626',
} as const;

/** Absolute-fill style object (RN 0.85 types drop StyleSheet.absoluteFillObject). */
export const fill = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  card: 32,
  pill: 999,
} as const;

export const font = {
  display: 34,
  title: 24,
  body: 17,
  label: 13,
} as const;

/** Soft, wide shadow used on every floating card (works on web + new arch). */
export const shadow = {
  card: { boxShadow: '0 10px 30px rgba(15, 17, 21, 0.06)' },
  cardStrong: { boxShadow: '0 18px 44px rgba(15, 17, 21, 0.12)' },
  accent: { boxShadow: '0 14px 32px rgba(31, 94, 255, 0.28)' },
  nav: { boxShadow: '0 10px 30px rgba(15, 17, 21, 0.10)' },
} as const;

export const categoryEmoji: Record<Category, string> = {
  'Product Design': '🎨',
  'Product Strategy': '♟️',
  Analytical: '📊',
  Guesstimate: '🔢',
  AI: '🤖',
  RCA: '🔍',
};

/** MaterialIcons glyph name for category chips. */
export const categoryIcon: Record<Category, string> = {
  'Product Design': 'palette',
  'Product Strategy': 'flag',
  Analytical: 'bar-chart',
  Guesstimate: 'casino',
  AI: 'auto-awesome',
  RCA: 'search',
};

export const categoryPastel: Record<Category, { bg: string; fg: string }> = {
  'Product Design': { bg: '#E9EFFF', fg: '#1F5EFF' },
  'Product Strategy': { bg: '#E6F6EC', fg: '#15803D' },
  Analytical: { bg: '#FFF1DB', fg: '#B45309' },
  Guesstimate: { bg: '#F1E8FF', fg: '#7E22CE' },
  AI: { bg: '#FDE7F1', fg: '#BE185D' },
  RCA: { bg: '#E0F3FB', fg: '#0369A1' },
};

export const categoryColor: Record<Category, string> = {
  'Product Design': categoryPastel['Product Design'].fg,
  'Product Strategy': categoryPastel['Product Strategy'].fg,
  Analytical: categoryPastel.Analytical.fg,
  Guesstimate: categoryPastel.Guesstimate.fg,
  AI: categoryPastel.AI.fg,
  RCA: categoryPastel.RCA.fg,
};

export const categoryDescription: Record<Category, string> = {
  'Product Design': 'UX, flows and product craft.',
  'Product Strategy': 'Roadmaps and trade-offs.',
  Analytical: 'Metrics and data questions.',
  Guesstimate: 'Sizing under uncertainty.',
  AI: 'Shipping AI features.',
  RCA: 'Diagnose metric dips.',
};

/** Emoji for domain-tag filter chips (unknown tags fall back to 🏷️). */
export const domainEmoji: Record<string, string> = {
  AI: '🤖',
  Ecommerce: '🛒',
  Enterprise: '🏢',
  Fintech: '💳',
  Mobility: '🚕',
  SaaS: '☁️',
  Startup: '🚀',
  Consumer: '📱',
  Social: '💬',
  Healthcare: '🏥',
  Edtech: '🎓',
  Media: '🎬',
};
export const emojiForDomain = (d: string): string => domainEmoji[d] ?? '🏷️';
