import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AnswerSection } from '@/types/question';
import { colors, space } from '@/theme/tokens';

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

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function AnswerSections({ sections }: { sections: AnswerSection[] }) {
  return (
    <View style={{ gap: space.xl }}>
      {sections.map((s, i) => (
        <View key={i} style={{ gap: space.sm }}>
          <Text style={styles.heading}>{s.heading}</Text>
          <BulletList items={s.bullets} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  mark: { color: colors.accent, fontSize: 15, lineHeight: 22 },
  text: { color: colors.text, fontSize: 15, lineHeight: 22, flex: 1 },
  muted: { color: colors.textFaint, fontSize: 15 },
  label: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  heading: { color: colors.text, fontSize: 16, fontWeight: '700' },
});
