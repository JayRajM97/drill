import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { questions, type CategorySummary } from '@/data';
import type { Question } from '@/types/question';
import { useDaily } from '@/state/useDaily';
import { useProgress } from '@/state/useProgress';
import { CategoryTile } from '@/components/CategoryTile';
import { ALL_FACTS, emojiFor, type Fact } from '@/data/numbers';
import { todayKey } from '@/state/useDaily';
import { BottomNavBar, NAV_CLEARANCE } from '@/components/BottomNavBar';
import { DifficultyBadge, Tag } from '@/components/ui';
import { colors, radius, shadow, space } from '@/theme/tokens';

/** Six numbers for today, stable for the date. */
function todaysNumbers(): Fact[] {
  const seed = todayKey();
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const pool = ALL_FACTS.filter((f) => !f.parts && f.value.length <= 14);
  const out: Fact[] = [];
  for (let k = 0; out.length < 6 && k < pool.length; k++) {
    const f = pool[(h + k * 37) % pool.length];
    if (!out.includes(f)) out.push(f);
  }
  return out;
}

/** Bento pattern: which tiles are wide, per row/column. */
const BENTO = [
  [true, false, false],
  [false, true, false],
];

/** Soft tint per topic so the grid reads as colour, not white boxes. */
const TINT: Record<string, { bg: string; fg: string }> = {
  India: { bg: '#FFF1E6', fg: '#C2410C' },
  US: { bg: '#E9EFFF', fg: '#1F5EFF' },
  World: { bg: '#E6F6EC', fg: '#15803D' },
  Mobile: { bg: '#F1E8FF', fg: '#7E22CE' },
  'Search & AI': { bg: '#FDE7F1', fg: '#BE185D' },
  'Food delivery': { bg: '#FFF7D6', fg: '#A16207' },
  'Quick commerce': { bg: '#FFF7D6', fg: '#A16207' },
  'Ride-sharing': { bg: '#E0F3FB', fg: '#0369A1' },
  Payments: { bg: '#E6F6EC', fg: '#15803D' },
  'Fintech India': { bg: '#E6F6EC', fg: '#15803D' },
  'E-commerce': { bg: '#FFF1E6', fg: '#C2410C' },
  Social: { bg: '#FDE7F1', fg: '#BE185D' },
  'Social usage': { bg: '#FDE7F1', fg: '#BE185D' },
  'Creator economy': { bg: '#F1E8FF', fg: '#7E22CE' },
  Streaming: { bg: '#FDE7F1', fg: '#BE185D' },
  Transport: { bg: '#E0F3FB', fg: '#0369A1' },
  Health: { bg: '#E6F6EC', fg: '#15803D' },
  'Work & SaaS': { bg: '#E9EFFF', fg: '#1F5EFF' },
  Travel: { bg: '#E0F3FB', fg: '#0369A1' },
  Gaming: { bg: '#F1E8FF', fg: '#7E22CE' },
  Anchors: { bg: '#EEF0F3', fg: '#0F1115' },
  default: { bg: '#E9EFFF', fg: '#1F5EFF' },
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const { progress, isCompleted } = useProgress();
  const { daily } = useDaily();
  const [categories, setCategories] = useState<CategorySummary[]>([]);

  useEffect(() => {
    questions.getCategories().then(setCategories);
  }, []);

  const cardW = Math.min(W - space.lg * 2 - 36, 360);
  const numbers = useMemo(() => todaysNumbers(), []);
  const doneToday = daily.filter((q) => isCompleted(q.id)).length;
  // Finished case studies drop to the back of the row.
  const ordered = [...daily.filter((q) => !isCompleted(q.id)), ...daily.filter((q) => isCompleted(q.id))];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.lg, paddingBottom: NAV_CLEARANCE }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greet}>{greeting()}</Text>
            <Text style={styles.hero}>Ready to drill?</Text>
          </View>
          <View style={styles.streak}>
            <MaterialIcons name="local-fire-department" size={18} color={colors.warning} />
            <Text style={styles.streakText}>{progress.streak}</Text>
          </View>
        </View>

        {/* Today's case studies */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Today's case studies</Text>
          <Text style={styles.sectionMeta}>
            {doneToday} / {daily.length} done
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardW + space.md}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: space.lg, gap: space.md, paddingBottom: space.sm }}
        >
          {ordered.map((q, i) => (
            <TodayCard
              key={q.id}
              question={q}
              width={cardW}
              accent={i === 0 && !isCompleted(q.id)}
              done={isCompleted(q.id)}
              onPress={() => router.push(`/question/${q.id}`)}
            />
          ))}
        </ScrollView>

        {/* Today's numbers: two rows, scroll sideways */}
        <View style={[styles.sectionHead, { marginTop: space.xl }]}>
          <Text style={styles.sectionTitle}>Today's numbers</Text>
          <Pressable onPress={() => router.push('/numbers')} hitSlop={8}>
            <Text style={styles.link}>All numbers</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.sm }}>
          <View style={styles.numGrid}>
            {[numbers.slice(0, 3), numbers.slice(3, 6)].map((row, r) => (
              <View key={r} style={styles.numRow}>
                {row.map((f, c) => {
                  const tint = TINT[f.topic ?? ''] ?? TINT.default;
                  const wide = BENTO[r][c];
                  return (
                    <Pressable
                      key={f.id}
                      onPress={() => router.push('/numbers')}
                      style={({ pressed }) => [styles.numTile, { width: wide ? 200 : 140, backgroundColor: tint.bg }, pressed && { opacity: 0.9 }]}
                    >
                      <View style={styles.numTop}>
                        <Text style={styles.numEmoji}>{emojiFor(f, '🔢')}</Text>
                        <Text style={[styles.numTopic, { color: tint.fg }]} numberOfLines={1}>{f.topic}</Text>
                      </View>
                      <Text style={[styles.numValue, { color: tint.fg }]} numberOfLines={1} adjustsFontSizeToFit>{f.value}</Text>
                      <Text style={styles.numLabel} numberOfLines={2}>{f.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Categories */}
        <View style={[styles.sectionHead, { marginTop: space.xl }]}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <Pressable onPress={() => router.push('/practice')} hitSlop={8}>
            <Text style={styles.link}>See all</Text>
          </Pressable>
        </View>
        <View style={styles.grid}>
          {categories.map((c) => (
            <View key={c.category} style={styles.cell}>
              <CategoryTile
                category={c.category}
                count={c.count}
                onPress={() => router.push(`/category/${encodeURIComponent(c.category)}`)}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNavBar active="home" />
    </View>
  );
}

function TodayCard({
  question,
  width,
  accent,
  done,
  onPress,
}: {
  question: Question;
  width: number;
  accent: boolean;
  done: boolean;
  onPress: () => void;
}) {
  const filled = accent || done;
  const fg = filled ? colors.onAccent : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.today,
        { width },
        done ? [styles.todayDone, shadow.card] : accent ? [styles.todayAccent, shadow.accent] : shadow.card,
        pressed && { transform: [{ scale: 0.985 }] },
      ]}
    >
      <View style={styles.todayTop}>
        <Tag label={question.categories[0] ?? ''} tone={filled ? 'onAccent' : 'accent'} />
        {done ? (
          <View style={styles.doneChip}>
            <MaterialIcons name="check" size={14} color={colors.success} />
            <Text style={styles.doneChipText}>Done</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.todayTitle, { color: fg }]} numberOfLines={4}>
        {question.title}
      </Text>
      <View style={styles.todayBottom}>
        <View style={[styles.diffChip, filled && { backgroundColor: colors.onAccent }]}>
          <DifficultyBadge difficulty={question.difficulty} />
        </View>
        <View style={[styles.play, { backgroundColor: filled ? colors.onAccent : colors.accent }]}>
          <MaterialIcons name={done ? 'replay' : 'arrow-forward'} size={20} color={done ? colors.success : filled ? colors.accent : colors.onAccent} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    marginBottom: space.xl,
  },
  greet: { color: colors.textMuted, fontSize: 15, fontWeight: '500', marginBottom: 4 },
  hero: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...shadow.card,
  },
  streakText: { color: colors.text, fontSize: 15, fontWeight: '800' },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    marginBottom: space.md,
  },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
  sectionMeta: { color: colors.textFaint, fontSize: 13, fontWeight: '600' },
  link: { color: colors.accent, fontSize: 14, fontWeight: '700' },

  today: {
    height: 232,
    borderRadius: radius.card,
    padding: space.xl,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
  },
  todayAccent: { backgroundColor: colors.accent },
  todayDone: { backgroundColor: colors.success },
  doneChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.onAccent, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  doneChipText: { color: colors.success, fontSize: 12, fontWeight: '800' },
  diffChip: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  todayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayTitle: { fontSize: 20, lineHeight: 27, fontWeight: '700', letterSpacing: -0.3 },
  todayBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  numGrid: { gap: space.sm },
  numRow: { flexDirection: 'row', gap: space.sm },
  numTile: { height: 122, borderRadius: radius.lg, padding: space.md, justifyContent: 'space-between' },
  numTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  numEmoji: { fontSize: 16 },
  numTopic: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', flexShrink: 1 },
  numValue: { fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  numLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600', lineHeight: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, paddingHorizontal: space.lg },
  cell: { width: '47%', flexGrow: 1 },
});
