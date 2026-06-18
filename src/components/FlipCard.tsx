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
      damping: 14,
      stiffness: 90,
    });
  }, [flipped, progress]);

  const frontStyle = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1], [0, 180]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotate}deg` }],
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotate = interpolate(progress.value, [0, 1], [180, 360]);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotate}deg` }],
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
