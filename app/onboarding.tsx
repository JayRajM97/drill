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

/** One colour per card, so eight cards read as eight things. */
const THEMES = [
  { bg: colors.accent, fg: colors.onAccent, dim: colors.onAccentMuted },
  { bg: colors.surface, fg: colors.text, dim: colors.textMuted },
  { bg: '#FFF1E6', fg: '#C2410C', dim: '#9A3412' },
  { bg: '#E6F6EC', fg: '#15803D', dim: '#166534' },
  { bg: '#F1E8FF', fg: '#7E22CE', dim: '#6B21A8' },
  { bg: colors.surface, fg: colors.text, dim: colors.textMuted },
  { bg: '#FDE7F1', fg: '#BE185D', dim: '#9D174D' },
  { bg: '#E0F3FB', fg: '#0369A1', dim: '#075985' },
];

type Slide =
  | { key: string; kind: 'question'; title: string; category: Category; difficulty: string; framework: string }
  | { key: string; kind: 'metrics'; facts: Fact[] }
  | { key: string; kind: 'framework'; emoji: string; name: string; line: string }
  | { key: string; kind: 'stat'; value: string; label: string };

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
    const q1 = byLen[0];
    const q2 = byLen[1];
    const facts = ALL_FACTS.filter((f) => !f.parts && f.value.length <= 9);
    const quad = (n: number) => facts.slice(n, n + 4);
    const asQuestion = (q: (typeof curatedQuestions)[number], key: string): Slide => ({
      key,
      kind: 'question',
      title: q.title,
      category: q.categories[0],
      difficulty: q.difficulty,
      framework: q.framework?.name ?? '',
    });
    return [
      asQuestion(q1, 'q1'),
      { key: 'f1', kind: 'framework', emoji: FRAMEWORKS[0].emoji, name: FRAMEWORKS[0].name, line: FRAMEWORKS[0].oneLiner },
      { key: 'm1', kind: 'metrics', facts: quad(0) },
      { key: 's1', kind: 'stat', value: String(QUESTION_COUNT), label: 'case studies' },
      asQuestion(q2, 'q2'),
      { key: 'f2', kind: 'framework', emoji: FRAMEWORKS[1].emoji, name: FRAMEWORKS[1].name, line: FRAMEWORKS[1].oneLiner },
      { key: 'm2', kind: 'metrics', facts: quad(8) },
      { key: 's2', kind: 'stat', value: String(FRAMEWORK_COUNT), label: 'frameworks' },
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
          {loop.map((s, i) => (
            <RailCard key={s.key} slide={s} width={cardW} theme={THEMES[i % THEMES.length]} />
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
function RailCard({
  slide,
  width,
  theme,
}: {
  slide: Slide;
  width: number;
  theme: { bg: string; fg: string; dim: string };
}) {
  return (
    <View
      style={[
        styles.card,
        { width, backgroundColor: theme.bg },
        theme.bg === colors.accent ? shadow.accent : shadow.card,
      ]}
    >
      {slide.kind === 'question' ? (
        <>
          <View style={[styles.chip, { backgroundColor: tint(theme) }]}>
            <Text style={[styles.chipText, { color: theme.fg }]}>{slide.category}</Text>
          </View>
          <Text style={[styles.qText, { color: theme.fg }]} numberOfLines={5}>
            {slide.title}
          </Text>
          <View style={styles.qMeta}>
            <Text style={[styles.qMetaText, { color: theme.dim }]}>{slide.difficulty}</Text>
            {slide.framework ? (
              <Text style={[styles.qMetaText, { color: theme.dim }]} numberOfLines={1}>
                · {slide.framework}
              </Text>
            ) : null}
          </View>
        </>
      ) : slide.kind === 'framework' ? (
        <>
          <Text style={styles.emoji}>{slide.emoji}</Text>
          <Text style={[styles.fwName, { color: theme.fg }]} numberOfLines={3}>
            {slide.name}
          </Text>
          <Text style={[styles.fwLine, { color: theme.dim }]} numberOfLines={3}>
            {slide.line}
          </Text>
        </>
      ) : slide.kind === 'metrics' ? (
        <>
          <Text style={[styles.quadTitle, { color: theme.dim }]}>Numbers worth knowing</Text>
          <View style={styles.quad}>
            {slide.facts.map((f) => (
              <View key={f.id} style={styles.quadCell}>
                <Text style={[styles.quadValue, { color: theme.fg }]} numberOfLines={1} adjustsFontSizeToFit>
                  {f.value}
                </Text>
                <Text style={[styles.quadLabel, { color: theme.dim }]} numberOfLines={2}>
                  {f.label}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={[styles.statValue, { color: theme.fg }]}>{slide.value}</Text>
          <Text style={[styles.statLabel, { color: theme.fg }]} numberOfLines={2}>
            {slide.label}
          </Text>
        </>
      )}
    </View>
  );
}

/** A soft chip fill that works on any of the eight card colours. */
function tint(theme: { bg: string; fg: string }) {
  return theme.bg === colors.surface ? colors.accentSoft : 'rgba(255,255,255,0.45)';
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

  chip: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 12, fontWeight: '800' },
  qText: {
    fontSize: 22,
    lineHeight: 29,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emoji: { fontSize: 30 },
  qMeta: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  qMetaText: { fontSize: 13, fontWeight: '700' },
  quadTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  quad: { flexDirection: 'row', flexWrap: 'wrap', rowGap: space.lg, columnGap: space.md },
  quadCell: { width: '44%', alignItems: 'center', gap: 2 },
  quadValue: { fontSize: 26, fontWeight: '800', letterSpacing: -0.8, textAlign: 'center' },
  quadLabel: { fontSize: 12, lineHeight: 16, fontWeight: '600', textAlign: 'center' },
  numValue: { color: colors.onAccent, fontSize: 48, fontWeight: '800', letterSpacing: -1.6, textAlign: 'center' },
  numLabel: { color: colors.onAccent, fontSize: 15, lineHeight: 21, fontWeight: '700', textAlign: 'center' },
  fwName: { fontSize: 26, lineHeight: 33, fontWeight: '800', textAlign: 'center', letterSpacing: -0.6 },
  fwLine: { fontSize: 15, lineHeight: 21, textAlign: 'center' },
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
