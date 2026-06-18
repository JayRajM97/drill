import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Category } from '@/types/question';
import { categoryDescription, categoryIcon, categoryPastel, colors, radius, space } from '@/theme/tokens';

interface Props {
  category: Category;
  count: number;
  onPress: () => void;
}

/** Literal to the "Categories (2-Column Grid)" card in 04-home-2x2-grid.html. */
export function CategoryTile({ category, count, onPress }: Props) {
  const pastel = categoryPastel[category];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconChip, { backgroundColor: pastel.bg }]}>
          <MaterialIcons name={categoryIcon[category] as any} size={22} color={pastel.fg} />
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count} drills</Text>
        </View>
      </View>
      <View>
        <Text style={styles.name}>{category}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {categoryDescription[category]}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minHeight: 150,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: space.lg,
    justifyContent: 'space-between',
    gap: space.lg,
  },
  pressed: { opacity: 0.85 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    backgroundColor: colors.secondary,
    borderRadius: radius.pill,
    paddingHorizontal: space.sm,
    paddingVertical: 3,
  },
  countText: { color: colors.onSecondary, fontSize: 11, fontWeight: '600' },
  name: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 4 },
  description: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
});
