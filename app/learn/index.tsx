import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CONCEPTS } from '@/data/concepts';
import { BottomNavBar, NAV_CLEARANCE } from '@/components/BottomNavBar';
import { ConceptCard } from '@/components/ConceptCard';
import { Masonry } from '@/components/Masonry';
import { SearchHeader } from '@/components/SearchHeader';
import { colors, space } from '@/theme/tokens';

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();

  const list = useMemo(
    () =>
      CONCEPTS.filter((c) => {
        if (!needle) return true;
        const hay = [c.name, c.tagline, c.what, ...c.terms.map((t) => t.term), ...c.useCases.map((u) => u.product)].join(' ').toLowerCase();
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
        <SearchHeader title="Learn" subtitle={`${list.length} AI concepts, the PM way`} value={search} onChange={setSearch} placeholder="Search concepts" />

        <Text style={styles.intro}>
          What it is in plain English, how it works, who uses it in the wild, and what to say about it in the room.
        </Text>

        <Masonry
          items={list}
          keyOf={(c) => c.key}
          estimate={(c) => 150 + Math.ceil(c.name.length / 18) * 21 + Math.ceil(c.tagline.length / 26) * 18}
          render={(c) => <ConceptCard concept={c} onPress={() => router.push(`/learn/${c.key}`)} />}
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
