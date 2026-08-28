import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { SECTION_LABEL, type DeckCard } from '@/drill/deck';
import { colors, fill, radius, shadow, space } from '@/theme/tokens';

interface Props {
  visible: boolean;
  deck: DeckCard[];
  current: number;
  onJump: (index: number) => void;
  onClose: () => void;
}

const EASE = { duration: 220, easing: Easing.out(Easing.cubic) };

/**
 * Swiggy-style jump menu: a floating popover anchored bottom-right, just
 * above the index button. Lists every card (prompt cards excluded) grouped by
 * section; the current card is outlined. Tap a row to jump straight there.
 */
export function IndexSheet({ visible, deck, current, onJump, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { width: W, height: H } = useWindowDimensions();
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withTiming(visible ? 1 : 0, EASE);
  }, [visible, t]);

  const popStyle = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ scale: 0.92 + 0.08 * t.value }, { translateY: (1 - t.value) * 12 }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: t.value }));

  if (!visible) return null;

  // One row per (section, title); paged cards collapse into a single row with a count.
  const rows: { section: DeckCard['section']; title: string; start: number; end: number; count: number }[] = [];
  deck.forEach((card, index) => {
    if (card.kind === 'prompt' || card.kind === 'done') return;
    const title = card.kind === 'question' ? 'The question' : card.title;
    const last = rows[rows.length - 1];
    if (last && last.section === card.section && last.title === title) {
      last.end = index;
      last.count++;
    } else rows.push({ section: card.section, title, start: index, end: index, count: 1 });
  });
  const activeRow = rows.reduce((acc, r, i) => (r.start <= current ? i : acc), 0);

  // Anchor: bottom-right, clear of the footer (button row + index button).
  const bottom = Math.max(insets.bottom, space.lg) + 56 + 12;

  return (
    <View style={fill} pointerEvents="box-none">
      <Animated.View style={[fill, styles.scrim, scrimStyle]}>
        <Pressable style={fill} onPress={onClose} />
      </Animated.View>
      <Animated.View
        style={[
          styles.pop,
          { right: space.lg, bottom, width: Math.min(W * 0.76, 320), maxHeight: H * 0.55 },
          popStyle,
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {rows.map((r, i) => {
            const newSection = rows[i - 1]?.section !== r.section;
            const isActive = i === activeRow;
            return (
              <React.Fragment key={r.start}>
                {newSection ? (
                  <Text style={[styles.section, i > 0 && { marginTop: space.sm }]}>
                    {SECTION_LABEL[r.section]}
                  </Text>
                ) : null}
                <Pressable
                  onPress={() => onJump(r.start)}
                  style={({ pressed }) => [styles.row, isActive && styles.rowActive, pressed && { opacity: 0.6 }]}
                >
                  <Text style={[styles.rowText, isActive && styles.rowTextActive]} numberOfLines={2}>
                    {r.title}
                  </Text>
                  {r.count > 1 ? (
                    <Text style={styles.count}>{r.count}</Text>
                  ) : r.end < current && !isActive ? (
                    <MaterialIcons name="check" size={16} color={colors.textFaint} />
                  ) : null}
                </Pressable>
              </React.Fragment>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: 'rgba(15,17,21,0.28)' },
  pop: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadow.nav,
  },
  list: { padding: space.sm },
  section: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: space.md,
    paddingTop: space.sm,
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: 11,
    borderRadius: radius.sm,
  },
  rowActive: { backgroundColor: colors.accentSoft },
  rowText: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600', lineHeight: 20 },
  rowTextActive: { color: colors.accent },
  count: { color: colors.textFaint, fontSize: 13, fontWeight: '700' },
});
