import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { questions } from '@/data';
import type { Category, Question } from '@/types/question';
import { useProgress } from '@/state/useProgress';
import { QuestionCard } from '@/components/QuestionCard';
import { Masonry } from '@/components/Masonry';
import { FrameworkCard } from '@/components/FrameworkCard';
import { frameworksFor } from '@/data/frameworks';
import { BottomNavBar, NAV_CLEARANCE } from '@/components/BottomNavBar';
import { CategoryIcon, Chip, IconButton } from '@/components/ui';
import { categoryDescription, colors, emojiForDomain, space } from '@/theme/tokens';

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

  const frameworks = useMemo(() => frameworksFor(category), [category]);
  const filtered = useMemo(
    () => all.filter((q) => !domain || q.domain_tags.includes(domain)),
    [all, domain],
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: NAV_CLEARANCE }}
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

        {frameworks.length ? (
          <View style={styles.fwSection}>
            <View style={styles.fwHead}>
              <Text style={styles.fwTitle}>Frameworks for {category}</Text>
              <Text style={styles.fwMeta}>{frameworks.length}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: -space.md }} contentContainerStyle={{ paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.md }}>
              {frameworks.map((f) => (
                <FrameworkCard key={f.key} framework={f} wide onPress={() => router.push(`/frameworks/${f.key}`)} />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {domains.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Chip label="All" icon="apps" active={!domain} onPress={() => setDomain(null)} />
            {domains.map((d) => (
              <Chip key={d} label={d} emoji={emojiForDomain(d)} active={domain === d} onPress={() => setDomain(domain === d ? null : d)} />
            ))}
          </ScrollView>
        ) : null}

        <Masonry
          items={filtered}
          keyOf={(q) => q.id}
          estimate={(q) => 90 + Math.ceil(q.title.length / 22) * 21}
          render={(q) => (
              <QuestionCard question={q} done={isCompleted(q.id)} onPress={() => router.push(`/question/${q.id}`)} />
          )}
        />
        {filtered.length === 0 ? <Text style={styles.empty}>Nothing here yet.</Text> : null}
      </ScrollView>

      <BottomNavBar active="practice" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: { paddingHorizontal: space.lg, marginBottom: space.lg },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingHorizontal: space.lg, marginBottom: space.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  sub: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  fwSection: { marginBottom: space.lg },
  fwHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: space.lg, marginBottom: space.sm },
  fwTitle: { color: colors.text, fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  fwMeta: { color: colors.textFaint, fontSize: 13, fontWeight: '700' },
  chips: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: 6, marginBottom: space.sm },
  empty: { color: colors.textMuted, fontSize: 15, padding: space.lg },
});
