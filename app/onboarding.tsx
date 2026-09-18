import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/auth/AuthProvider';
import { curatedQuestions } from '@/data/curated';
import { ALL_FACTS, emojiFor, type Fact } from '@/data/numbers';
import { FRAMEWORKS } from '@/data/frameworks';
import type { Question } from '@/types/question';
import { QuestionCard } from '@/components/QuestionCard';
import { FrameworkCard } from '@/components/FrameworkCard';
import { colors, radius, shadow, space } from '@/theme/tokens';

export const ONBOARDED_KEY = 'drill:onboarded:v1';

type Slide =
  | { key: string; kind: 'question'; question: Question }
  | { key: string; kind: 'number'; fact: Fact }
  | { key: string; kind: 'framework'; index: number };

const AUTO_MS = 3200;

/** First run: what Drill is, a taste of the real cards, and a way in. */
export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, googleReady, configured } = useAuth();
  const { width: W } = useWindowDimensions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const railW = Math.min(W, 520);
  const cardW = Math.round(railW * 0.70);
  const pitch = cardW + space.md;
  const sidePad = Math.round((railW - cardW) / 2);
  const railRef = useRef<ScrollView>(null);
  const offset = useRef(0);
  const paused = useRef(false);

  const base = useMemo<Slide[]>(() => {
    const facts = ALL_FACTS.filter((f) => !f.parts && f.value.length <= 10);
    return [
      { key: 'q0', kind: 'question', question: curatedQuestions[0] },
      { key: 'n0', kind: 'number', fact: facts[3] ?? ALL_FACTS[0] },
      { key: 'f0', kind: 'framework', index: 0 },
      { key: 'q1', kind: 'question', question: curatedQuestions[1] },
      { key: 'n1', kind: 'number', fact: facts[9] ?? ALL_FACTS[1] },
    ];
  }, []);

  // Three copies, parked in the middle: there is always a card to the left and
  // the right, and scrolling past either end silently recentres, so the rail
  // never runs out in either direction.
  const loop = useMemo(
    () => [...base, ...base, ...base].map((s, i) => ({ ...s, key: `${s.key}-${i}` })),
    [base],
  );
  const startIndex = base.length;

  useEffect(() => {
    const t = setTimeout(() => {
      railRef.current?.scrollTo({ x: startIndex * pitch, animated: false });
      offset.current = startIndex * pitch;
    }, 50);
    return () => clearTimeout(t);
  }, [startIndex, pitch]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (paused.current) return;
      offset.current += pitch;
      railRef.current?.scrollTo({ x: offset.current, animated: true });
    }, AUTO_MS);
    return () => clearInterval(tick);
  }, [pitch]);

  const recentre = (x: number) => {
    offset.current = x;
    const span = base.length * pitch;
    if (x < span * 0.5 || x > span * 2.5) {
      const wrapped = ((x - span) % span + span) % span + span;
      offset.current = wrapped;
      railRef.current?.scrollTo({ x: wrapped, animated: false });
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'yes').catch(() => {});
    router.replace('/');
  };

  const onGoogle = async () => {
    if (!googleReady) {
      setError(
        configured
          ? 'Google sign-in needs its client ids in .env.local before it can run.'
          : 'Cloud sync is not configured in this build yet.',
      );
      return;
    }
    setBusy(true);
    setError(null);
    const message = await signInWithGoogle();
    setBusy(false);
    if (message) setError(message);
    else await finish();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.md }]}>
      <View style={styles.top}>
        <View style={styles.head}>
          <Image source={require('../assets/icon.png')} style={styles.logo} />
          <Text style={styles.wordmark}>drill</Text>
        </View>
        <Text style={styles.tagline}>Practice PM interviews one card at a time.</Text>
      </View>

      <View style={styles.middle}>
      <ScrollView
        horizontal
        ref={railRef}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={pitch}
        scrollEventThrottle={32}
        onScroll={(e) => recentre(e.nativeEvent.contentOffset.x)}
        onTouchStart={() => {
          paused.current = true;
        }}
        onTouchEnd={() => {
          paused.current = false;
        }}
        contentContainerStyle={{ paddingHorizontal: sidePad, gap: space.md }}
        style={styles.rail}
      >
        {loop.map((s) => (
          <View key={s.key} style={{ width: cardW }}>
            {s.kind === 'question' ? (
              <QuestionCard question={s.question} onPress={() => {}} />
            ) : s.kind === 'framework' ? (
              <FrameworkCard framework={FRAMEWORKS[s.index]} onPress={() => {}} />
            ) : (
              <NumberCard fact={s.fact} />
            )}
          </View>
        ))}
      </ScrollView>
      </View>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={onGoogle}
          disabled={busy}
          style={({ pressed }) => [styles.google, busy && { opacity: 0.6 }, pressed && { opacity: 0.9 }]}
        >
          {busy ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <Text style={styles.gMark}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        <Pressable onPress={finish} hitSlop={8} style={styles.skip}>
          <Text style={styles.skipText}>Start practising</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Same language as the numbers tiles on Home, sized for the rail. */
function NumberCard({ fact }: { fact: Fact }) {
  return (
    <View style={[styles.numCard, shadow.accent]}>
      <Text style={styles.numEmoji}>{emojiFor(fact, '🔢')}</Text>
      <Text style={styles.numValue} numberOfLines={1} adjustsFontSizeToFit>
        {fact.value}
      </Text>
      <Text style={styles.numLabel} numberOfLines={2}>
        {fact.label}
      </Text>
      <Text style={styles.numTag}>Numbers</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { gap: space.lg, paddingTop: space.sm },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logo: { width: 26, height: 26, borderRadius: 7 },
  wordmark: { color: colors.text, fontSize: 19, fontWeight: '800', letterSpacing: -0.4 },
  tagline: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.4,
    paddingHorizontal: space.xl,
  },
  rail: { flexGrow: 0 },
  middle: { flex: 1, justifyContent: 'center' },
  numCard: {
    backgroundColor: colors.accent,
    borderRadius: radius.card,
    padding: space.lg,
    gap: 4,
    minHeight: 150,
    justifyContent: 'center',
  },
  numEmoji: { fontSize: 20 },
  numValue: { color: colors.onAccent, fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  numLabel: { color: colors.onAccent, fontSize: 14, lineHeight: 19, fontWeight: '700' },
  numTag: {
    color: colors.onAccentMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  footer: { paddingHorizontal: space.lg, gap: space.xs },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  gMark: { color: '#4285F4', fontSize: 18, fontWeight: '800' },
  googleText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  error: { color: colors.warning, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  skip: { alignItems: 'center', paddingVertical: 12 },
  skipText: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
});
