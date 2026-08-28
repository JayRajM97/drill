import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { emojiFor, NUMBER_TOPICS, REGION_LABEL, type Fact, type NumberTopic } from '@/data/numbers';
import { BottomNavBar, NAV_CLEARANCE } from '@/components/BottomNavBar';
import { SearchHeader } from '@/components/SearchHeader';
import { Chip } from '@/components/ui';
import { colors, radius, shadow, space } from '@/theme/tokens';

export default function NumbersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [topicKey, setTopicKey] = useState<string>(NUMBER_TOPICS[0].key);
  const [search, setSearch] = useState('');
  const needle = search.trim().toLowerCase();

  const topics = useMemo<NumberTopic[]>(() => {
    if (!needle) return NUMBER_TOPICS.filter((t) => t.key === topicKey);
    return NUMBER_TOPICS.map((t) => ({
      ...t,
      groups: t.groups
        .map((g) => ({
          ...g,
          facts: g.facts.filter((x) =>
            [x.label, x.value, x.note ?? '', g.title, t.title].some((s) => s.toLowerCase().includes(needle)),
          ),
        }))
        .filter((g) => g.facts.length),
    })).filter((t) => t.groups.length);
  }, [needle, topicKey]);

  const total = NUMBER_TOPICS.reduce((n, t) => n + t.groups.reduce((m, g) => m + g.facts.length, 0), 0);
  // Two rows of topic chips, scrolling together horizontally.
  const half = Math.ceil(NUMBER_TOPICS.length / 2);
  const rows = [NUMBER_TOPICS.slice(0, half), NUMBER_TOPICS.slice(half)];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.md, paddingBottom: NAV_CLEARANCE + 64 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchHeader
          title="Numbers"
          subtitle={`${total} anchors to quote from memory`}
          value={search}
          onChange={setSearch}
          placeholder="Search a number"
        />

        {!needle ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRows}>
            <View style={{ gap: space.sm }}>
              {rows.map((row, i) => (
                <View key={i} style={styles.chipRow}>
                  {row.map((t) => (
                    <Chip key={t.key} label={`${t.emoji} ${t.title}`} active={topicKey === t.key} onPress={() => setTopicKey(t.key)} />
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={{ height: space.md }} />
        )}

        {topics.map((t) => (
          <View key={t.key} style={styles.topic}>
            {needle ? (
              <Text style={styles.topicTitle}>
                {t.emoji} {t.title}
              </Text>
            ) : (
              <Text style={styles.blurb}>{t.blurb}</Text>
            )}
            {t.groups.map((g) => (
              <View key={g.title} style={styles.group}>
                <Text style={styles.groupTitle}>{g.title}</Text>
                <View style={styles.grid}>
                  {g.facts.map((x) => (
                    <FactCard
                      key={x.id}
                      fact={x}
                      fallbackEmoji={t.emoji}
                      hideRegion={
                        (!needle &&
                          ((t.key === 'india' && x.region === 'IN') ||
                            (t.key === 'us' && x.region === 'US') ||
                            (t.key === 'world' && x.region === 'World'))) ||
                        /\b(US|India|World|global)\b/i.test(g.title)
                      }
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}
        {topics.length === 0 ? <Text style={styles.empty}>No number matches.</Text> : null}
      </ScrollView>

      {/* Practice entry points, docked above the nav. */}
      <View style={[styles.ctaRow, { bottom: Math.max(insets.bottom, space.md) + 76 }]} pointerEvents="box-none">
        <Pressable onPress={() => router.push('/numbers/shuffle')} style={({ pressed }) => [styles.cta, styles.ctaPrimary, pressed && { opacity: 0.85 }]}>
          <MaterialIcons name="shuffle" size={20} color={colors.onAccent} />
          <Text style={styles.ctaText}>Shuffle</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(`/numbers/quiz?topic=${encodeURIComponent(needle ? 'all' : topicKey)}`)}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        >
          <MaterialIcons name="play-arrow" size={22} color={colors.text} />
          <Text style={[styles.ctaText, { color: colors.text }]}>Test me</Text>
        </Pressable>
      </View>

      <BottomNavBar active="numbers" />
    </View>
  );
}

/** Label with an optional highlighted term. */
function Label({ text, tag }: { text: string; tag?: string }) {
  if (!tag || !text.includes(tag)) return <Text style={styles.label}>{text}</Text>;
  const [a, b] = text.split(tag);
  return (
    <Text style={styles.label}>
      {a}
      <Text style={styles.tag}>{tag}</Text>
      {b}
    </Text>
  );
}

/**
 * One fact, in the drill-card language: emoji + label on top, the number big,
 * composite values as inline chips, note always visible. No taps needed.
 */
function FactCard({ fact, fallbackEmoji, hideRegion }: { fact: Fact; fallbackEmoji: string; hideRegion?: boolean }) {
  const wide = !!fact.parts || fact.value.length > 12;
  return (
    <View style={[styles.card, wide && styles.cardWide]}>
      <View style={styles.cardTop}>
        <Text style={styles.emoji}>{emojiFor(fact, fallbackEmoji)}</Text>
        <View style={{ flex: 1 }}>
          <Label text={fact.label} tag={fact.tag} />
        </View>
        {fact.region && !hideRegion ? <Text style={styles.flag}>{REGION_LABEL[fact.region].split(' ')[0]}</Text> : null}
      </View>
      {fact.parts ? (
        <View style={styles.parts}>
          {fact.parts.map((p) => (
            <View key={p.label} style={styles.part}>
              <Text style={styles.partKey}>{p.label}</Text>
              <Text style={styles.partVal}>{p.value}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.value, wide && styles.valueWide]}>{fact.value}</Text>
      )}
      {fact.note ? <Text style={styles.note}>{fact.note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  chipRows: { paddingHorizontal: space.lg, paddingVertical: space.md },
  chipRow: { flexDirection: 'row', gap: space.sm },
  topic: { paddingHorizontal: space.lg, gap: space.lg, marginBottom: space.xl },
  topicTitle: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  blurb: { color: colors.textMuted, fontSize: 14 },
  group: { gap: space.sm },
  groupTitle: { color: colors.textFaint, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  card: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.sm,
    ...shadow.card,
  },
  cardWide: { width: '100%' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  emoji: { fontSize: 20, lineHeight: 24 },
  label: { color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 19 },
  tag: { color: colors.accent, backgroundColor: colors.accentSoft, fontWeight: '800' },
  flag: { fontSize: 14, lineHeight: 20 },
  value: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  valueWide: { fontSize: 22 },
  parts: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  part: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  partKey: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  partVal: { color: colors.accent, fontSize: 14, fontWeight: '800' },
  note: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  empty: { color: colors.textMuted, fontSize: 15, padding: space.lg },
  ctaRow: { position: 'absolute', left: space.lg, right: space.lg, flexDirection: 'row', gap: space.sm },
  cta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    ...shadow.nav,
  },
  ctaPrimary: { backgroundColor: colors.accent, ...shadow.accent },
  ctaText: { color: colors.onAccent, fontSize: 15, fontWeight: '800' },
});
