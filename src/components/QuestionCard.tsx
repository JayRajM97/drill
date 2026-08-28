import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Question } from '@/types/question';
import { colors, space } from '@/theme/tokens';
import { Card, CategoryIcon, DifficultyBadge, DifficultyDot } from './ui';

interface Props {
  question: Question;
  onPress: () => void;
  /** Single-row layout for lists. */
  compact?: boolean;
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  done?: boolean;
}

export function QuestionCard({ question, onPress, compact, bookmarked, onToggleBookmark, done }: Props) {
  const category = question.categories[0];

  if (compact) {
    return (
      <Card onPress={onPress} style={styles.row}>
        {category ? <CategoryIcon category={category} size={40} /> : null}
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {question.title}
          </Text>
          <View style={styles.meta}>
            <DifficultyDot difficulty={question.difficulty} />
            <Text style={styles.metaText}>
              {question.difficulty}
              {question.domain_tags[0] ? ` · ${question.domain_tags[0]}` : ''}
            </Text>
          </View>
        </View>
        {onToggleBookmark ? (
          <Pressable onPress={onToggleBookmark} hitSlop={10}>
            <MaterialIcons
              name={bookmarked ? 'bookmark' : 'bookmark-border'}
              size={22}
              color={bookmarked ? colors.accent : colors.textFaint}
            />
          </Pressable>
        ) : (
          <MaterialIcons name="chevron-right" size={22} color={colors.textFaint} />
        )}
      </Card>
    );
  }

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.top}>
        {category ? <CategoryIcon category={category} size={36} /> : <View />}
        {onToggleBookmark ? (
          <Pressable onPress={onToggleBookmark} hitSlop={10}>
            <MaterialIcons
              name={bookmarked ? 'bookmark' : 'bookmark-border'}
              size={20}
              color={bookmarked ? colors.accent : colors.textFaint}
            />
          </Pressable>
        ) : done ? (
          <MaterialIcons name="check-circle" size={20} color={colors.success} />
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={5}>
        {question.title}
      </Text>
      <DifficultyBadge difficulty={question.difficulty} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: space.lg, gap: space.md, minHeight: 148, justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '600', letterSpacing: -0.1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  rowTitle: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
});
