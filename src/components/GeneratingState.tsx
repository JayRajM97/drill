import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { SETS, contextFor, emojiFor, questionFor, type Fact } from '@/data/numbers';
import type { Question } from '@/types/question';
import { FlipCard } from '@/components/FlipCard';
import { colors, radius, shadow, space } from '@/theme/tokens';

/**
 * Writing a drill takes the better part of a minute. The card is visibly
 * being written for the whole of it — skeleton lines drafting in, each step
 * ticking off as it completes — and underneath sits a flashcard from the
 * decks the user already practises, so the wait is also practice. When the
 * drill lands, the same card fills in with the real thing.
 */

const STEPS = [
  { at: 0, label: 'Reading your topic' },
  { at: 10, label: 'Choosing the framework' },
  { at: 22, label: 'Writing the answer' },
  { at: 36, label: 'Checking the metrics' },
];

const CARD_MS = 9000;

function shuffled(pool: Fact[], n: number): Fact[] {
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

/** Skeleton line that pulses while it waits to be filled in. */
function GhostLine({ width, delay }: { width: `${number}%`; delay: number }) {
  const pulse = useSharedValue(0.35);
  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.85, { duration: 620, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.35, { duration: 620, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, pulse]);
  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return <Animated.View style={[styles.ghost, { width }, style]} />;
}

/** A blinking caret, so the card reads as actively being typed into. */
function Caret() {
  const blink = useSharedValue(1);
  useEffect(() => {
    blink.value = withRepeat(
      withSequence(withTiming(0, { duration: 460 }), withTiming(1, { duration: 460 })),
      -1,
      false,
    );
  }, [blink]);
  const style = useAnimatedStyle(() => ({ opacity: blink.value }));
  return <Animated.View style={[styles.caret, style]} />;
}

/** The drill card mid-composition: a drafting title, then steps ticking off. */
function WritingCard({ step }: { step: number }) {
  return (
    <View style={[styles.sheet, shadow.card]}>
      <GhostLine width="92%" delay={0} />
      <GhostLine width="74%" delay={140} />
      <GhostLine width="52%" delay={280} />

      <View style={styles.stepList}>
        {STEPS.map((s, i) => {
          const doneStep = i < step;
          const current = i === step;
          return (
            <View key={s.label} style={styles.stepRow}>
              {doneStep ? (
                <MaterialIcons name="check-circle" size={15} color={colors.accent} />
              ) : (
                <View style={[styles.stepDot, current && styles.stepDotNow]} />
              )}
              <Text
                style={[
                  styles.stepText,
                  doneStep && styles.stepTextDone,
                  current && styles.stepTextNow,
                ]}
                numberOfLines={1}
              >
                {s.label}
              </Text>
              {current ? <Caret /> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function GeneratingState({
  question,
  onRevealed,
}: {
  /** Non-null once generation finishes; that flips this into the write-out. */
  question: Question | null;
  /** Called when the write-out animation has finished playing. */
  onRevealed: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Mix both decks so the wait covers anchors and product metrics alike.
  const deck = useMemo(() => shuffled([...SETS.numbers.facts, ...SETS.metrics.facts], 12), []);
  const fact = deck[index % deck.length];

  useEffect(() => {
    if (question) return;
    const tick = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, [question]);

  useEffect(() => {
    if (question) return;
    const rotate = setInterval(() => {
      setFlipped(false);
      setIndex((i) => i + 1);
    }, CARD_MS);
    return () => clearInterval(rotate);
  }, [question]);

  const step = STEPS.reduce((acc, s, i) => (elapsed >= s.at ? i : acc), 0);

  if (question) return <WriteOut question={question} onDone={onRevealed} />;

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        <Animated.View key={step} entering={FadeIn.duration(260)}>
          <Text style={styles.step}>Writing your drill…</Text>
        </Animated.View>
        <Text style={styles.dots}>{STEPS.map((_, i) => (i <= step ? '•' : '·')).join(' ')}</Text>
      </View>

      <WritingCard step={step} />

      <Text style={styles.meanwhile}>While you wait, a number worth knowing</Text>

      <Pressable onPress={() => setFlipped((f) => !f)} style={styles.flipWrap}>
        <FlipCard
          flipped={flipped}
          style={styles.flipFill}
          front={
            <View style={styles.face}>
              <Text style={styles.emoji}>{emojiFor(fact, '🔢')}</Text>
              <Text style={styles.q}>{questionFor(fact)}</Text>
              <Text style={styles.tap}>Tap to reveal</Text>
            </View>
          }
          back={
            <View style={[styles.face, styles.faceBack]}>
              <Text style={styles.value} numberOfLines={2} adjustsFontSizeToFit>
                {fact.value}
              </Text>
              <Text style={styles.label} numberOfLines={2}>
                {fact.label}
              </Text>
              <Text style={styles.note} numberOfLines={3}>
                {fact.note ?? contextFor(fact)}
              </Text>
            </View>
          }
        />
      </Pressable>
    </View>
  );
}

/** The finished drill assembling itself: title first, then each section. */
function WriteOut({ question, onDone }: { question: Question; onDone: () => void }) {
  const done = useRef(false);
  const rows = question.answer.slice(0, 5).map((s) => s.heading);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!done.current) {
        done.current = true;
        onDone();
      }
    }, 380 + rows.length * 200 + 700);
    return () => clearTimeout(t);
  }, [onDone, rows.length]);

  return (
    <View style={styles.wrap}>
      <View style={styles.headRow}>
        <Text style={[styles.step, { color: colors.success }]}>Your drill is ready</Text>
        <MaterialIcons name="check-circle" size={18} color={colors.success} />
      </View>

      <View style={[styles.sheet, shadow.card]}>
        <Animated.Text entering={FadeIn.duration(420)} style={styles.sheetTitle} numberOfLines={4}>
          {question.title}
        </Animated.Text>
        <View style={styles.sheetMeta}>
          <Text style={styles.sheetMetaText}>
            {question.categories[0]} · {question.difficulty} · {question.clarifying_questions.length} clarifiers
          </Text>
        </View>
        {rows.map((heading, i) => (
          <WriteRow key={heading + i} label={heading} delay={380 + i * 200} />
        ))}
      </View>
    </View>
  );
}

/** One section line drawing itself in. */
function WriteRow({ label, delay }: { label: string; delay: number }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }));
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 6 }],
  }));

  return (
    <Animated.View style={[styles.row, style]}>
      <View style={styles.rowDot} />
      <Text style={styles.rowText} numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: { color: colors.text, fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  dots: { color: colors.accent, fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  meanwhile: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  // FlipCard's faces are absolutely positioned, so the wrapper needs a real
  // height — its own `flex: 1` cannot supply one inside a scroll view.
  flipWrap: { height: 210 },
  flipFill: { height: '100%' },
  face: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    ...shadow.card,
  },
  faceBack: { backgroundColor: colors.accent },
  emoji: { fontSize: 28 },
  q: { color: colors.text, fontSize: 17, lineHeight: 23, fontWeight: '800', textAlign: 'center' },
  tap: { color: colors.textFaint, fontSize: 13, fontWeight: '700', marginTop: space.xs },
  value: { color: colors.onAccent, fontSize: 34, fontWeight: '800', letterSpacing: -1, textAlign: 'center' },
  label: { color: colors.onAccent, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  note: { color: colors.onAccentMuted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  footer: { color: colors.textMuted, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  ghost: { height: 13, borderRadius: 7, backgroundColor: colors.surfaceAlt },
  stepList: { marginTop: space.sm, gap: 7 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  stepDot: { width: 15, height: 15, borderRadius: 8, borderWidth: 2, borderColor: colors.border },
  stepDotNow: { borderColor: colors.accent },
  stepText: { color: colors.textFaint, fontSize: 13.5 },
  stepTextDone: { color: colors.textMuted },
  stepTextNow: { color: colors.text, fontWeight: '700' },
  caret: { width: 2, height: 15, backgroundColor: colors.accent, borderRadius: 1 },
  sheet: { backgroundColor: colors.surface, borderRadius: radius.card, padding: space.xl, gap: space.sm },
  sheetTitle: { color: colors.text, fontSize: 20, lineHeight: 27, fontWeight: '800', letterSpacing: -0.4 },
  sheetMeta: { marginBottom: space.xs },
  sheetMetaText: { color: colors.textFaint, fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 5 },
  rowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  rowText: { flex: 1, color: colors.textMuted, fontSize: 14 },
});
