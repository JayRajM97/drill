import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { questions } from '@/data';
import type { Question } from '@/types/question';
import { useProgress } from '@/state/useProgress';
import { AnswerBody, SectionLabel, StrongVsGeneric } from '@/components/blocks';
import { CategoryPill, DifficultyDot } from '@/components/ui';
import { colors, space } from '@/theme/tokens';

/** Full-page reading mode — no cards, timer, or swiping. Just the answer. */
export default function FullReadView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isBookmarked, toggleBookmark } = useProgress();
  const [question, setQuestion] = useState<Question | null>(null);

  useEffect(() => {
    if (id) questions.getById(id).then(setQuestion);
  }, [id]);

  if (!question) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  const bookmarked = isBookmarked(question.id);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + space.md,
        paddingBottom: insets.bottom + space.xxl,
        paddingHorizontal: space.lg,
        gap: space.lg,
      }}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Pressable onPress={() => toggleBookmark(question.id)} hitSlop={12}>
          <Text style={[styles.bookmark, bookmarked && styles.bookmarkOn]}>
            {bookmarked ? '★' : '☆'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.title}>{question.title}</Text>
      <View style={styles.metaRow}>
        {question.categories[0] ? (
          <CategoryPill category={question.categories[0]} />
        ) : null}
        <DifficultyDot difficulty={question.difficulty} showLabel />
      </View>

      <View style={styles.divider} />

      <AnswerBody sections={question.answer} />

      {question.strong_vs_generic?.length ? (
        <View style={{ gap: space.md, marginTop: space.lg }}>
          <SectionLabel>💡 Strong vs. Generic</SectionLabel>
          <StrongVsGeneric rows={question.strong_vs_generic} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.textMuted, fontSize: 14 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: { color: colors.text, fontSize: 34, lineHeight: 34 },
  bookmark: { color: colors.textMuted, fontSize: 24 },
  bookmarkOn: { color: colors.accent },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  divider: { height: 1, backgroundColor: colors.border },
});
