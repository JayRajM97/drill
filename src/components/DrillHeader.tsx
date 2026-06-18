import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';

/** Literal TopAppBar: bolt + "Drill" wordmark (left), streak chip (right). */
export function DrillHeader({ streak }: { streak: number }) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <MaterialIcons name="bolt" size={22} color={colors.primary} />
        <Text style={styles.wordmark}>Drill</Text>
      </View>
      <Text style={styles.streak}>{streak} 🔥</Text>
    </View>
  );
}

/** Sticky strip below the header showing the truncated question context. */
export function ContextStrip({ question }: { question: string }) {
  return (
    <View style={styles.strip}>
      <MaterialIcons name="help-outline" size={14} color={colors.primary} />
      <Text style={styles.stripText} numberOfLines={1}>
        {question}
      </Text>
    </View>
  );
}

export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressLabels}>
        <Text style={styles.progressLabel}>UX Case Study</Text>
        <Text style={styles.progressLabel}>
          Step {step} of {total}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(step / total) * 100}%` }]} />
      </View>
    </View>
  );
}

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={styles.backBtn}>
      <Text style={styles.backText}>‹ Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  wordmark: { color: colors.primary, fontSize: 20, fontWeight: '700' },
  streak: { color: colors.text, fontSize: 14, fontWeight: '600' },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  stripText: { flex: 1, color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  progressWrap: { paddingHorizontal: space.lg, paddingTop: space.lg, gap: space.sm },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.accent },
  backBtn: { paddingVertical: space.xs },
  backText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
