import React, { useMemo, useRef, useState } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/auth/AuthProvider';
import { curatedQuestions } from '@/data/curated';
import { ALL_FACTS, emojiFor } from '@/data/numbers';
import { FRAMEWORKS } from '@/data/frameworks';
import { colors, radius, shadow, space } from '@/theme/tokens';

export const ONBOARDED_KEY = 'drill:onboarded:v1';

type Slide =
  | { kind: 'case'; title: string; meta: string }
  | { kind: 'number'; value: string; label: string; emoji: string }
  | { kind: 'framework'; name: string; line: string; emoji: string };

/**
 * First run: what Drill is, a taste of the content, and a way in.
 * Everything shown here is real — drills, numbers and frameworks already in
 * the app — so the first screen is not a promise, it is the product.
 */
export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, googleReady, configured } = useAuth();
  const { width: W } = useWindowDimensions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);

  const railW = Math.min(W, 520);
  const cardW = Math.round(railW * 0.74);
  const gap = space.md;
  const sidePad = Math.round((railW - cardW) / 2);
  const railRef = useRef<ScrollView>(null);

  const slides = useMemo<Slide[]>(() => {
    const q = curatedQuestions[0];
    const q2 = curatedQuestions[1];
    const f = ALL_FACTS.find((x) => x.id === 'in.pop') ?? ALL_FACTS[0];
    const f2 = ALL_FACTS.find((x) => x.value.length <= 10 && x.id !== f.id) ?? ALL_FACTS[1];
    const fw = FRAMEWORKS[0];
    return [
      { kind: 'case', title: q.title, meta: `${q.categories[0]} · ${q.difficulty}` },
      { kind: 'number', value: f.value, label: f.label, emoji: emojiFor(f, '🔢') },
      { kind: 'framework', name: fw.name, line: fw.oneLiner, emoji: fw.emoji },
      { kind: 'number', value: f2.value, label: f2.label, emoji: emojiFor(f2, '🔢') },
      { kind: 'case', title: q2.title, meta: `${q2.categories[0]} · ${q2.difficulty}` },
    ];
  }, []);

  const finish = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, 'yes').catch(() => {});
    router.replace('/');
  };

  const onGoogle = async () => {
    setBusy(true);
    setError(null);
    const message = await signInWithGoogle();
    setBusy(false);
    if (message) setError(message);
    else await finish();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.lg }]}>
      <View style={styles.head}>
        <Image source={require('../assets/icon.png')} style={styles.logo} />
        <Text style={styles.wordmark}>Drill</Text>
        <Text style={styles.tagline}>Practice PM interviews one card at a time.</Text>
        <Text style={styles.sub}>Real case studies, the numbers worth knowing, and the frameworks behind them.</Text>
      </View>

      <ScrollView
        horizontal
        ref={railRef}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={cardW + gap}
        scrollEventThrottle={64}
        onScroll={(e) => {
          const next = Math.round(e.nativeEvent.contentOffset.x / (cardW + gap));
          if (next !== index) setIndex(next);
        }}
        contentContainerStyle={{ paddingHorizontal: sidePad, gap }}
        style={styles.rail}
      >
        {slides.map((s, i) => (
          <SlideCard key={i} slide={s} width={cardW} />
        ))}
      </ScrollView>

      <View style={styles.pips}>
        {slides.map((_, i) => (
          <View key={i} style={[styles.pip, i === index && styles.pipNow]} />
        ))}
      </View>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {googleReady ? (
          <Pressable
            onPress={onGoogle}
            disabled={busy}
            style={({ pressed }) => [styles.google, busy && { opacity: 0.6 }, pressed && { opacity: 0.9 }]}
          >
            {busy ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <GoogleMark />
                <Text style={styles.googleText}>Continue with Google</Text>
              </>
            )}
          </Pressable>
        ) : (
          <View style={styles.notice}>
            <MaterialIcons name="info-outline" size={16} color={colors.textMuted} />
            <Text style={styles.noticeText}>
              {configured
                ? 'Google sign-in needs its OAuth client ids before it can be offered.'
                : 'Cloud sync is not set up in this build, so your progress stays on this device.'}
            </Text>
          </View>
        )}

        <Pressable onPress={finish} hitSlop={8} style={styles.skip}>
          <Text style={styles.skipText}>
            {googleReady ? 'Not now — just let me practise' : 'Start practising'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Google's mark, drawn rather than fetched so nothing loads over the network. */
function GoogleMark() {
  return (
    <View style={styles.gMark}>
      <Text style={styles.gText}>G</Text>
    </View>
  );
}

function SlideCard({ slide, width }: { slide: Slide; width: number }) {
  if (slide.kind === 'number') {
    return (
      <View style={[styles.card, styles.cardBlue, { width }, shadow.accent]}>
        <Text style={styles.cardEmoji}>{slide.emoji}</Text>
        <Text style={styles.numValue} numberOfLines={1} adjustsFontSizeToFit>
          {slide.value}
        </Text>
        <Text style={styles.numLabel} numberOfLines={2}>
          {slide.label}
        </Text>
        <Text style={styles.cardTag}>Numbers</Text>
      </View>
    );
  }
  if (slide.kind === 'framework') {
    return (
      <View style={[styles.card, { width }, shadow.card]}>
        <Text style={styles.cardEmoji}>{slide.emoji}</Text>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {slide.name}
        </Text>
        <Text style={styles.cardLine} numberOfLines={3}>
          {slide.line}
        </Text>
        <Text style={[styles.cardTag, { color: colors.accent }]}>Frameworks</Text>
      </View>
    );
  }
  return (
    <View style={[styles.card, { width }, shadow.card]}>
      <Text style={styles.cardEmoji}>🧩</Text>
      <Text style={styles.cardTitle} numberOfLines={4}>
        {slide.title}
      </Text>
      <Text style={styles.cardLine}>{slide.meta}</Text>
      <Text style={[styles.cardTag, { color: colors.accent }]}>Case study</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, justifyContent: 'space-between' },
  head: { alignItems: 'center', paddingHorizontal: space.xl, gap: 6 },
  logo: { width: 64, height: 64, borderRadius: 16 },
  wordmark: { color: colors.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.8, marginTop: 2 },
  tagline: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginTop: space.xs,
  },
  sub: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  rail: { flexGrow: 0 },
  card: {
    height: 290,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.xl,
    justifyContent: 'center',
    gap: space.sm,
  },
  cardBlue: { backgroundColor: colors.accent },
  cardEmoji: { fontSize: 26 },
  cardTitle: { color: colors.text, fontSize: 20, lineHeight: 27, fontWeight: '800', letterSpacing: -0.3 },
  cardLine: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  cardTag: { color: colors.onAccentMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 2 },
  numValue: { color: colors.onAccent, fontSize: 44, fontWeight: '800', letterSpacing: -1.5 },
  numLabel: { color: colors.onAccent, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  pips: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  pip: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  pipNow: { backgroundColor: colors.accent, width: 20 },
  footer: { paddingHorizontal: space.lg, gap: space.sm },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  gMark: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  gText: { color: '#4285F4', fontSize: 18, fontWeight: '800' },
  googleText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  notice: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', paddingHorizontal: space.xs },
  noticeText: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  error: { color: colors.warning, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  skip: { alignItems: 'center', paddingVertical: 10 },
  skipText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
});
