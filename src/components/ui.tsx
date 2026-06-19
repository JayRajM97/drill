import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { CategoryTag, Difficulty } from '@/types/question';
import { categoryColor, colors, radius, space } from '@/theme/tokens';

export function CategoryPill({ category }: { category: CategoryTag }) {
  return (
    <View style={[styles.pill, { borderColor: categoryColor[category] }]}>
      <View style={[styles.dot, { backgroundColor: categoryColor[category] }]} />
      <Text style={styles.pillText}>{category}</Text>
    </View>
  );
}

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Easy: colors.easy,
  Medium: colors.medium,
  Hard: colors.hard,
};

export function DifficultyDot({
  difficulty,
  showLabel = false,
}: {
  difficulty: Difficulty;
  showLabel?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View
        style={[styles.diffDot, { backgroundColor: DIFFICULTY_COLOR[difficulty] }]}
      />
      {showLabel ? <Text style={styles.muted}>{difficulty}</Text> : null}
    </View>
  );
}

export function Tag({ label, style }: { label: string; style?: ViewStyle }) {
  return (
    <View style={[styles.tag, style]}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    alignSelf: 'flex-start',
  },
  pillText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  diffDot: { width: 8, height: 8, borderRadius: 4 },
  muted: { color: colors.textMuted, fontSize: 12 },
  tag: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    alignSelf: 'flex-start',
  },
  tagText: { color: colors.textMuted, fontSize: 12, fontFamily: 'monospace' },
});
