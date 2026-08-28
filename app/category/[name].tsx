import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { questions } from '@/data';
import type { Category, Question } from '@/types/question';
import { useProgress } from '@/state/useProgress';
import { QuestionCard } from '@/components/QuestionCard';
import { CategoryIcon, Chip, IconButton } from '@/components/ui';
import { categoryDescription, colors, space } from '@/theme/tokens';

export default function CategoryScreen() {
  const router = useRouter();
  // On a deep link / web refresh there is no history to pop; fall back to Home.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const insets = useSafeAreaInsets();
  const { name } = useLocalSearchParams<{ name: string }>();
  const category = decodeURIComponent(name ?? '') as Category;
  const { isCompleted } = useProgress();

  const [all, setAll] = useState<Question[]>([]);
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    questions.list({ category }).then(setAll);
  }, [category]);

  const domains = useMemo(() => {
    const set = new Set<string>();
    all.forEach((q) => q.domain_tags.forEach((d) => set.add(d)));
    return [...set].sort();
  }, [all]);

  const filtered = useMemo(
    () => all.filter((q) => !domain || q.domain_tags.includes(domain)),
    [all, domain],
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bar}>
          <IconButton icon="arrow-back" onPress={() => goBack()} />
        </View>

        <View style={styles.head}>
          <CategoryIcon category={category} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{category}</Text>
            <Text style={styles.sub}>
              {categoryDescription[category]} · {filtered.length} drills
            </Text>
          </View>
        </View>

        {domains.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip label="All" active={!domain} onPress={() => setDomain(null)} />
            {domains.map((d) => (
              <Chip key={d} label={d} active={domain === d} onPress={() => setDomain(domain === d ? null : d)} />
            ))}
          </ScrollView>
        ) : null}

        <View style={styles.grid}>
          {filtered.map((q) => (
            <View key={q.id} style={styles.cell}>
              <QuestionCard question={q} done={isCompleted(q.id)} onPress={() => router.push(`/question/${q.id}`)} />
            </View>
          ))}
          {filtered.length === 0 ? <Text style={styles.empty}>Nothing here yet.</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: { paddingHorizontal: space.lg, marginBottom: space.lg },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingHorizontal: space.lg, marginBottom: space.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  sub: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  chips: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: 6, marginBottom: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, paddingHorizontal: space.lg, paddingTop: space.sm },
  cell: { width: '47%', flexGrow: 1 },
  empty: { color: colors.textMuted, fontSize: 15, padding: space.lg },
});
