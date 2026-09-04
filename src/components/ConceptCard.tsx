import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Concept } from '@/data/concepts';
import { colors, radius, shadow, space } from '@/theme/tokens';

/** Compact Learn card: emoji, name, tagline, depth meta. */
export function ConceptCard({ concept, onPress, wide }: { concept: Concept; onPress: () => void; wide?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, wide && styles.wide, pressed && { opacity: 0.92 }]}>
      <View style={styles.top}>
        <Text style={styles.emoji}>{concept.emoji}</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>AI PM</Text>
        </View>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {concept.name}
      </Text>
      <Text style={styles.line} numberOfLines={wide ? 2 : 3}>
        {concept.tagline}
      </Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {concept.how.length} steps · {concept.useCases.length} products · {concept.terms.length} terms
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
  chipText: { color: colors.accent, fontSize: 11, fontWeight: '800' },
  name: { color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: '700', letterSpacing: -0.2 },
  line: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  metaText: { color: colors.textFaint, fontSize: 12, fontWeight: '700' },
});
