import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { questions } from '@/data';
import type { Question } from '@/types/question';
import { useProgress } from '@/state/useProgress';
import { QuestionCard } from '@/components/QuestionCard';
import { BottomNavBar } from '@/components/BottomNavBar';
import { colors, radius, space } from '@/theme/tokens';

export default function BookmarksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const [all, setAll] = useState<Question[]>([]);

  useEffect(() => {
    questions.list().then(setAll);
  }, []);

  const bookmarked = all.filter((q) => progress.bookmarkIds.includes(q.id));

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.xl,
          paddingHorizontal: space.lg,
          paddingBottom: space.xxxl,
          gap: space.lg,
        }}
      >
        <Text style={styles.title}>Bookmarks</Text>

        <View style={styles.statRow}>
          <Stat label="Streak" value={`🔥 ${progress.streak}`} />
          <Stat label="Completed" value={`${progress.completedIds.length}`} />
          <Stat label="Saved" value={`${progress.bookmarkIds.length}`} />
        </View>

        {bookmarked.length === 0 ? (
          <Text style={styles.muted}>
            No bookmarks yet. Tap the bookmark icon on any question to save it here.
          </Text>
        ) : (
          <View style={{ gap: space.sm }}>
            {bookmarked.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                compact
                onPress={() => router.push(`/question/${q.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNavBar active="bookmarks" />
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  statRow: { flexDirection: 'row', gap: space.md },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
    alignItems: 'center',
    gap: space.xs,
  },
  statValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 12 },
  muted: { color: colors.textMuted, fontSize: 14 },
});
