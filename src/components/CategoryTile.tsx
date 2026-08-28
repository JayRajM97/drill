import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Category } from '@/types/question';
import { categoryDescription, colors, space } from '@/theme/tokens';
import { Card, CategoryIcon } from './ui';

interface Props {
  category: Category;
  count: number;
  onPress: () => void;
}

export function CategoryTile({ category, count, onPress }: Props) {
  return (
    <Card onPress={onPress} style={styles.tile}>
      <CategoryIcon category={category} size={44} />
      <View>
        <Text style={styles.name}>{category}</Text>
        <Text style={styles.desc} numberOfLines={1}>
          {categoryDescription[category]}
        </Text>
        <Text style={styles.count}>{count} drills</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, minHeight: 124, padding: space.lg, justifyContent: 'space-between', gap: space.lg },
  name: { color: colors.text, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  desc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  count: { color: colors.textFaint, fontSize: 12, fontWeight: '600', marginTop: 8 },
});
