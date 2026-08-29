import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { Easing, cancelAnimation, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { FRAMEWORK_BY_KEY } from '@/data/frameworks';
import { questions } from '@/data';
import type { Question } from '@/types/question';
import { QuestionCard } from '@/components/QuestionCard';
import { Eyebrow, IconButton } from '@/components/ui';
import { categoryPastel, colors, radius, shadow, space } from '@/theme/tokens';

const DWELL_MS = 5000;

/**
 * One framework, in the drill's card language: the selected step's detail sits
 * large in the card, the steps are numbered pills at the bottom, and the
 * selected pill fills over five seconds before handing to the next (tap any
 * pill to take over). Below: when to use it, the trap, and the drills that use it.
 */
export default function FrameworkScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key } = useLocalSearchParams<{ key: string }>();
  const fw = FRAMEWORK_BY_KEY[key ?? ''];
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/frameworks'));

  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [drills, setDrills] = useState<Question[]>([]);
  const fill = useSharedValue(0);

  useEffect(() => {
    if (!fw) return;
    questions.list().then((all) => setDrills(fw.drills.map((id) => all.find((q) => q.id === id)).filter((q): q is Question => !!q)));
  }, [fw]);

  const advance = useCallback(() => {
    if (!fw) return;
    setStep((s) => (s + 1 < fw.steps.length ? s + 1 : s));
  }, [fw]);

  useEffect(() => {
    cancelAnimation(fill);
    fill.value = 0;
    if (!fw || paused || step >= fw.steps.length - 1) return;
    fill.value = withTiming(1, { duration: DWELL_MS, easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(advance)();
    });
    return () => cancelAnimation(fill);
  }, [step, paused, fw, fill, advance]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  if (!fw) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.muted}>Framework not found.</Text>
      </View>
    );
  }

  const cat = fw.categories[0];
  const pastel = categoryPastel[cat];
  const current = fw.steps[step];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.xxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.bar}>
          <IconButton icon="arrow-back" onPress={goBack} />
          <View style={[styles.catChip, { backgroundColor: pastel.bg }]}>
            <Text style={[styles.catText, { color: pastel.fg }]}>{fw.categories.join(' · ')}</Text>
          </View>
        </View>

        <View style={styles.head}>
          <Text style={styles.emoji}>{fw.emoji}</Text>
          <Text style={styles.title}>{fw.name}</Text>
          <Text style={styles.oneLiner}>{fw.oneLiner}</Text>
          {fw.alsoKnownAs ? <Text style={styles.aka}>Also known as: {fw.alsoKnownAs}</Text> : null}
        </View>

        {/* The steps card */}
        <View style={styles.card}>
          <Eyebrow>{`Step ${step + 1} of ${fw.steps.length}`}</Eyebrow>
          <Text style={styles.stepTitle}>{current.label}</Text>
          <Text style={styles.stepDetail}>{current.detail}</Text>
          <View style={styles.pills}>
            {fw.steps.map((s, i) => {
              const on = i === step;
              return (
                <Pressable
                  key={s.label}
                  onPress={() => {
                    setPaused(true);
                    setStep(i);
                  }}
                  style={[styles.pill, on && styles.pillOn]}
                >
                  {on && !paused ? <Animated.View style={[styles.pillFill, fillStyle]} /> : null}
                  <Text style={[styles.pillText, on && styles.pillTextOn]} numberOfLines={1}>
                    {i + 1}. {s.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <MaterialIcons name="check-circle" size={18} color={colors.success} />
              <Text style={[styles.blockLabel, { color: colors.success }]}>When to use it</Text>
            </View>
            <Text style={styles.blockText}>{fw.whenToUse}</Text>
          </View>
          <View style={[styles.block, { backgroundColor: '#FDECEC' }]}>
            <View style={styles.blockHead}>
              <MaterialIcons name="warning-amber" size={18} color={colors.danger} />
              <Text style={[styles.blockLabel, { color: colors.danger }]}>The trap</Text>
            </View>
            <Text style={styles.blockText}>{fw.trap}</Text>
          </View>
        </View>

        {drills.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>See it applied</Text>
            <View style={{ gap: space.sm }}>
              {drills.map((q) => (
                <QuestionCard key={q.id} question={q} compact onPress={() => router.push(`/question/${q.id}`)} />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.textMuted, fontSize: 15 },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, marginBottom: space.lg },
  catChip: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  catText: { fontSize: 12, fontWeight: '800' },
  head: { paddingHorizontal: space.lg, gap: 6, marginBottom: space.lg },
  emoji: { fontSize: 36 },
  title: { color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.6 },
  oneLiner: { color: colors.textMuted, fontSize: 16, lineHeight: 23 },
  aka: { color: colors.textFaint, fontSize: 13, marginTop: 2 },
  card: { marginHorizontal: space.lg, backgroundColor: colors.surface, borderRadius: radius.card, padding: 26, gap: space.md, minHeight: 360, justifyContent: 'center', ...shadow.cardStrong },
  stepTitle: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '800', letterSpacing: -0.4 },
  stepDetail: { color: colors.text, fontSize: 17, lineHeight: 26, flexGrow: 1 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  pill: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%', overflow: 'hidden' },
  pillOn: { backgroundColor: colors.accent },
  pillFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.28)' },
  pillText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  pillTextOn: { color: colors.onAccent },
  section: { paddingHorizontal: space.lg, marginTop: space.xl, gap: space.md },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
  block: { backgroundColor: '#E8F7EE', borderRadius: radius.lg, padding: space.lg, gap: 6 },
  blockHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  blockLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  blockText: { color: colors.text, fontSize: 15, lineHeight: 22 },
});
