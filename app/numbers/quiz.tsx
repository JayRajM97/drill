import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ALL_FACTS, emojiFor, NUMBER_TOPICS, REGION_LABEL, type Fact } from '@/data/numbers';
import { IconButton, PillButton, Eyebrow } from '@/components/ui';
import { colors, radius, shadow, space } from '@/theme/tokens';

const QUESTIONS = 10;

interface Q {
  fact: Fact;
  topicEmoji: string;
  options: string[];
}

function shuffle<T>(a: T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Rough "unit class" so distractors look plausible (%, $, count…). */
function unit(v: string): string {
  if (/%/.test(v)) return '%';
  if (/\$|₹/.test(v)) return '$';
  if (/\b[BMK]\b|[0-9][BMKT]\b/.test(v)) return 'n';
  if (/h\b|min|AM|PM/.test(v)) return 't';
  return 'x';
}

function buildQuiz(topicKey: string): Q[] {
  const topic = NUMBER_TOPICS.find((t) => t.key === topicKey);
  const pool = (topic ? topic.groups.flatMap((g) => g.facts) : ALL_FACTS).filter((f) => !f.parts);
  const all = ALL_FACTS.filter((f) => !f.parts);
  return shuffle(pool)
    .slice(0, QUESTIONS)
    .map((fact) => {
      const u = unit(fact.value);
      const sameUnit = all.filter((f) => f.id !== fact.id && f.value !== fact.value && unit(f.value) === u);
      const fallback = all.filter((f) => f.id !== fact.id && f.value !== fact.value);
      const distractors = shuffle(sameUnit.length >= 3 ? sameUnit : fallback)
        .map((f) => f.value)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .slice(0, 3);
      const t = NUMBER_TOPICS.find((tt) => tt.groups.some((g) => g.facts.includes(fact)));
      return { fact, topicEmoji: t?.emoji ?? '🔢', options: shuffle([fact.value, ...distractors]) };
    });
}

export default function NumbersQuiz() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { topic } = useLocalSearchParams<{ topic?: string }>();
  const topicKey = topic && topic !== 'all' ? topic : 'all';
  const topicTitle = NUMBER_TOPICS.find((t) => t.key === topicKey)?.title ?? 'All numbers';
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/numbers'));

  const [seed, setSeed] = useState(0);
  const quiz = useMemo(() => buildQuiz(topicKey), [topicKey, seed]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const q = quiz[i];
  const done = i >= quiz.length;

  const choose = (v: string) => {
    if (picked) return;
    setPicked(v);
    if (v === q.fact.value) setScore((s) => s + 1);
  };
  const next = () => {
    setPicked(null);
    setI((n) => n + 1);
  };
  const restart = () => {
    setSeed((s) => s + 1);
    setI(0);
    setPicked(null);
    setScore(0);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.sm }]}>
      <View style={styles.header}>
        <IconButton icon="close" onPress={goBack} />
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>{topicTitle}</Text>
          <Text style={styles.headerCount}>{done ? 'Done' : `${i + 1} of ${quiz.length}`}</Text>
        </View>
        <View style={styles.score}>
          <MaterialIcons name="bolt" size={16} color={colors.accent} />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      <View style={styles.progress}>
        {quiz.map((_, k) => (
          <View key={k} style={[styles.dot, k < i && styles.dotDone, k === i && !done && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.deck}>
        {/* stack peek */}
        {!done && i + 1 < quiz.length ? <View style={[styles.card, styles.ghost]} /> : null}
        <View style={[styles.card, styles.cardPad]}>
          {done ? (
            <View style={styles.center}>
              <View style={styles.doneIcon}>
                <Text style={{ fontSize: 40 }}>{score >= quiz.length * 0.7 ? '🏆' : '📚'}</Text>
              </View>
              <Text style={styles.big}>
                {score} / {quiz.length}
              </Text>
              <Text style={styles.body}>
                {score === quiz.length ? 'Perfect recall.' : score >= quiz.length * 0.7 ? 'Solid — a couple more reps and these are yours.' : 'Keep drilling; the misses are the ones to remember.'}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.qTop}>
                <Eyebrow>{q.fact.region ? REGION_LABEL[q.fact.region] : 'Quick recall'}</Eyebrow>
                <Text style={styles.emoji}>{emojiFor(q.fact, q.topicEmoji)}</Text>
              </View>
              <View style={[styles.center, { flex: 1 }]}>
                <Text style={styles.question}>{q.fact.label}</Text>
                <Text style={styles.hint}>Pick the number.</Text>
              </View>
              <View style={{ gap: space.sm }}>
                {q.options.map((v) => {
                  const isRight = v === q.fact.value;
                  const state = !picked ? 'idle' : isRight ? 'right' : v === picked ? 'wrong' : 'dim';
                  return (
                    <Pressable
                      key={v}
                      onPress={() => choose(v)}
                      style={[styles.option, state === 'right' && styles.optRight, state === 'wrong' && styles.optWrong, state === 'dim' && { opacity: 0.45 }]}
                    >
                      <Text style={[styles.optionText, state === 'right' && { color: colors.success }, state === 'wrong' && { color: colors.danger }]}>{v}</Text>
                      {state === 'right' ? <MaterialIcons name="check-circle" size={20} color={colors.success} /> : null}
                      {state === 'wrong' ? <MaterialIcons name="cancel" size={20} color={colors.danger} /> : null}
                    </Pressable>
                  );
                })}
              </View>
              {picked && q.fact.note ? <Text style={styles.note}>{q.fact.note}</Text> : null}
            </>
          )}
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        {done ? (
          <>
            <PillButton label="Again" tone="ghost" icon="refresh" onPress={restart} style={{ flex: 1 }} />
            <PillButton label="Finish" icon="check" onPress={goBack} style={{ flex: 1.4 }} />
          </>
        ) : (
          <PillButton
            label={i + 1 === quiz.length ? 'See score' : 'Next'}
            icon="arrow-forward"
            onPress={next}
            style={{ flex: 1, opacity: picked ? 1 : 0.4 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center', gap: space.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  headerCount: { color: colors.textFaint, fontSize: 11, fontWeight: '600' },
  score: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 12, height: 44, ...shadow.card },
  scoreText: { color: colors.text, fontSize: 15, fontWeight: '800' },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 5, paddingTop: space.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surfaceHigh },
  dotDone: { backgroundColor: colors.accent, opacity: 0.4 },
  dotActive: { backgroundColor: colors.accent, width: 18 },
  deck: { flex: 1, margin: space.lg, marginTop: space.xl, alignItems: 'center' },
  card: { position: 'absolute', top: 0, bottom: 0, width: '92%', backgroundColor: colors.surface, borderRadius: radius.card, ...shadow.cardStrong },
  ghost: { transform: [{ scale: 0.94 }, { translateY: -18 }], opacity: 0.7 },
  cardPad: { padding: 26, gap: space.md },
  qTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emoji: { fontSize: 28 },
  question: { color: colors.text, fontSize: 26, lineHeight: 33, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' },
  hint: { color: colors.textFaint, fontSize: 13 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optRight: { backgroundColor: '#E8F7EE', borderColor: colors.success },
  optWrong: { backgroundColor: '#FDECEC', borderColor: colors.danger },
  optionText: { color: colors.text, fontSize: 17, fontWeight: '700' },
  note: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  big: { color: colors.text, fontSize: 44, fontWeight: '800', letterSpacing: -1 },
  body: { color: colors.textMuted, fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 260 },
  doneIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', gap: space.md, paddingHorizontal: space.lg, paddingTop: space.sm },
});
