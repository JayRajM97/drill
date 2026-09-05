import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Playbook } from '@/data/analytics';
import { colors, radius, shadow, space } from '@/theme/tokens';

/** Compact Data card: emoji, name, tagline, depth meta. */
export function PlaybookCard({ playbook, onPress, wide }: { playbook: Playbook; onPress: () => void; wide?: boolean }) {
  const scenario = playbook.kind === 'scenario';
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, wide && styles.wide, pressed && { opacity: 0.92 }]}>
      <View style={styles.top}>
        <Text style={styles.emoji}>{playbook.emoji}</Text>
        <View style={[styles.chip, scenario && styles.chipScenario]}>
          <Text style={[styles.chipText, scenario && styles.chipTextScenario]}>{scenario ? 'Worked example' : 'Method'}</Text>
        </View>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {scenario ? playbook.name.replace('Worked example: ', '') : playbook.name}
      </Text>
      <Text style={styles.line} numberOfLines={wide ? 2 : 3}>
        {playbook.tagline}
      </Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {playbook.steps.length} steps · {playbook.pull.length} data cuts
        </Text>
        <MaterialIcons name="arrow-forward" size={16} color={colors.accent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, gap: space.sm, ...shadow.card },
  wide: { width: 250 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emoji: { fontSize: 22 },
  chip: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  chipScenario: { backgroundColor: colors.accent },
  chipText: { color: colors.accent, fontSize: 11, fontWeight: '800' },
  chipTextScenario: { color: colors.onAccent },
  name: { color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: '700', letterSpacing: -0.2 },
  line: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  metaText: { color: colors.textFaint, fontSize: 12, fontWeight: '700' },
});
