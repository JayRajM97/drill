// Placeholder design tokens. Dark-first per the PRD direction. These are
// intentionally minimal — final visuals will be matched to mockups later.

import type { Category } from '@/types/question';

export const colors = {
  bg: '#0D0D0F',
  bgElevated: '#161618',
  surface: '#1C1C20',
  surfaceAlt: '#232328',
  border: '#2A2A30',
  accent: '#FF6B35',
  text: '#F5F5F7',
  textMuted: '#9A9AA2',
  textFaint: '#6A6A72',
  // difficulty dots
  easy: '#3FB950',
  medium: '#D29922',
  hard: '#F85149',
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
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const font = {
  display: 28,
  title: 20,
  body: 15,
  label: 12,
} as const;

/** Per-category accent used on tiles/pills (PRD home tile colors). */
export const categoryColor: Record<Category, string> = {
  'Product Design': '#6B7280',
  'Product Strategy': '#3FB950',
  Analytical: '#F85149',
  Guesstimate: '#A371F7',
  AI: '#EC4899',
  RCA: '#388BFD',
};

export const categoryEmoji: Record<Category, string> = {
  'Product Design': '🎨',
  'Product Strategy': '♟️',
  Analytical: '📊',
  Guesstimate: '🔢',
  AI: '🤖',
  RCA: '🔍',
};
