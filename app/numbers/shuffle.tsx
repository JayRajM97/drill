import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ALL_FACTS, emojiFor, NUMBER_TOPICS, contextFor, questionFor, type Fact } from '@/data/numbers';
import { Eyebrow, IconButton, PillButton } from '@/components/ui';
import { FlipCard } from '@/components/FlipCard';
import { colors, radius, shadow, space } from '@/theme/tokens';

const MOVE = { duration: 320, easing: Easing.inOut(Easing.cubic) };

function topicOf(fact: Fact) {
  return NUMBER_TOPICS.find((t) => t.groups.some((g) => g.facts.includes(fact)));
}

/** Endless random order over the whole DB: a fresh shuffle each time the deck runs out. */
function useRandomDeck() {
  const [order, setOrder] = useState<Fact[]>(() => shuffle(ALL_FACTS));
  const [i, setI] = useState(0);
  const next = useCallback(() => {
    if (i + 2 >= order.length) {
      setOrder((o) => [...o.slice(i), ...shuffle(ALL_FACTS)]);
      setI(0);
    } else setI(i + 1);
  }, [i, order.length]);
  const prev = useCallback(() => setI((n) => Math.max(0, n - 1)), []);
  return { current: order[i], ahead: order.slice(i + 1, i + 3), i, next, prev };
}

function shuffle<T>(a: T[]): T[] {
  const out = [...a];
  for (let k = out.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [out[k], out[j]] = [out[j], out[k]];
  }
  return out;
}

export default function NumbersShuffle() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/numbers'));
  const { current, ahead, i, next, prev } = useRandomDeck();
  const [revealed, setRevealed] = useState(false);
  const [seen, setSeen] = useState(0);
  const [busy, setBusy] = useState(false);
  const cardW = Math.min((W - space.lg * 2) * 0.9, 380);

  const x = useSharedValue(0);
  const h = useSharedValue(600);
  const lift = (scale: number, gap: number) => -((1 - scale) * h.value) / 2 - gap;

  const settle = useCallback(
    (dir: 1 | -1) => {
      if (dir === 1) {
        next();
        setSeen((s) => s + 1);
      } else prev();
      setRevealed(false);
      setBusy(false);
    },
    [next, prev],
  );
  // Reset the slide only after React has committed the new card (after DOM
  // update, before paint) so the old card never flashes back into place.
  useLayoutEffect(() => {
    x.value = 0;
  }, [current.id, x]);
  const go = useCallback(
    (dir: 1 | -1) => {
      if (busy || (dir === -1 && i === 0)) return;
      setBusy(true);
      x.value = withTiming(-dir * W * 1.05, MOVE, (f) => {
        if (f) runOnJS(settle)(dir);
      });
    },
    [busy, i, W, x, settle],
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-14, 14])
    .onChange((e) => {
      'worklet';
      x.value = e.translationX;
    })
    .onEnd((e) => {
      'worklet';
      if (e.translationX < -70 || e.velocityX < -600) runOnJS(go)(1);
      else if (e.translationX > 70 || e.velocityX > 600) runOnJS(go)(-1);
      else x.value = withTiming(0, MOVE);
    });

  const front = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { rotate: `${(x.value / W) * 3}deg` }] }));
  const ghost1 = useAnimatedStyle(() => {
    const p = Math.min(1, Math.abs(x.value) / (W * 0.8));
    return { transform: [{ scale: interpolate(p, [0, 1], [0.94, 1]) }, { translateY: interpolate(p, [0, 1], [lift(0.94, 14), 0]) }] };
  });
  const ghost2 = useAnimatedStyle(() => {
    const p = Math.min(1, Math.abs(x.value) / (W * 0.8));
    return { transform: [{ scale: interpolate(p, [0, 1], [0.88, 0.94]) }, { translateY: interpolate(p, [0, 1], [lift(0.88, 28), lift(0.94, 14)]) }] };
  });

  const topic = useMemo(() => topicOf(current), [current]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.sm }]}>
      <View style={styles.header}>
        <IconButton icon="close" onPress={goBack} />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Shuffle</Text>
          <Text style={styles.headerCount}>{seen} seen · {ALL_FACTS.length} in the deck</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.deck} onLayout={(e) => { h.value = e.nativeEvent.layout.height - 32; }}>
        {ahead[1] ? (
          <Animated.View style={[styles.layer, { width: cardW }, ghost2]} pointerEvents="none">
            <FactFace fact={ahead[1]} revealed={false} />
          </Animated.View>
        ) : null}
        {ahead[0] ? (
          <Animated.View style={[styles.layer, { width: cardW }, ghost1]} pointerEvents="none">
            <FactFace fact={ahead[0]} revealed={false} />
          </Animated.View>
        ) : null}
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.layer, { width: cardW }, front]}>
            <FlipCard
              key={current.id}
              flipped={revealed}
              front={<FactFace fact={current} revealed={false} topicEmoji={topic?.emoji} topicTitle={topic?.title} onPress={() => setRevealed(true)} />}
              back={<FactFace fact={current} revealed topicEmoji={topic?.emoji} topicTitle={topic?.title} onPress={() => setRevealed(false)} />}
            />
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        <IconButton icon="arrow-back" onPress={() => go(-1)} size={56} style={{ opacity: i === 0 ? 0.35 : 1 }} />
        <PillButton
          label={revealed ? 'Next' : 'Reveal'}
          icon={revealed ? 'arrow-forward' : 'visibility'}
          onPress={() => (revealed ? go(1) : setRevealed(true))}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

function FactFace({
  fact,
  revealed,
  topicEmoji,
  topicTitle,
  onPress,
}: {
  fact: Fact;
  revealed: boolean;
  topicEmoji?: string;
  topicTitle?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.card, revealed && styles.cardBlue]}>
      <View style={styles.top}>
        <Eyebrow style={revealed ? { color: colors.onAccentMuted } : undefined}>{topicTitle ?? 'Anchor'}</Eyebrow>
        <Text style={styles.emoji}>{emojiFor(fact, topicEmoji ?? '🔢')}</Text>
      </View>
      <View style={styles.middle}>
        {contextFor(fact) ? (
          <View style={[styles.regionChip, revealed && styles.regionChipBlue]}>
            <Text style={[styles.regionText, revealed && { color: colors.onAccent }]}>{contextFor(fact)}</Text>
          </View>
        ) : null}
        <Text style={[styles.question, revealed && styles.onBlue]}>{questionFor(fact)}</Text>
        {revealed ? (
          <View style={styles.answer}>
            {fact.parts ? (
              <View style={styles.parts}>
                {fact.parts.map((p) => (
                  <View key={p.label} style={[styles.part, styles.partBlue]}>
                    <Text style={[styles.partKey, { color: colors.onAccentMuted }]}>{p.label}</Text>
                    <Text style={[styles.partVal, { color: colors.onAccent }]}>{p.value}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.value, styles.onBlue]}>{fact.value}</Text>
            )}
            <Text style={[styles.answerLabel, { color: colors.onAccentMuted }]}>{fact.label}</Text>
            {fact.note ? <Text style={[styles.note, { color: colors.onAccent }]}>→ {fact.note}</Text> : null}
          </View>
        ) : (
          <View style={styles.hidden}>
            <MaterialIcons name="visibility-off" size={18} color={colors.textFaint} />
            <Text style={styles.hiddenText}>Say your number, then tap to reveal</Text>
          </View>
        )}
      </View>
      <Text style={[styles.hint, revealed && { color: colors.onAccentMuted }]}>Swipe for another</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  headerCount: { color: colors.textFaint, fontSize: 11, fontWeight: '600' },
  deck: { flex: 1, alignItems: 'center', marginTop: space.xl, marginBottom: space.sm },
  layer: { position: 'absolute', top: 32, bottom: 0 },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.card, padding: 26, gap: space.md, ...shadow.cardStrong },
  layerInner: { flex: 1 },
  cardBlue: { backgroundColor: colors.accent, ...shadow.accent },
  onBlue: { color: colors.onAccent },
  regionChipBlue: { backgroundColor: 'rgba(255,255,255,0.18)' },
  partBlue: { backgroundColor: 'rgba(255,255,255,0.18)' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emoji: { fontSize: 28 },
  middle: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.lg },
  regionChip: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  regionText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  question: { color: colors.text, fontSize: 26, lineHeight: 33, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
  answer: { alignItems: 'center', gap: space.sm, width: '100%' },
  answerLabel: { color: colors.textMuted, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  value: { color: colors.accent, fontSize: 44, lineHeight: 50, fontWeight: '800', letterSpacing: -1.2, textAlign: 'center' },
  hidden: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: space.lg, alignSelf: 'stretch' },
  hiddenText: { color: colors.textMuted, fontSize: 14, fontWeight: '600', flex: 1 },
  parts: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' },
  part: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  partKey: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  partVal: { color: colors.accent, fontSize: 16, fontWeight: '800' },
  note: { color: colors.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  hint: { color: colors.textFaint, fontSize: 13 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingTop: space.sm },
});
