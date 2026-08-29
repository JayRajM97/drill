import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Framework } from '@/data/frameworks';
import { categoryPastel, colors, radius, shadow, space } from '@/theme/tokens';

/** Compact framework card: emoji, name, category, one-liner, step count. */
export function FrameworkCard({ framework, onPress, wide }: { framework: Framework; onPress: () => void; wide?: boolean }) {
  const cat = framework.categories[0];
  const pastel = categoryPastel[cat];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, wide && styles.wide, pressed && { opacity: 0.92 }]}>
      <View style={styles.top}>
        <Text style={styles.emoji}>{framework.emoji}</Text>
        <View style={[styles.cat, { backgroundColor: pastel.bg }]}>
          <Text style={[styles.catText, { color: pastel.fg }]}>{cat}</Text>
        </View>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {framework.name}
      </Text>
      <Text style={styles.line} numberOfLines={wide ? 2 : 3}>
        {framework.oneLiner}
      </Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {framework.steps.length} steps · {framework.drills.length} drill{framework.drills.length === 1 ? '' : 's'}
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
  cat: { borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 4 },
  catText: { fontSize: 11, fontWeight: '800' },
  name: { color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: '700', letterSpacing: -0.2 },
  line: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  metaText: { color: colors.textFaint, fontSize: 12, fontWeight: '700' },
});
