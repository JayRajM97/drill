import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Question } from '@/types/question';
import { colors, radius, space } from '@/theme/tokens';
import { CategoryPill, DifficultyDot } from './ui';

interface Props {
  question: Question;
  onPress: () => void;
  /** Compact single-row layout for the list view. */
  compact?: boolean;
  badge?: string;
}

export function QuestionCard({ question, onPress, compact, badge }: Props) {
  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.rowCard, pressed && styles.pressed]}
      >
        <DifficultyDot difficulty={question.difficulty} />
        <Text style={styles.rowTitle} numberOfLines={2}>
          {question.title}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
      <Text style={styles.title} numberOfLines={4}>
        {question.title}
      </Text>
      <View style={styles.footer}>
        {question.categories[0] ? (
          <CategoryPill category={question.categories[0]} />
        ) : null}
        <DifficultyDot difficulty={question.difficulty} showLabel />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: space.lg,
    gap: space.md,
    minHeight: 150,
    justifyContent: 'space-between',
  },
  pressed: { opacity: 0.85 },
  title: { color: colors.text, fontSize: 15, fontWeight: '600', lineHeight: 21 },
  footer: { gap: space.sm },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  badgeText: { color: colors.onAccent, fontSize: 11, fontWeight: '700' },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  rowTitle: { color: colors.text, fontSize: 15, flex: 1, lineHeight: 20 },
  chevron: { color: colors.outline, fontSize: 18 },
});
