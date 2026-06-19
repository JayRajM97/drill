import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { fill } from '@/theme/tokens';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface Props {
  flipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Signature flip card: a genuine 3D Y-axis rotation (not a fade/slide).
 * `flipped` drives rotateY 0deg → 180deg with spring easing (PRD §Signature).
 */
export function FlipCard({ flipped, front, back, style }: Props) {
  const progress = useSharedValue(flipped ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(flipped ? 1 : 0, {
      damping: 16,
      stiffness: 120,
      mass: 0.9,
    });
  }, [flipped, progress]);

  // A small scale dip at the midpoint (card edge-on) makes the flip feel
  // physical rather than like a flat rotation.
  const frontStyle = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1], [0, 180]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 0.94, 1]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotate}deg` }, { scale }],
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1], [180, 360]);
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 0.94, 1]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotate}deg` }, { scale }],
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.face, frontStyle]}>{front}</Animated.View>
      <Animated.View style={[styles.face, styles.back, backStyle]}>
        {back}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  face: {
    ...fill,
    backfaceVisibility: 'hidden',
  },
  back: {},
});
