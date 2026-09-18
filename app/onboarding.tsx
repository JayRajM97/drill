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
import { notionQuestions } from '@/data/notionQuestions';
import { ALL_FACTS, SETS, emojiFor, type Fact } from '@/data/numbers';
import { FRAMEWORKS } from '@/data/frameworks';
import type { Category } from '@/types/question';
import { categoryPastel, colors, radius, shadow, space } from '@/theme/tokens';

export const ONBOARDED_KEY = 'drill:onboarded:v1';

const AUTO_MS = 3200;
const CARD_H = 250;

// Counted from the bundled data, so the screen cannot overstate what is in it.
const QUESTION_COUNT = curatedQuestions.length + notionQuestions.length;
const FRAMEWORK_COUNT = FRAMEWORKS.length;
const NUMBER_COUNT = SETS.numbers.facts.length + SETS.metrics.facts.length;

type Slide =
  | { key: string; kind: 'question'; title: string; category: Category }
  | { key: string; kind: 'number'; fact: Fact }
  | { key: string; kind: 'framework'; emoji: string; name: string; line: string }
  | { key: string; kind: 'stat'; value: string; label: string }
  | { key: string; kind: 'types'; items: string[] };

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, googleReady } = useAuth();
  const { width: W } = useWindowDimensions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const railW = Math.min(W, 520);
  const cardW = Math.round(railW * 0.74);
  const pitch = cardW + space.md;
  const sidePad = Math.round((railW - cardW) / 2);
  const railRef = useRef<ScrollView>(null);
  const offset = useRef(0);
  const paused = useRef(false);

  const base = useMemo<Slide[]>(() => {
    const short = [...curatedQuestions].sort((a, b) => a.title.length - b.title.length);
    const facts = ALL_FACTS.filter((f) => !f.parts && f.value.length <= 10);
    const fw = FRAMEWORKS[0];
    return [
      { key: 'q', kind: 'question', title: short[0].title, category: short[0].categories[0] },
      { key: 's1', kind: 'stat', value: String(QUESTION_COUNT), label: 'case studies' },
      { key: 'n1', kind: 'number', fact: facts[3] ?? ALL_FACTS[0] },
      { key: 't', kind: 'types', items: ['Strategy', 'Design', 'Guesstimate', 'Analytical', 'RCA', 'AI'] },
      { key: 'f', kind: 'framework', emoji: fw.emoji, name: fw.name, line: fw.oneLiner },
      { key: 's2', kind: 'stat', value: String(FRAMEWORK_COUNT), label: 'frameworks' },
      { key: 'n2', kind: 'number', fact: facts[9] ?? ALL_FACTS[1] },
      { key: 's3', kind: 'stat', value: String(NUMBER_COUNT), label: 'numbers to know' },
    ];
  }, []);

  // Three copies parked in the middle: there is always a card either side, and
  // scrolling past an end silently recentres, so the rail never runs out.
  const loop = useMemo(
    () => [...base, ...base, ...base].map((s, i) => ({ ...s, key: `${s.key}-${i}` })),
    [base],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      const x = base.length * pitch;
      railRef.current?.scrollTo({ x, animated: false });
      offset.current = x;
    }, 50);
    return () => clearTimeout(t);
  }, [base.length, pitch]);

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
      const wrapped = (((x - span) % span) + span) % span + span;
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
      setError('Google sign-in is not configured in this build.');
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
    <View style={[styles.screen, { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.md }]}>
      <View style={styles.top}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />
        <Text style={styles.wordmark}>drill</Text>
        <Text style={styles.tagline}>Walk in ready.</Text>
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
            <RailCard key={s.key} slide={s} width={cardW} />
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

/** One shell for every slide: same size, same padding, content centred. */
function RailCard({ slide, width }: { slide: Slide; width: number }) {
  const blue = slide.kind === 'number';
  return (
    <View style={[styles.card, { width }, blue ? styles.cardBlue : styles.cardPlain, blue ? shadow.accent : shadow.card]}>
      {slide.kind === 'question' ? (
        <>
          <View style={[styles.chip, { backgroundColor: categoryPastel[slide.category]?.bg ?? colors.accentSoft }]}>
            <Text style={[styles.chipText, { color: categoryPastel[slide.category]?.fg ?? colors.accent }]}>
              {slide.category}
            </Text>
          </View>
          <Text style={styles.qText} numberOfLines={4}>
            {slide.title}
          </Text>
        </>
      ) : slide.kind === 'number' ? (
        <>
          <Text style={styles.emoji}>{emojiFor(slide.fact, '🔢')}</Text>
          <Text style={styles.numValue} numberOfLines={1} adjustsFontSizeToFit>
            {slide.fact.value}
          </Text>
          <Text style={styles.numLabel} numberOfLines={2}>
            {slide.fact.label}
          </Text>
        </>
      ) : slide.kind === 'framework' ? (
        <>
          <Text style={styles.emoji}>{slide.emoji}</Text>
          <Text style={styles.fwName} numberOfLines={2}>
            {slide.name}
          </Text>
          <Text style={styles.fwLine} numberOfLines={3}>
            {slide.line}
          </Text>
        </>
      ) : slide.kind === 'stat' ? (
        <>
          <Text style={styles.statValue}>{slide.value}</Text>
          <Text style={styles.statLabel} numberOfLines={2}>
            {slide.label}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.typesTitle}>Every question type</Text>
          <View style={styles.typesWrap}>
            {slide.items.map((t) => (
              <View key={t} style={styles.typeChip}>
                <Text style={styles.typeChipText}>{t}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { alignItems: 'center' },
  logo: { width: 77, height: 77, borderRadius: 19 },
  wordmark: { color: colors.text, fontSize: 25, fontWeight: '800', letterSpacing: -0.5, marginTop: 6 },
  tagline: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: space.xs,
  },
  middle: { flex: 1, justifyContent: 'center' },
  rail: { flexGrow: 0 },
  card: {
    height: CARD_H,
    borderRadius: radius.card,
    padding: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  cardPlain: { backgroundColor: colors.surface },
  cardBlue: { backgroundColor: colors.accent },
  chip: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 12, fontWeight: '800' },
  qText: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emoji: { fontSize: 26 },
  numValue: { color: colors.onAccent, fontSize: 48, fontWeight: '800', letterSpacing: -1.6, textAlign: 'center' },
  numLabel: { color: colors.onAccent, fontSize: 15, lineHeight: 21, fontWeight: '700', textAlign: 'center' },
  fwName: { color: colors.text, fontSize: 19, lineHeight: 25, fontWeight: '800', textAlign: 'center', letterSpacing: -0.3 },
  fwLine: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  statValue: { color: colors.accent, fontSize: 60, fontWeight: '800', letterSpacing: -2.2 },
  statLabel: { color: colors.text, fontSize: 17, fontWeight: '700', textAlign: 'center' },
  typesTitle: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  typesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  typeChip: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 7 },
  typeChipText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
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
