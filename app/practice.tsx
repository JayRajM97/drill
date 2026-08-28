import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { questions } from '@/data';
import { useProgress } from '@/state/useProgress';
import type { Category, Difficulty, Question } from '@/types/question';
import { CATEGORIES } from '@/types/question';
import { BottomNavBar, NAV_CLEARANCE } from '@/components/BottomNavBar';
import { QuestionCard } from '@/components/QuestionCard';
import { Chip } from '@/components/ui';
import { SearchHeader } from '@/components/SearchHeader';
import { categoryIcon, colors, radius, shadow, space } from '@/theme/tokens';

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const DIFF_COLOR: Record<Difficulty, string> = { Easy: colors.easy, Medium: colors.medium, Hard: colors.hard };

export default function PracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isBookmarked, toggleBookmark } = useProgress();

  const [all, setAll] = useState<Question[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    questions.list().then(setAll);
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return all.filter((q) => {
      if (category && !q.categories.includes(category)) return false;
      if (difficulty && q.difficulty !== difficulty) return false;
      if (needle && !q.title.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [all, category, difficulty, search]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: NAV_CLEARANCE }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchHeader
          title="Library"
          subtitle={`${filtered.length} questions`}
          value={search}
          onChange={setSearch}
          placeholder="Search questions"
          right={
            <View style={styles.segment}>
              {DIFFICULTIES.map((d) => {
                const on = difficulty === d;
                return (
                  <Pressable key={d} onPress={() => setDifficulty(on ? null : d)} style={[styles.segItem, on && styles.segItemOn]}>
                    <View style={[styles.segDot, { backgroundColor: DIFF_COLOR[d] }]} />
                    {on ? <Text style={styles.segText}>{d}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
          }
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" icon="apps" active={!category} onPress={() => setCategory(null)} />
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} icon={categoryIcon[c] as never} active={category === c} onPress={() => setCategory(category === c ? null : c)} />
          ))}
        </ScrollView>

        <View style={styles.grid}>
          {filtered.map((q) => (
            <View key={q.id} style={styles.cell}>
              <QuestionCard
                question={q}
                bookmarked={isBookmarked(q.id)}
                onToggleBookmark={() => toggleBookmark(q.id)}
                onPress={() => router.push(`/question/${q.id}`)}
              />
            </View>
          ))}
          {filtered.length === 0 ? <Text style={styles.empty}>Nothing matches.</Text> : null}
        </View>
      </ScrollView>

      <BottomNavBar active="practice" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  segment: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 4,
    ...shadow.card,
  },
  segItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    minWidth: 32,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  segItemOn: { backgroundColor: colors.surfaceAlt, paddingHorizontal: 12 },
  segDot: { width: 8, height: 8, borderRadius: 4 },
  segText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  chips: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, paddingHorizontal: space.lg, paddingTop: space.sm },
  cell: { width: '47%', flexGrow: 1 },
  empty: { color: colors.textMuted, fontSize: 15, padding: space.lg },
});
