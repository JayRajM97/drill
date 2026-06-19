import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { questions } from '@/data';
import { useProgress } from '@/state/useProgress';
import type { Category, Difficulty, Question } from '@/types/question';
import { CATEGORIES } from '@/types/question';
import { BottomNavBar } from '@/components/BottomNavBar';
import { Tag } from '@/components/ui';
import { colors, radius, space } from '@/theme/tokens';

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

// Literal to design/stitch/05-interview-questions-grid-table.html, adapted:
// Role/Company (not in our schema) -> Category/Domain/Difficulty filters.
export default function PracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isBookmarked, toggleBookmark } = useProgress();

  const [all, setAll] = useState<Question[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [domain, setDomain] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    questions.list().then(setAll);
    questions.getDomains().then(setDomains);
  }, []);

  const filtered = useMemo(() => {
    return all.filter((q) => {
      if (category && !q.categories.includes(category)) return false;
      if (domain && !q.domain_tags.includes(domain)) return false;
      if (difficulty && q.difficulty !== difficulty) return false;
      return true;
    });
  }, [all, category, domain, difficulty]);

  const featured = filtered.slice(0, 4);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxxl }}>
        <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
          <Text style={styles.title}>Interview Questions</Text>
          <Text style={styles.subtitle}>
            Browse {all.length} practice questions by category, domain, and difficulty.
          </Text>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <CycleFilter
            label="Category"
            value={category}
            options={CATEGORIES}
            onChange={setCategory}
          />
          <CycleFilter
            label="Domain"
            value={domain}
            options={domains}
            onChange={setDomain}
          />
          <CycleFilter
            label="Difficulty"
            value={difficulty}
            options={DIFFICULTIES}
            onChange={setDifficulty}
          />
        </ScrollView>

        {/* Featured Insights + view toggle */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Featured Insights</Text>
          <View style={styles.viewToggle}>
            <Pressable
              style={[styles.toggleBtn, view === 'grid' && styles.toggleBtnActive]}
              onPress={() => setView('grid')}
            >
              <MaterialIcons name="grid-view" size={16} color={view === 'grid' ? colors.accent : colors.secondary} />
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, view === 'list' && styles.toggleBtnActive]}
              onPress={() => setView('list')}
            >
              <MaterialIcons name="view-list" size={16} color={view === 'list' ? colors.accent : colors.secondary} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
        >
          {featured.map((q) => (
            <Pressable
              key={q.id}
              style={styles.featuredCard}
              onPress={() => router.push(`/question/${q.id}`)}
            >
              <Pressable
                style={styles.bookmarkBtn}
                onPress={() => toggleBookmark(q.id)}
                hitSlop={8}
              >
                <MaterialIcons
                  name={isBookmarked(q.id) ? 'bookmark' : 'bookmark-border'}
                  size={18}
                  color={isBookmarked(q.id) ? colors.accent : colors.secondary}
                />
              </Pressable>
              <Text style={styles.featuredTitle} numberOfLines={3}>
                {q.title}
              </Text>
              <View style={styles.tagWrap}>
                {q.categories[0] ? <Tag label={q.categories[0]} /> : null}
                {q.domain_tags[0] ? <Tag label={q.domain_tags[0]} /> : null}
              </View>
            </Pressable>
          ))}
          {featured.length === 0 ? <Text style={styles.muted}>No questions match.</Text> : null}
        </ScrollView>

        {/* All Questions */}
        <View style={styles.allSection}>
          <Text style={styles.sectionTitle}>All Questions</Text>
          <View style={styles.tableTopBorder} />
          {filtered.map((q) => (
            <Pressable
              key={q.id}
              style={styles.row}
              onPress={() => router.push(`/question/${q.id}`)}
            >
              <View style={{ flex: 1, gap: space.sm }}>
                <Text style={styles.rowTitle}>{q.title}</Text>
                <View style={styles.tagWrap}>
                  {q.categories[0] ? <Tag label={q.categories[0]} /> : null}
                  {q.domain_tags[0] ? <Tag label={q.domain_tags[0]} /> : null}
                </View>
              </View>
              <View style={styles.rowActions}>
                <Pressable onPress={() => toggleBookmark(q.id)} hitSlop={8}>
                  <MaterialIcons
                    name={isBookmarked(q.id) ? 'bookmark' : 'bookmark-border'}
                    size={20}
                    color={isBookmarked(q.id) ? colors.accent : colors.secondary}
                  />
                </Pressable>
                <MaterialIcons name="chevron-right" size={20} color={colors.outline} />
              </View>
            </Pressable>
          ))}
          {filtered.length === 0 ? <Text style={styles.muted}>No questions match these filters.</Text> : null}
        </View>
      </ScrollView>

      <BottomNavBar active="practice" />
    </View>
  );
}

function CycleFilter<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | null;
  options: T[];
  onChange: (v: T | null) => void;
}) {
  const cycle = () => {
    if (!value) return onChange(options[0] ?? null);
    const idx = options.indexOf(value);
    onChange(idx === options.length - 1 ? null : options[idx + 1]);
  };
  return (
    <Pressable style={[styles.filterChip, value && styles.filterChipActive]} onPress={cycle}>
      <Text style={[styles.filterChipText, value && styles.filterChipTextActive]}>
        {value ?? label}
      </Text>
      <MaterialIcons
        name="keyboard-arrow-down"
        size={18}
        color={value ? colors.onAccent : colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: space.lg, paddingBottom: space.md, gap: space.xs },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { color: colors.secondary, fontSize: 14, lineHeight: 20 },
  filterRow: { gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.lg },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterChipText: { color: colors.text, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: colors.onAccent },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.sm,
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  viewToggle: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: 4, gap: 2 },
  toggleBtn: { padding: 6, borderRadius: radius.sm },
  toggleBtnActive: { backgroundColor: colors.surface },
  cardsRow: { gap: space.md, paddingHorizontal: space.lg, paddingBottom: space.xl },
  featuredCard: {
    width: 220,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: space.lg,
    gap: space.md,
  },
  bookmarkBtn: { alignSelf: 'flex-end' },
  featuredTitle: { color: colors.text, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  muted: { color: colors.textMuted, fontSize: 14, paddingHorizontal: space.lg },
  allSection: { paddingHorizontal: space.lg, gap: space.md },
  tableTopBorder: { height: 2, backgroundColor: colors.text, marginBottom: space.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: space.md,
    paddingVertical: space.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '700', lineHeight: 21 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingTop: 2 },
});
