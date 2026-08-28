import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, shadow, space } from '@/theme/tokens';

/**
 * Title row with a search icon on the right. Tapping the icon swaps the whole
 * row for a full-width search field; closing clears the query.
 */
export function SearchHeader({
  title,
  subtitle,
  value,
  onChange,
  placeholder,
  right,
}: {
  title: string;
  subtitle?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** Extra control between the title and the search icon (e.g. a segmented filter). */
  right?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<TextInput>(null);

  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 50);
  }, [open]);

  if (open) {
    return (
      <View style={styles.row}>
        <View style={styles.search}>
          <MaterialIcons name="search" size={20} color={colors.textFaint} />
          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder ?? 'Search'}
            placeholderTextColor={colors.textFaint}
            style={[styles.input, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null]}
            returnKeyType="search"
          />
          <Pressable
            onPress={() => {
              onChange('');
              setOpen(false);
            }}
            hitSlop={8}
            style={styles.close}
          >
            <MaterialIcons name="close" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      {right}
      <Pressable onPress={() => setOpen(true)} style={styles.iconBtn} hitSlop={6}>
        <MaterialIcons name="search" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, minHeight: 56 },
  title: { color: colors.text, fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  sub: { color: colors.textMuted, fontSize: 15, marginTop: 4 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingLeft: space.lg,
    paddingRight: 6,
    height: 50,
    ...shadow.card,
  },
  input: { flex: 1, color: colors.text, fontSize: 16 },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
});
