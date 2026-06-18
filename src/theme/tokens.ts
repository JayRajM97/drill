// Design tokens matching the Stitch "Premium Editorial Learning" design system
// (design/stitch/design-system.md). Light, paper-like surface with a vibrant
// green brand accent — "Spotify-meets-Substack".

import type { Category } from '@/types/question';

export const colors = {
  bg: '#fbf9f8',
  bgElevated: '#f5f3f3',
  surface: '#ffffff',
  surfaceAlt: '#efeded',
  surfaceHigh: '#e9e8e7',
  border: '#e4e2e2',
  outline: '#6d7b6c',
  text: '#1b1c1c',
  textMuted: '#3d4a3d',
  textFaint: '#6d7b6c',
  // Darker green: legible as text/icons/strokes on white.
  primary: '#006e2d',
  // Vibrant green: solid button/badge backgrounds (white text on top).
  accent: '#1db954',
  onAccent: '#ffffff',
  secondary: '#5f5e5e',
  onSecondary: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  error: '#ba1a1a',
  // difficulty dots
  easy: '#1db954',
  medium: '#b45309',
  hard: '#ba1a1a',
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
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const font = {
  display: 34,
  title: 22,
  body: 16,
  label: 12,
} as const;

/** Per-category accent used on tiles/pills (PRD home tile colors). */
export const categoryColor: Record<Category, string> = {
  'Product Design': '#1d4ed8',
  'Product Strategy': '#006e2d',
  Analytical: '#ba1a1a',
  Guesstimate: '#7e22ce',
  AI: '#be185d',
  RCA: '#b45309',
};

export const categoryEmoji: Record<Category, string> = {
  'Product Design': '🎨',
  'Product Strategy': '♟️',
  Analytical: '📊',
  Guesstimate: '🔢',
  AI: '🤖',
  RCA: '🔍',
};

/** MaterialIcons glyph name for the pastel icon-chip on Home category cards. */
export const categoryIcon: Record<Category, string> = {
  'Product Design': 'palette',
  'Product Strategy': 'flag',
  Analytical: 'bar-chart',
  Guesstimate: 'casino',
  AI: 'smart-toy',
  RCA: 'search',
};

export const categoryPastel: Record<Category, { bg: string; fg: string }> = {
  'Product Design': { bg: '#dbeafe', fg: '#1d4ed8' },
  'Product Strategy': { bg: '#dcfce7', fg: '#15803d' },
  Analytical: { bg: '#fef3c7', fg: '#b45309' },
  Guesstimate: { bg: '#f3e8ff', fg: '#7e22ce' },
  AI: { bg: '#fce7f3', fg: '#be185d' },
  RCA: { bg: '#e0f2fe', fg: '#0369a1' },
};

export const categoryDescription: Record<Category, string> = {
  'Product Design': 'Design challenges focused on UX, flows, and product craft.',
  'Product Strategy': 'Prioritization, roadmaps, and strategic trade-off questions.',
  Analytical: 'Metrics, root-cause, and data-driven product questions.',
  Guesstimate: 'Market sizing and estimation under uncertainty.',
  AI: 'Building and shipping AI-powered product features.',
  RCA: 'Diagnose dips and regressions in product metrics.',
};
