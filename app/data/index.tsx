import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PLAYBOOKS } from '@/data/analytics';
import { BottomNavBar, NAV_CLEARANCE } from '@/components/BottomNavBar';
import { PlaybookCard } from '@/components/PlaybookCard';
import { Masonry } from '@/components/Masonry';
import { SearchHeader } from '@/components/SearchHeader';
import { colors, space } from '@/theme/tokens';

export default function DataScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();

  const list = useMemo(
    () =>
      PLAYBOOKS.filter((p) => {
        if (!needle) return true;
        const hay = [p.name, p.tagline, p.when, ...p.terms.map((t) => t.term), ...p.steps.map((s) => s.label)].join(' ').toLowerCase();
        return hay.includes(needle);
      }),
    [needle],
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: NAV_CLEARANCE }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchHeader title="Data" subtitle={`${list.length} analysis playbooks`} value={search} onChange={setSearch} placeholder="Search playbooks" />

        <Text style={styles.intro}>
          How to actually look at the data: worked examples walked end to end, and the methods behind them — what to pull, what to trust, and the trap in each.
        </Text>

        <Masonry
          items={list}
          keyOf={(p) => p.key}
          estimate={(p) => 150 + Math.ceil(p.name.length / 18) * 21 + Math.ceil(p.tagline.length / 26) * 18}
          render={(p) => <PlaybookCard playbook={p} onPress={() => router.push(`/data/${p.key}`)} />}
        />
        {list.length === 0 ? <Text style={styles.empty}>Nothing matches.</Text> : null}
      </ScrollView>

      <BottomNavBar active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  intro: { color: colors.textMuted, fontSize: 14, lineHeight: 20, paddingHorizontal: space.lg, marginTop: space.sm, marginBottom: space.md },
  empty: { color: colors.textMuted, fontSize: 15, padding: space.lg },
});
