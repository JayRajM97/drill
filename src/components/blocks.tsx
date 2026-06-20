import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type {
  AnswerSection,
  StrongVsGenericRow,
  TableData,
} from '@/types/question';
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

export function Callout({ text }: { text: string }) {
  return (
    <View style={styles.callout}>
      <Text style={styles.calloutText}>{text}</Text>
    </View>
  );
}

function CodeBlock({ text }: { text: string }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.code}>
      <Text style={styles.codeText}>{text}</Text>
    </ScrollView>
  );
}

export function Table({ data }: { data: TableData }) {
  const colWidth = Math.max(120, Math.round(680 / Math.max(1, data.headers.length)));
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.tableWrap}>
        <View style={[styles.tRow, styles.tHeadRow]}>
          {data.headers.map((h, i) => (
            <Text key={i} style={[styles.tHead, { width: colWidth }]}>
              {h}
            </Text>
          ))}
        </View>
        {data.rows.map((row, r) => (
          <View key={r} style={[styles.tRow, r % 2 === 1 && styles.tRowAlt]}>
            {row.map((cell, c) => (
              <Text key={c} style={[styles.tCell, { width: colWidth }]}>
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/** Renders just the body of one answer section, switched on its `type`. */
export function SectionContent({ section }: { section: AnswerSection }) {
  switch (section.type) {
    case 'bullets':
      return <BulletList items={section.content as string[]} />;
    case 'table':
      return <Table data={section.content as TableData} />;
    case 'callout':
      return <Callout text={section.content as string} />;
    case 'code':
      return <CodeBlock text={section.content as string} />;
    default:
      return <Text style={styles.text}>{section.content as string}</Text>;
  }
}

/** A full structured answer: each section as a card (heading + typed content). */
export function AnswerSections({ sections }: { sections: AnswerSection[] }) {
  return (
    <View style={{ gap: space.lg }}>
      {sections.map((s, i) => (
        <View key={i} style={styles.sectionCard}>
          <Text style={styles.heading}>{s.heading}</Text>
          <SectionContent section={s} />
        </View>
      ))}
    </View>
  );
}

export function StrongVsGeneric({ rows }: { rows: StrongVsGenericRow[] }) {
  return (
    <View style={{ gap: space.sm }}>
      <View style={[styles.tRow, styles.tHeadRow]}>
        <Text style={[styles.tHead, styles.svgCol]}>Strong answer</Text>
        <Text style={[styles.tHead, styles.svgCol]}>Generic answer</Text>
      </View>
      {rows.map((row, i) => (
        <View key={i} style={[styles.tRow, i % 2 === 1 && styles.tRowAlt]}>
          <Text style={[styles.tCell, styles.svgCol, styles.svgStrong]}>
            {row.strong}
          </Text>
          <Text style={[styles.tCell, styles.svgCol]}>{row.generic}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.sm },
  mark: { color: colors.primary, fontSize: 15, lineHeight: 22 },
  text: { color: colors.text, fontSize: 15, lineHeight: 23, flex: 1 },
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
  // callout
  callout: {
    backgroundColor: colors.bgElevated,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: radius.md,
    padding: space.lg,
  },
  calloutText: { color: colors.text, fontSize: 15, lineHeight: 23, fontStyle: 'italic' },
  // code
  code: { backgroundColor: colors.bgElevated, borderRadius: radius.md, padding: space.md },
  codeText: { color: colors.text, fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
  // table
  tableWrap: { borderRadius: radius.md, overflow: 'hidden' },
  tRow: { flexDirection: 'row' },
  tHeadRow: { borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surfaceAlt },
  tRowAlt: { backgroundColor: colors.bgElevated },
  tHead: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    padding: space.sm,
  },
  tCell: { color: colors.text, fontSize: 13, lineHeight: 19, padding: space.sm },
  svgCol: { width: 170 },
  svgStrong: { color: colors.text, fontWeight: '600' },
});
