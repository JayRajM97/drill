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
const CARD_H = 350;

// Counted from the bundled data, so the screen cannot overstate what is in it.
const QUESTION_COUNT = curatedQuestions.length + notionQuestions.length;
const FRAMEWORK_COUNT = FRAMEWORKS.length;
const NUMBER_COUNT = SETS.numbers.facts.length + SETS.metrics.facts.length;

/**
 * Two colours, as everywhere else in the app: app-blue and white. Purple is
 * the single exception and means one thing only — a drill the user generated.
 */
const BLUE = { bg: colors.accent, fg: colors.onAccent, dim: colors.onAccentMuted, chip: 'rgba(255,255,255,0.18)' };
const WHITE = { bg: colors.surface, fg: colors.text, dim: colors.textMuted, chip: colors.accentSoft };
const PURPLE = { bg: '#F1E8FF', fg: '#6B21A8', dim: '#7E22CE', chip: 'rgba(126,34,206,0.12)' };

type Theme = { bg: string; fg: string; dim: string; chip: string };

type Slide = { key: string; theme: Theme } & (
  | { kind: 'question'; title: string; category: Category; difficulty: string }
  | { kind: 'framework'; name: string; line: string; steps: number }
  | { kind: 'numbers'; facts: Fact[] }
  | { kind: 'make' }
);

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, googleReady } = useAuth();
  const { width: W } = useWindowDimensions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const railW = Math.min(W, 520);
  const cardW = Math.round(railW * 0.80);
  const pitch = cardW + space.md;
  const sidePad = Math.round((railW - cardW) / 2);
  const railRef = useRef<ScrollView>(null);
  const offset = useRef(0);
  const paused = useRef(false);

  const base = useMemo<Slide[]>(() => {
    const byLen = [...curatedQuestions].sort((a, b) => a.title.length - b.title.length);
    const facts = ALL_FACTS.filter((f) => !f.parts && f.value.length <= 9);
    const q = (i: number, theme: Theme, key: string): Slide => ({
      key,
      theme,
      kind: 'question',
      title: byLen[i].title,
      category: byLen[i].categories[0],
      difficulty: byLen[i].difficulty,
    });
    const fw = (i: number, theme: Theme, key: string): Slide => ({
      key,
      theme,
      kind: 'framework',
      name: FRAMEWORKS[i].name,
      line: FRAMEWORKS[i].oneLiner,
      steps: FRAMEWORKS[i].steps.length,
    });
    // question → framework → numbers → make your own, twice.
    return [
      q(0, BLUE, 'q1'),
      fw(0, WHITE, 'f1'),
      { key: 'n1', theme: BLUE, kind: 'numbers', facts: facts.slice(0, 4) },
      { key: 'm1', theme: PURPLE, kind: 'make' },
      q(1, WHITE, 'q2'),
      fw(1, BLUE, 'f2'),
      { key: 'n2', theme: WHITE, kind: 'numbers', facts: facts.slice(8, 12) },
      { key: 'm2', theme: PURPLE, kind: 'make' },
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
        {/* Backups, if this one ever tires:
            · Drill whenever you have a minute.
            · Mental drills before the interview.
            · 3 minutes. One case. Sharper.
            · A drill a day keeps the rejection away. */}
        <Text style={styles.tagline}>{'Never run out of\ncase drills again.'}</Text>
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

/**
 * One shell for every slide, laid out like the home-screen widget: left
 * aligned, a chip at the top, the substance in the middle, meta at the foot.
 */
function RailCard({ slide, width }: { slide: Slide; width: number }) {
  const t = slide.theme;
  return (
    <View
      style={[styles.card, { width, backgroundColor: t.bg }, t.bg === colors.accent ? shadow.accent : shadow.card]}
    >
      {slide.kind === 'question' ? (
        <>
          <View style={styles.cardTop}>
            <View style={[styles.chip, { backgroundColor: t.chip }]}>
              <Text style={[styles.chipText, { color: t.fg }]}>{slide.category}</Text>
            </View>
            <Text style={[styles.eyebrow, { color: t.dim }]}>DRILL</Text>
          </View>
          <Text style={[styles.qText, { color: t.fg }]} numberOfLines={5}>
            {slide.title}
          </Text>
          <View style={styles.cardFoot}>
            <View style={styles.dotRow}>
              <View style={[styles.dot, { backgroundColor: t.fg }]} />
              <Text style={[styles.footText, { color: t.dim }]}>{slide.difficulty}</Text>
            </View>
            <Text style={[styles.footText, { color: t.dim }]}>Drill it →</Text>
          </View>
        </>
      ) : slide.kind === 'framework' ? (
        <>
          <View style={styles.cardTop}>
            <View style={[styles.chip, { backgroundColor: t.chip }]}>
              <Text style={[styles.chipText, { color: t.fg }]}>FRAMEWORK</Text>
            </View>
          </View>
          <Text style={[styles.fwName, { color: t.fg }]} numberOfLines={3}>
            {slide.name}
          </Text>
          <Text style={[styles.fwLine, { color: t.dim }]} numberOfLines={3}>
            {slide.line}
          </Text>
          <View style={styles.cardFoot}>
            <Text style={[styles.footText, { color: t.dim }]}>{slide.steps} steps</Text>
          </View>
        </>
      ) : slide.kind === 'numbers' ? (
        <>
          <Text style={[styles.numHeading, { color: t.fg }]}>Numbers worth knowing</Text>
          <View style={styles.quad}>
            {slide.facts.map((f) => (
              <View key={f.id} style={styles.quadCell}>
                <Text style={[styles.quadValue, { color: t.fg }]} numberOfLines={1} adjustsFontSizeToFit>
                  {f.value}
                </Text>
                <Text style={[styles.quadLabel, { color: t.dim }]} numberOfLines={2}>
                  {f.label}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[styles.numMore, { color: t.dim }]}>+{NUMBER_COUNT - 4} more worth knowing</Text>
        </>
      ) : (
        <>
          <View style={styles.cardTop}>
            <View style={[styles.chip, { backgroundColor: t.chip }]}>
              <Text style={[styles.chipText, { color: t.fg }]}>AI DRILL</Text>
            </View>
          </View>
          <Text style={[styles.fwName, { color: t.fg }]}>Make your own</Text>
          <View style={[styles.ghostField, { borderColor: t.chip }]}>
            <Text style={[styles.ghostText, { color: t.dim }]} numberOfLines={2}>
              Revamp the home feed for an exam prep app…
            </Text>
          </View>
          <View style={[styles.ghostButton, { backgroundColor: t.dim }]}>
            <Text style={styles.ghostButtonText}>Make the drill</Text>
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
    color: colors.text,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.7,
    textAlign: 'center',
    marginTop: space.md,
  },
  middle: { flex: 1, justifyContent: 'center' },
  rail: { flexGrow: 0 },
  card: {
    height: CARD_H,
    borderRadius: radius.card,
    padding: space.lg,
    justifyContent: 'center',
    gap: space.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xs },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  footText: { fontSize: 13, fontWeight: '700' },
  numHeading: { fontSize: 22, lineHeight: 28, fontWeight: '800', letterSpacing: -0.4 },
  numMore: { fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: space.xs },
  ghostField: {
    borderWidth: 1.5,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    padding: space.md,
    minHeight: 64,
    justifyContent: 'center',
  },
  ghostText: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  ghostButton: { borderRadius: radius.lg, paddingVertical: 12, alignItems: 'center' },
  ghostButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  chip: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 12, fontWeight: '800' },
  qText: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  emoji: { fontSize: 30 },
  qMeta: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  qMetaText: { fontSize: 13, fontWeight: '700' },
  quadTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  quad: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.md, columnGap: space.md, marginTop: space.xs },
  quadCell: { width: '46%', gap: 1 },
  quadValue: { fontSize: 30, fontWeight: '800', letterSpacing: -1 },
  quadLabel: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  numValue: { color: colors.onAccent, fontSize: 48, fontWeight: '800', letterSpacing: -1.6, textAlign: 'center' },
  numLabel: { color: colors.onAccent, fontSize: 15, lineHeight: 21, fontWeight: '700', textAlign: 'center' },
  fwName: { fontSize: 26, lineHeight: 33, fontWeight: '800', letterSpacing: -0.6 },
  fwLine: { fontSize: 15, lineHeight: 21 },
  statValue: { fontSize: 76, fontWeight: '800', letterSpacing: -3 },
  statLabel: { fontSize: 19, fontWeight: '700', textAlign: 'center' },
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
