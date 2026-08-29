import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FRAMEWORK_AREAS, FRAMEWORKS, type FrameworkArea } from '@/data/frameworks';
import { BottomNavBar, NAV_CLEARANCE } from '@/components/BottomNavBar';
import { FrameworkCard } from '@/components/FrameworkCard';
import { Masonry } from '@/components/Masonry';
import { SearchHeader } from '@/components/SearchHeader';
import { Chip } from '@/components/ui';
import { categoryIcon, colors, space } from '@/theme/tokens';

export default function FrameworksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<FrameworkArea | null>(null);
  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();

  const list = useMemo(
    () =>
      FRAMEWORKS.filter((f) => {
        if (category && !f.categories.includes(category)) return false;
        if (needle) {
          const hay = [f.name, f.oneLiner, f.whenToUse, f.alsoKnownAs ?? '', ...f.steps.map((s) => s.label)].join(' ').toLowerCase();
          if (!hay.includes(needle)) return false;
        }
        return true;
      }),
    [category, needle],
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: NAV_CLEARANCE }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchHeader title="Frameworks" subtitle={`${list.length} ways to structure an answer`} value={search} onChange={setSearch} placeholder="Search frameworks" />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All" icon="apps" active={!category} onPress={() => setCategory(null)} />
          {FRAMEWORK_AREAS.map((c) => (
            <Chip
              key={c}
              label={c}
              icon={(c === 'Behavioural' ? 'record-voice-over' : c === 'Execution' ? 'checklist' : categoryIcon[c]) as never}
              active={category === c}
              onPress={() => setCategory(category === c ? null : c)}
            />
          ))}
        </ScrollView>

        <Text style={styles.intro}>Every answer in Drill uses one of these. Learn the shape, then see it applied in the drills.</Text>

        <Masonry
          items={list}
          keyOf={(f) => f.key}
          estimate={(f) => 150 + Math.ceil(f.name.length / 18) * 21 + Math.ceil(f.oneLiner.length / 26) * 18}
          render={(f) => <FrameworkCard framework={f} onPress={() => router.push(`/frameworks/${f.key}`)} />}
        />
        {list.length === 0 ? <Text style={styles.empty}>Nothing matches.</Text> : null}
      </ScrollView>

      <BottomNavBar active="practice" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  chips: { gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.md },
  intro: { color: colors.textMuted, fontSize: 14, lineHeight: 20, paddingHorizontal: space.lg, marginBottom: space.md },
  empty: { color: colors.textMuted, fontSize: 15, padding: space.lg },
});
