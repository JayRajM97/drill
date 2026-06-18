import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { questions } from '@/data';
import type { Category, Question } from '@/types/question';
import { QuestionCard } from '@/components/QuestionCard';
import { colors, radius, space } from '@/theme/tokens';

export default function CategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const category = decodeURIComponent(name ?? '') as Category;

  const [all, setAll] = useState<Question[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'card' | 'list'>('card');

  useEffect(() => {
    questions.list({ category }).then(setAll);
    questions.getDomains().then(setDomains);
  }, [category]);

  // Only show domain chips that actually exist within this category.
  const relevantDomains = useMemo(() => {
    const set = new Set<string>();
    all.forEach((q) => q.domain_tags.forEach((d) => set.add(d)));
    return domains.filter((d) => set.has(d));
  }, [all, domains]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return all.filter((q) => {
      if (activeDomain && !q.domain_tags.includes(activeDomain)) return false;
      if (needle && !q.title.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [all, activeDomain, search]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + space.md,
        paddingBottom: insets.bottom + space.xxl,
        gap: space.lg,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{category}</Text>
          <Text style={styles.count}>{filtered.length} questions</Text>
        </View>
        <Pressable
          onPress={() => setView((v) => (v === 'card' ? 'list' : 'card'))}
          hitSlop={12}
        >
          <Text style={styles.toggle}>{view === 'card' ? '☰' : '▦'}</Text>
        </Pressable>
      </View>

      {/* Domain filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip
          label="All"
          active={activeDomain === null}
          onPress={() => setActiveDomain(null)}
        />
        {relevantDomains.map((d) => (
          <Chip
            key={d}
            label={d}
            active={activeDomain === d}
            onPress={() => setActiveDomain((cur) => (cur === d ? null : d))}
          />
        ))}
      </ScrollView>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search questions"
          placeholderTextColor={colors.textFaint}
          style={styles.search}
        />
      </View>

      {/* Results */}
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No questions match these filters.</Text>
      ) : view === 'card' ? (
        <View style={styles.grid}>
          {filtered.map((q) => (
            <View key={q.id} style={styles.gridCell}>
              <QuestionCard
                question={q}
                onPress={() => router.push(`/question/${q.id}`)}
              />
            </View>
          ))}
        </View>
      ) : (
        <View style={{ gap: space.sm, paddingHorizontal: space.lg }}>
          {filtered.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              compact
              onPress={() => router.push(`/question/${q.id}`)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
  },
  back: { color: colors.text, fontSize: 34, lineHeight: 34 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  count: { color: colors.textMuted, fontSize: 13 },
  toggle: { color: colors.text, fontSize: 20 },
  chips: { gap: space.sm, paddingHorizontal: space.lg },
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: colors.bg },
  searchWrap: { paddingHorizontal: space.lg },
  search: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    color: colors.text,
    fontSize: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
    paddingHorizontal: space.lg,
  },
  gridCell: { width: '47%', flexGrow: 1 },
  empty: { color: colors.textMuted, fontSize: 14, paddingHorizontal: space.lg },
});
