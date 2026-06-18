import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, fill, radius, space } from '@/theme/tokens';

interface Props {
  visible: boolean;
  title: string;
  items: string[];
  onClose: () => void;
}

/**
 * Peek bottom sheet (PRD §4): slides up from the bottom, draggable down to
 * dismiss, tap the scrim to close. Shows a section as a bullet list.
 */
export function BottomSheet({ visible, title, items, onClose }: Props) {
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onChange((e) => {
      translateY.value = Math.max(0, translateY.value + e.changeY);
    })
    .onEnd(() => {
      if (translateY.value > 100) {
        runOnJS(onClose)();
      }
      translateY.value = withTiming(0);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.scrim} onPress={onClose} />
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          {items.length === 0 ? (
            <Text style={styles.muted}>No content for this section yet.</Text>
          ) : (
            items.map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletMark}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...fill, justifyContent: 'flex-end' },
  scrim: { ...fill, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.xl,
    paddingBottom: space.xxl,
    maxHeight: '60%',
    gap: space.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: space.md,
  },
  title: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: space.sm,
  },
  bulletRow: { flexDirection: 'row', gap: space.sm },
  bulletMark: { color: colors.accent, fontSize: 15, lineHeight: 22 },
  bulletText: { color: colors.text, fontSize: 15, lineHeight: 22, flex: 1 },
  muted: { color: colors.textMuted, fontSize: 14 },
});
