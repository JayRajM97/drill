import React from 'react';
import { StyleSheet, View } from 'react-native';
import { space } from '@/theme/tokens';

/**
 * Two-column bento/masonry layout. Each item goes into whichever column is
 * currently shorter (by the caller's height estimate), so short cards stay
 * short and long ones do not stretch their neighbours.
 */
export function Masonry<T>({
  items,
  estimate,
  render,
  keyOf,
}: {
  items: T[];
  estimate: (item: T) => number;
  render: (item: T) => React.ReactNode;
  keyOf: (item: T) => string;
}) {
  const cols: T[][] = [[], []];
  const heights = [0, 0];
  for (const item of items) {
    const c = heights[0] <= heights[1] ? 0 : 1;
    cols[c].push(item);
    heights[c] += estimate(item);
  }
  return (
    <View style={styles.row}>
      {cols.map((col, i) => (
        <View key={i} style={styles.col}>
          {col.map((item) => (
            <View key={keyOf(item)}>{render(item)}</View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, alignItems: 'flex-start' },
  col: { flex: 1, gap: space.md },
});
