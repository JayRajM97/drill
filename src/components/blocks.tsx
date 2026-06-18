import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AnswerSection } from '@/types/question';
import { colors, radius, space } from '@/theme/tokens';

export function BulletList({ items }: { items: string[] }) {
  if (!items?.length) {
    return <Text style={styles.muted}>—</Text>;
  }
  return (
    <View style={{ gap: space.sm }}>
      {items.map((item, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.mark}>•</Text>
          <Text style={styles.text}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

/** Numbered list with a circular index marker — matches the Clarifying / Pain
 * Points mockups, where each item is a small card with a number badge. */
export function NumberedList({ items }: { items: string[] }) {
  if (!items?.length) {
    return <Text style={styles.muted}>—</Text>;
  }
  return (
    <View style={{ gap: space.md }}>
      {items.map((item, i) => (
        <View key={i} style={styles.numberedCard}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberBadgeText}>{i + 1}</Text>
          </View>
          <Text style={styles.numberedText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function AnswerSections({ sections }: { sections: AnswerSection[] }) {
  return (
    <View style={{ gap: space.lg }}>
      {sections.map((s, i) => (
        <View key={i} style={styles.sectionCard}>
          <Text style={styles.heading}>{s.heading}</Text>
          <BulletList items={s.bullets} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  mark: { color: colors.primary, fontSize: 15, lineHeight: 22 },
  text: { color: colors.text, fontSize: 15, lineHeight: 22, flex: 1 },
  muted: { color: colors.textFaint, fontSize: 15 },
  label: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
    gap: space.sm,
  },
  heading: { color: colors.text, fontSize: 16, fontWeight: '700' },
  numberedCard: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  numberedText: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 22 },
});
