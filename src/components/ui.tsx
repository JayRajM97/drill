import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { Category, Difficulty } from '@/types/question';
import { categoryColor, colors, radius, space } from '@/theme/tokens';

export function CategoryPill({ category }: { category: Category }) {
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

/** "Hard" style danger badge — matches the error-container tag on the flashcard. */
export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  if (difficulty !== 'Hard') {
    return (
      <View style={styles.tag}>
        <Text style={styles.tagText}>{difficulty.toUpperCase()}</Text>
      </View>
    );
  }
  return (
    <View style={styles.dangerTag}>
      <Text style={styles.dangerTagText}>HARD</Text>
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
  pillText: { color: colors.text, fontSize: 12, fontWeight: '600' },
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
  tagText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dangerTag: {
    backgroundColor: colors.errorContainer,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    alignSelf: 'flex-start',
  },
  dangerTagText: {
    color: colors.onErrorContainer,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
