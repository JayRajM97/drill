import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { questions, type CategorySummary } from '@/data';
import { useDaily } from '@/state/useDaily';
import { useProgress } from '@/state/useProgress';
import { CategoryTile } from '@/components/CategoryTile';
import { colors, radius, space } from '@/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const { daily } = useDaily();
  const [categories, setCategories] = useState<CategorySummary[]>([]);

  useEffect(() => {
    questions.getCategories().then(setCategories);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + space.lg,
        paddingBottom: insets.bottom + space.xxl,
        paddingHorizontal: space.lg,
        gap: space.xl,
      }}
    >
      {/* Header: wordmark + streak */}
      <View style={styles.header}>
        <Text style={styles.wordmark}>DRILL</Text>
        <Pressable style={styles.streak} onPress={() => router.push('/bookmarks')}>
          <Text style={styles.streakText}>🔥 {progress.streak}</Text>
        </Pressable>
      </View>

      {/* Today's Drill */}
      <View style={{ gap: space.md }}>
        <Text style={styles.sectionTitle}>Today&apos;s Drill</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space.md, paddingRight: space.lg }}
        >
          {daily.map((q) => (
            <Pressable
              key={q.id}
              style={styles.dailyCard}
              onPress={() => router.push(`/question/${q.id}`)}
            >
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>New</Text>
              </View>
              <Text style={styles.dailyCategory}>{q.categories[0]}</Text>
              <Text style={styles.dailyTitle} numberOfLines={3}>
                {q.title}
              </Text>
            </Pressable>
          ))}
          {daily.length === 0 ? (
            <Text style={styles.muted}>No questions seeded yet.</Text>
          ) : null}
        </ScrollView>
      </View>

      {/* Categories grid */}
      <View style={{ gap: space.md }}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.grid}>
          {categories.map((c) => (
            <View key={c.category} style={styles.gridCell}>
              <CategoryTile
                category={c.category}
                count={c.count}
                onPress={() =>
                  router.push(`/category/${encodeURIComponent(c.category)}`)
                }
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordmark: {
    color: colors.accent,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
  },
  streak: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  streakText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '700' },
  dailyCard: {
    width: 200,
    minHeight: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.sm,
  },
  newBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  newBadgeText: { color: colors.bg, fontSize: 11, fontWeight: '700' },
  dailyCategory: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  dailyTitle: { color: colors.text, fontSize: 15, fontWeight: '600', lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  gridCell: { width: '47%', flexGrow: 1 },
  muted: { color: colors.textMuted, fontSize: 14 },
});
