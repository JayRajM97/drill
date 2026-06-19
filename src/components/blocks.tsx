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

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

function Callout({ text }: { text: string }) {
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
  // Equal-weight columns; horizontal scroll keeps wide tables usable on phones.
  const colWidth = Math.max(120, Math.round(680 / Math.max(1, data.headers.length)));
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={[styles.tRow, styles.tHeadRow]}>
          {data.headers.map((h, i) => (
            <Text key={i} style={[styles.tHead, { width: colWidth }]}>
              {h}
            </Text>
          ))}
        </View>
        {data.rows.map((row, r) => (
          <View
            key={r}
            style={[styles.tRow, r % 2 === 1 && styles.tRowAlt]}
          >
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

/** Renders a single answer section based on its `type`. */
export function AnswerSectionView({ section }: { section: AnswerSection }) {
  return (
    <View style={{ gap: space.sm }}>
      <SectionLabel>{section.heading}</SectionLabel>
      {section.type === 'bullets' ? (
        <BulletList items={section.content as string[]} />
      ) : section.type === 'table' ? (
        <Table data={section.content as TableData} />
      ) : section.type === 'callout' ? (
        <Callout text={section.content as string} />
      ) : section.type === 'code' ? (
        <CodeBlock text={section.content as string} />
      ) : (
        <Text style={styles.text}>{section.content as string}</Text>
      )}
    </View>
  );
}

/** Renders a full structured answer (array of typed sections). */
export function AnswerBody({ sections }: { sections: AnswerSection[] }) {
  return (
    <View style={{ gap: space.xl }}>
      {sections.map((s, i) => (
        <AnswerSectionView key={i} section={s} />
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
  mark: { color: colors.accent, fontSize: 15, lineHeight: 22 },
  text: { color: colors.text, fontSize: 15, lineHeight: 24, flex: 1 },
  muted: { color: colors.textFaint, fontSize: 15 },
  label: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  callout: {
    backgroundColor: colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: radius.sm,
    padding: space.lg,
  },
  calloutText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  code: {
    backgroundColor: '#0A0A0C',
    borderRadius: radius.sm,
    padding: space.md,
  },
  codeText: { color: colors.text, fontFamily: 'monospace', fontSize: 13, lineHeight: 20 },
  // table
  tRow: { flexDirection: 'row' },
  tHeadRow: { borderBottomWidth: 1, borderBottomColor: colors.border },
  tRowAlt: { backgroundColor: colors.surface },
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
