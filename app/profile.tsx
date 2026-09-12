import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { questions } from '@/data';
import type { Question } from '@/types/question';
import { useProgress } from '@/state/useProgress';
import { BottomNavBar, NAV_CLEARANCE } from '@/components/BottomNavBar';
import { QuestionCard } from '@/components/QuestionCard';
import { Card, Eyebrow } from '@/components/ui';
import { SLOTS, areNudgesEnabled, pendingNudges, setNudgesEnabled } from '@/notifications/daily';
import { colors, radius, shadow, space } from '@/theme/tokens';

/** 13:30 -> "1:30 PM" */
function fmtTime(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { progress, toggleBookmark } = useProgress();
  const [all, setAll] = useState<Question[]>([]);
  const [nudges, setNudges] = useState(true);
  const [queued, setQueued] = useState<number | null>(null);

  useEffect(() => {
    questions.list().then(setAll);
    areNudgesEnabled().then(setNudges);
    pendingNudges().then((p) => setQueued(p.length)).catch(() => {});
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

        {Platform.OS !== 'web' ? (
          <Card style={styles.nudge}>
            <View style={styles.nudgeHead}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.nudgeTitle}>Daily reminders</Text>
                <Text style={styles.nudgeSub}>
                  Six a day: 2 case studies, 2 numbers, 2 frameworks.
                  {nudges && queued ? ` ${queued} queued.` : ''}
                </Text>
              </View>
              <Switch
                value={nudges}
                onValueChange={(on) => {
                  setNudges(on);
                  setNudgesEnabled(on)
                    .then(() => pendingNudges())
                    .then((p) => setQueued(p.length))
                    .catch(() => {});
                }}
                trackColor={{ true: colors.accent, false: colors.border }}
              />
            </View>
            <View style={styles.nudgeTimes}>
              {SLOTS.map((s) => (
                <View key={`${s.hour}:${s.minute}`} style={[styles.timePill, !nudges && { opacity: 0.4 }]}>
                  <Text style={styles.timeText}>{fmtTime(s.hour, s.minute)}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

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
  nudge: { gap: space.md, marginTop: space.lg },
  nudgeHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  nudgeTitle: { color: colors.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  nudgeSub: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  nudgeTimes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  timePill: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  timeText: { color: colors.accent, fontSize: 12, fontWeight: '800' },
  empty: { alignItems: 'center', gap: space.sm, paddingVertical: space.xl },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginTop: space.xs },
  emptyText: { color: colors.textMuted, fontSize: 14, textAlign: 'center', maxWidth: 240 },
});
