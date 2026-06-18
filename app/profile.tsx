import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useProgress } from '@/state/useProgress';
import { BottomNavBar } from '@/components/BottomNavBar';
import { colors, radius, space } from '@/theme/tokens';

// No Profile mockup was shared — this reuses the real stat values (streak,
// completed, saved) from the stat-card pattern seen across the other screens
// rather than inventing unsupplied content.
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.xl,
          paddingHorizontal: space.lg,
          paddingBottom: space.xxxl,
          gap: space.xl,
        }}
      >
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={32} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>Your Progress</Text>
            <Text style={styles.subtitle}>Keep drilling to grow your streak.</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <Stat icon="local-fire-department" value={`${progress.streak}`} label="Day Streak" />
          <Stat icon="check-circle" value={`${progress.completedIds.length}`} label="Completed" />
          <Stat icon="bookmark" value={`${progress.bookmarkIds.length}`} label="Saved" />
        </View>
      </ScrollView>

      <BottomNavBar active="profile" />
    </View>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.stat}>
      <MaterialIcons name={icon} size={20} color={colors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.accent}26`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
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
  statValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 12 },
});
