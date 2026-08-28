import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { questions } from '@/data';
import type { Question } from '@/types/question';
import { useProgress } from '@/state/useProgress';
import { BottomNavBar, NAV_CLEARANCE } from '@/components/BottomNavBar';
import { QuestionCard } from '@/components/QuestionCard';
import { Card, Eyebrow } from '@/components/ui';
import { colors, radius, shadow, space } from '@/theme/tokens';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress, toggleBookmark } = useProgress();
  const [all, setAll] = useState<Question[]>([]);

  useEffect(() => {
    questions.list().then(setAll);
  }, []);

  const saved = all.filter((q) => progress.bookmarkIds.includes(q.id));

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.lg,
          paddingHorizontal: space.lg,
          paddingBottom: NAV_CLEARANCE,
          gap: space.md,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.head}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={30} color={colors.accent} />
          </View>
          <View>
            <Text style={styles.title}>You</Text>
            <Text style={styles.sub}>Keep the streak alive.</Text>
          </View>
        </View>

        <Card style={[styles.streak, shadow.accent]}>
          <Eyebrow style={{ color: colors.onAccentMuted }}>Day streak</Eyebrow>
          <View style={styles.streakRow}>
            <Text style={styles.streakNum}>{progress.streak}</Text>
            <MaterialIcons name="local-fire-department" size={44} color={colors.onAccent} />
          </View>
        </Card>

        <View style={styles.row}>
          <Card style={styles.stat}>
            <MaterialIcons name="check-circle" size={22} color={colors.success} />
            <Text style={styles.statNum}>{progress.completedIds.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
          <Card style={styles.stat}>
            <MaterialIcons name="bookmark" size={22} color={colors.accent} />
            <Text style={styles.statNum}>{saved.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </Card>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Saved</Text>
          <Text style={styles.sectionMeta}>{saved.length}</Text>
        </View>
        {saved.length === 0 ? (
          <Card style={styles.empty}>
            <MaterialIcons name="bookmark-border" size={32} color={colors.textFaint} />
            <Text style={styles.emptyTitle}>Nothing saved yet</Text>
            <Text style={styles.emptyText}>Tap the bookmark on any question to keep it here.</Text>
          </Card>
        ) : (
          saved.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              compact
              bookmarked
              onToggleBookmark={() => toggleBookmark(q.id)}
              onPress={() => router.push(`/question/${q.id}`)}
            />
          ))
        )}
      </ScrollView>

      <BottomNavBar active="profile" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginBottom: space.md },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  sub: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  streak: { backgroundColor: colors.accent, borderRadius: radius.card, gap: space.md },
  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakNum: { color: colors.onAccent, fontSize: 64, fontWeight: '800', letterSpacing: -2, lineHeight: 70 },
  row: { flexDirection: 'row', gap: space.md },
  stat: { flex: 1, gap: 6, alignItems: 'flex-start' },
  statNum: { color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: space.lg,
    marginBottom: space.xs,
  },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
  sectionMeta: { color: colors.textFaint, fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: space.xs },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', maxWidth: 240 },
});
