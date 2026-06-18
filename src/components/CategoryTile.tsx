import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Category } from '@/types/question';
import { categoryColor, categoryEmoji, colors, radius, space } from '@/theme/tokens';

interface Props {
  category: Category;
  count: number;
  onPress: () => void;
}

export function CategoryTile({ category, count, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { borderColor: categoryColor[category] },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.emoji}>{categoryEmoji[category]}</Text>
      <Text style={styles.name}>{category}</Text>
      <Text style={styles.count}>
        {count} {count === 1 ? 'question' : 'questions'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    padding: space.lg,
    justifyContent: 'space-between',
    gap: space.sm,
  },
  pressed: { transform: [{ translateY: -2 }], opacity: 0.9 },
  emoji: { fontSize: 24 },
  name: { color: colors.text, fontSize: 17, fontWeight: '700' },
  count: { color: colors.textMuted, fontSize: 13 },
});
