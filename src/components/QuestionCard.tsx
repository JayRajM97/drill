import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Question } from '@/types/question';
import { categoryIcon, categoryPastel, colors, radius, space } from '@/theme/tokens';
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
        {category ? (
          <View style={[styles.catChip, { backgroundColor: categoryPastel[category].bg }]}>
            <MaterialIcons name={categoryIcon[category] as never} size={14} color={categoryPastel[category].fg} />
            <Text style={[styles.catText, { color: categoryPastel[category].fg }]}>{category}</Text>
          </View>
        ) : (
          <View />
        )}
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
  card: { padding: space.lg, gap: space.md },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6, flexShrink: 1 },
  catText: { fontSize: 12, fontWeight: '800', flexShrink: 1 },
  title: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '600', letterSpacing: -0.1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg },
  rowTitle: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
});
