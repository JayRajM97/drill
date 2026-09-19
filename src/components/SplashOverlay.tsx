import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, space } from '@/theme/tokens';

/**
 * The opening beat. The native splash shows the mark for a frame and then
 * vanishes; this holds it, brings the line in underneath, and sits there for
 * about three seconds before handing over to the app.
 */
const HOLD_MS = 2600;
const FADE_MS = 420;

export function SplashOverlay({ onDone }: { onDone: () => void }) {
  const mark = useSharedValue(0);
  const line1 = useSharedValue(0);
  const line2 = useSharedValue(0);
  const veil = useSharedValue(1);

  useEffect(() => {
    mark.value = withSpring(1, { damping: 14, stiffness: 120, mass: 0.8 });
    // The two halves of the line arrive one after the other, so it reads
    // rather than appearing all at once.
    line1.value = withDelay(420, withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) }));
    line2.value = withDelay(680, withTiming(1, { duration: 460, easing: Easing.out(Easing.cubic) }));
    veil.value = withDelay(HOLD_MS, withTiming(0, { duration: FADE_MS }));

    const t = setTimeout(onDone, HOLD_MS + FADE_MS);
    return () => clearTimeout(t);
  }, [mark, line1, line2, veil, onDone]);

  const veilStyle = useAnimatedStyle(() => ({ opacity: veil.value }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: mark.value,
    transform: [{ scale: 0.82 + mark.value * 0.18 }],
  }));
  const line1Style = useAnimatedStyle(() => ({
    opacity: line1.value,
    transform: [{ translateY: (1 - line1.value) * 12 }],
  }));
  const line2Style = useAnimatedStyle(() => ({
    opacity: line2.value,
    transform: [{ translateY: (1 - line2.value) * 12 }],
  }));

  return (
    <Animated.View style={[styles.fill, veilStyle]} pointerEvents="none">
      <View style={styles.center}>
        <Animated.View style={markStyle}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
        </Animated.View>
        <Animated.Text style={[styles.line, line1Style]}>Never run out of</Animated.Text>
        <Animated.Text style={[styles.line, line2Style]}>case drills again.</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill, backgroundColor: colors.bg, zIndex: 100 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 104, height: 104, borderRadius: 26, marginBottom: space.xl },
  line: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.7,
    textAlign: 'center',
  },
});
