import React, { useEffect, useState } from 'react';
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
import { BottomNavBar, NAV_CLEARANCE } from '@/components/BottomNavBar';
import { DifficultyBadge, Tag } from '@/components/ui';
import { colors, radius, shadow, space } from '@/theme/tokens';

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
  const doneToday = daily.filter((q) => isCompleted(q.id)).length;

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

        {/* Today */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Today</Text>
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
          {daily.map((q, i) => (
            <TodayCard
              key={q.id}
              question={q}
              width={cardW}
              accent={i === 0}
              done={isCompleted(q.id)}
              onPress={() => router.push(`/question/${q.id}`)}
            />
          ))}
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
  const fg = accent ? colors.onAccent : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.today,
        { width },
        accent ? [styles.todayAccent, shadow.accent] : shadow.card,
        pressed && { transform: [{ scale: 0.985 }] },
      ]}
    >
      <View style={styles.todayTop}>
        <Tag label={question.categories[0] ?? ''} tone={accent ? 'onAccent' : 'accent'} />
        {done ? (
          <MaterialIcons name="check-circle" size={22} color={accent ? colors.onAccent : colors.success} />
        ) : null}
      </View>
      <Text style={[styles.todayTitle, { color: fg }]} numberOfLines={4}>
        {question.title}
      </Text>
      <View style={styles.todayBottom}>
        <DifficultyBadge difficulty={question.difficulty} onAccent={accent} />
        <View style={[styles.play, { backgroundColor: accent ? colors.onAccent : colors.accent }]}>
          <MaterialIcons name="arrow-forward" size={20} color={accent ? colors.accent : colors.onAccent} />
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
  todayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayTitle: { fontSize: 20, lineHeight: 27, fontWeight: '700', letterSpacing: -0.3 },
  todayBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  play: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, paddingHorizontal: space.lg },
  cell: { width: '47%', flexGrow: 1 },
});
