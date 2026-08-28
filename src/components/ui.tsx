import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Category, Difficulty } from '@/types/question';
import { categoryIcon, categoryPastel, colors, radius, shadow, space } from '@/theme/tokens';

type IconName = keyof typeof MaterialIcons.glyphMap;

/** White floating card — the base surface for everything. */
export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Small rounded label: category / domain / any tag. */
export function Tag({
  label,
  tone = 'neutral',
  style,
}: {
  label: string;
  tone?: 'neutral' | 'accent' | 'onAccent';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.tag,
        tone === 'accent' && styles.tagAccent,
        tone === 'onAccent' && styles.tagOnAccent,
        style,
      ]}
    >
      <Text
        style={[
          styles.tagText,
          tone === 'accent' && { color: colors.accent },
          tone === 'onAccent' && { color: colors.onAccent },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Easy: colors.easy,
  Medium: colors.medium,
  Hard: colors.hard,
};

/** Coloured dot + label, e.g. "● Medium". */
export function DifficultyBadge({
  difficulty,
  onAccent,
}: {
  difficulty: Difficulty;
  onAccent?: boolean;
}) {
  return (
    <View style={styles.diffRow}>
      <View style={[styles.diffDot, { backgroundColor: onAccent ? colors.onAccent : DIFFICULTY_COLOR[difficulty] }]} />
      <Text style={[styles.diffText, onAccent && { color: colors.onAccentMuted }]}>{difficulty}</Text>
    </View>
  );
}

export function DifficultyDot({ difficulty }: { difficulty: Difficulty }) {
  return <View style={[styles.diffDot, { backgroundColor: DIFFICULTY_COLOR[difficulty] }]} />;
}

/** Pastel square with the category icon. */
export function CategoryIcon({ category, size = 40 }: { category: Category; size?: number }) {
  const pastel = categoryPastel[category];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: pastel.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialIcons name={categoryIcon[category] as IconName} size={size * 0.5} color={pastel.fg} />
    </View>
  );
}

/** Selectable pill chip for filter rows. */
export function Chip({
  label,
  active,
  onPress,
  count,
  icon,
  emoji,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  count?: number;
  /** MaterialIcons glyph shown before the label. */
  icon?: IconName;
  /** Emoji shown before the label (alternative to icon). */
  emoji?: string;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      {icon ? <MaterialIcons name={icon} size={16} color={active ? colors.onAccent : colors.textMuted} /> : null}
      {emoji ? <Text style={styles.chipEmoji}>{emoji}</Text> : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      {count != null ? (
        <Text style={[styles.chipCount, active && { color: colors.onAccentMuted }]}>{count}</Text>
      ) : null}
    </Pressable>
  );
}

/** Primary / ghost pill button. */
export function PillButton({
  label,
  onPress,
  icon,
  tone = 'primary',
  style,
  textStyle,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  tone?: 'primary' | 'ghost' | 'onAccent';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const fg =
    tone === 'primary' ? colors.onAccent : tone === 'onAccent' ? colors.accent : colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        tone === 'primary' && styles.btnPrimary,
        tone === 'ghost' && styles.btnGhost,
        tone === 'onAccent' && styles.btnOnAccent,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
        style,
      ]}
    >
      <Text style={[styles.btnText, { color: fg }, textStyle]}>{label}</Text>
      {icon ? <MaterialIcons name={icon} size={18} color={fg} /> : null}
    </Pressable>
  );
}

/** Round icon-only button (header actions, back, close). */
export function IconButton({
  icon,
  onPress,
  tone = 'surface',
  size = 44,
  style,
}: {
  icon: IconName;
  onPress: () => void;
  tone?: 'surface' | 'muted' | 'accent';
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    tone === 'accent' ? colors.accent : tone === 'muted' ? colors.surfaceAlt : colors.surface;
  const fg = tone === 'accent' ? colors.onAccent : colors.text;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.iconBtn,
        tone === 'surface' && shadow.card,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      <MaterialIcons name={icon} size={size * 0.5} color={fg} />
    </Pressable>
  );
}

/** Small uppercase label above a block. */
export function Eyebrow({ children, style }: { children: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.eyebrow, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    ...shadow.card,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },

  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 5,
  },
  tagAccent: { backgroundColor: colors.accentSoft },
  tagOnAccent: { backgroundColor: 'rgba(255,255,255,0.18)' },
  tagText: { color: colors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },

  diffRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  diffDot: { width: 7, height: 7, borderRadius: 4 },
  diffText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: space.lg,
    paddingVertical: 10,
    ...shadow.card,
  },
  chipActive: { backgroundColor: colors.accent },
  chipEmoji: { fontSize: 14 },
  chipText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  chipTextActive: { color: colors.onAccent },
  chipCount: { color: colors.textFaint, fontSize: 13, fontWeight: '600' },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    borderRadius: radius.pill,
    paddingHorizontal: space.xl,
    paddingVertical: 16,
  },
  btnPrimary: { backgroundColor: colors.accent, ...shadow.accent },
  btnGhost: { backgroundColor: colors.surface, ...shadow.card },
  btnOnAccent: { backgroundColor: colors.onAccent },
  btnText: { fontSize: 16, fontWeight: '700' },

  iconBtn: { alignItems: 'center', justifyContent: 'center' },

  eyebrow: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
