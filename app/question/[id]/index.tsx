import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { questions } from '@/data';
import type { Question } from '@/types/question';
import { useProgress } from '@/state/useProgress';
import { FlipCard } from '@/components/FlipCard';
import { TimerRing } from '@/components/TimerRing';
import { BottomSheet } from '@/components/BottomSheet';
import { AnswerBody, BulletList, SectionLabel } from '@/components/blocks';
import { CategoryPill, DifficultyDot } from '@/components/ui';
import { colors, radius, space } from '@/theme/tokens';

// Card steps: 0 Question · 1 Framework · 2 Clarifying · 3 Key Pointers · 4 Answer.
// Zones group the flip pairs: A = {0,1}, B = {2}, C = {3,4}. Flips happen inside
// a zone (0↔1, 3↔4); moving between zones (1→2, 2→3) slides horizontally.
type Sheet = { title: string; items: string[] } | null;

function zoneOf(step: number): 'A' | 'B' | 'C' {
  return step <= 1 ? 'A' : step === 2 ? 'B' : 'C';
}

export default function QuestionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isBookmarked, toggleBookmark, markCompleted } = useProgress();

  const [question, setQuestion] = useState<Question | null>(null);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [timerKey, setTimerKey] = useState(0);
  const [timerHidden, setTimerHidden] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [hintSeen, setHintSeen] = useState(false);

  useEffect(() => {
    if (id) questions.getById(id).then(setQuestion);
  }, [id]);

  const finish = () => {
    if (question) markCompleted(question.id);
    router.back();
  };
  const goNext = () => {
    setHintSeen(true);
    setDir(1);
    if (step >= 4) finish();
    else setStep(step + 1);
  };
  const goPrev = () => {
    setHintSeen(true);
    setDir(-1);
    setStep(Math.max(0, step - 1));
  };

  // Horizontal swipe: left → next, right → previous.
  const swipe = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-12, 12])
    .onEnd((e) => {
      'worklet';
      if (e.translationX < -60) runOnJS(goNext)();
      else if (e.translationX > 60) runOnJS(goPrev)();
    });

  if (!question) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  const bookmarked = isBookmarked(question.id);
  const zone = zoneOf(step);
  const entering = (dir >= 0 ? SlideInRight : SlideInLeft).duration(260);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.lg },
      ]}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <View style={styles.pillRow}>
          {question.categories[0] ? (
            <CategoryPill category={question.categories[0]} />
          ) : null}
          <DifficultyDot difficulty={question.difficulty} showLabel />
        </View>
        <Pressable onPress={() => toggleBookmark(question.id)} hitSlop={12}>
          <Text style={[styles.bookmark, bookmarked && styles.bookmarkOn]}>
            {bookmarked ? '★' : '☆'}
          </Text>
        </Pressable>
      </View>

      {/* Step indicator */}
      <View style={styles.dots}>
        {[0, 1, 2, 3, 4].map((s) => (
          <View key={s} style={[styles.dot, s === step && styles.dotActive]} />
        ))}
      </View>

      {/* Card body — a slide animation plays when the zone changes */}
      <GestureDetector gesture={swipe}>
        <View style={styles.body}>
          <Animated.View key={zone} entering={entering} style={styles.zoneFill}>
            {zone === 'A' ? (
              <FlipCard
                flipped={step === 1}
                front={<QuestionFace question={question} showHint={!hintSeen} />}
                back={<FrameworkFace question={question} />}
              />
            ) : zone === 'B' ? (
              <ClarifyingCard question={question} />
            ) : (
              <FlipCard
                flipped={step === 4}
                front={<PointersFace question={question} />}
                back={
                  <AnswerFace
                    question={question}
                    onReadFull={() => router.push(`/question/${question.id}/read`)}
                  />
                }
              />
            )}
          </Animated.View>
        </View>
      </GestureDetector>

      {/* Card 1 extras: timer + peek tabs */}
      {step === 0 ? (
        <View style={styles.card1Extras}>
          <View style={styles.timerRow}>
            {timerHidden ? (
              <View style={{ height: 64, justifyContent: 'center' }}>
                <Text style={styles.muted}>Timer skipped</Text>
              </View>
            ) : (
              <TimerRing runKey={timerKey} />
            )}
            <Pressable onPress={() => setTimerHidden(true)} hitSlop={8}>
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          </View>
          <View style={styles.peekRow}>
            <PeekTab
              label="Framework"
              onPress={() =>
                setSheet({ title: 'Framework', items: question.framework.steps })
              }
            />
            <PeekTab
              label="Clarifying Qs"
              onPress={() =>
                setSheet({
                  title: 'Clarifying Questions',
                  items: question.clarifying_questions,
                })
              }
            />
            <PeekTab
              label="Key Pointers"
              onPress={() =>
                setSheet({ title: 'Key Pointers', items: question.key_pointers })
              }
            />
          </View>
        </View>
      ) : null}

      {/* Footer controls */}
      <View style={styles.footer}>{renderControls()}</View>

      <BottomSheet
        visible={sheet !== null}
        title={sheet?.title ?? ''}
        items={sheet?.items ?? []}
        onClose={() => setSheet(null)}
      />
    </View>
  );

  function renderControls() {
    switch (step) {
      case 0:
        return (
          <>
            <GhostButton
              label="Think more"
              onPress={() => {
                setTimerHidden(false);
                setTimerKey((k) => k + 1);
              }}
            />
            <FilledButton label="Flip →" onPress={goNext} />
          </>
        );
      case 1:
      case 2:
        return (
          <>
            <GhostButton label="← Back" onPress={goPrev} />
            <FilledButton label="Next →" onPress={goNext} />
          </>
        );
      case 3:
        return (
          <>
            <GhostButton label="← Back" onPress={goPrev} />
            <FilledButton label="Flip for Answer →" onPress={goNext} />
          </>
        );
      default:
        return (
          <>
            <GhostButton
              label={bookmarked ? '★ Bookmarked' : '☆ Bookmark'}
              onPress={() => toggleBookmark(question!.id)}
            />
            <FilledButton label="Done ✓" onPress={finish} />
          </>
        );
    }
  }
}

/* ---- Card faces ---- */

function QuestionFace({
  question,
  showHint,
}: {
  question: Question;
  showHint: boolean;
}) {
  return (
    <View style={[styles.cardSurface, styles.questionFace]}>
      <Text style={styles.questionText}>{question.title}</Text>
      {showHint ? (
        <Text style={styles.swipeHint}>← swipe or use the buttons →</Text>
      ) : null}
    </View>
  );
}

function FrameworkFace({ question }: { question: Question }) {
  return (
    <ScrollView style={styles.cardSurface} contentContainerStyle={styles.cardPad}>
      <SectionLabel>Framework</SectionLabel>
      <Text style={styles.frameworkName}>{question.framework.name}</Text>
      <View style={{ height: space.md }} />
      <BulletList items={question.framework.steps} />
    </ScrollView>
  );
}

function ClarifyingCard({ question }: { question: Question }) {
  return (
    <ScrollView style={styles.cardSurface} contentContainerStyle={styles.cardPad}>
      <SectionLabel>Clarifying Questions</SectionLabel>
      <View style={{ height: space.md }} />
      <BulletList items={question.clarifying_questions} />
      <View style={{ height: space.xl }} />
      <SectionLabel>Who are you building for?</SectionLabel>
      <View style={{ height: space.md }} />
      <BulletList items={question.user_segments} />
    </ScrollView>
  );
}

function PointersFace({ question }: { question: Question }) {
  return (
    <ScrollView style={styles.cardSurface} contentContainerStyle={styles.cardPad}>
      <SectionLabel>Key Pointers</SectionLabel>
      <View style={{ height: space.md }} />
      <BulletList items={question.key_pointers} />
      <View style={{ height: space.xl }} />
      <View style={styles.readyCallout}>
        <Text style={styles.readyText}>Ready to see the answer? Flip →</Text>
      </View>
    </ScrollView>
  );
}

function AnswerFace({
  question,
  onReadFull,
}: {
  question: Question;
  onReadFull: () => void;
}) {
  return (
    <ScrollView
      style={[styles.cardSurface, styles.answerSurface]}
      contentContainerStyle={styles.cardPad}
    >
      <View style={styles.answerHeader}>
        <SectionLabel>Answer</SectionLabel>
        <Pressable onPress={onReadFull} hitSlop={8}>
          <Text style={styles.readFull}>Read full answer →</Text>
        </Pressable>
      </View>
      <View style={{ height: space.lg }} />
      <AnswerBody sections={question.answer} />
    </ScrollView>
  );
}

/* ---- Buttons ---- */

function PeekTab({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.peekTab} onPress={onPress}>
      <Text style={styles.peekText}>{label}</Text>
    </Pressable>
  );
}

function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, styles.ghost, pressed && styles.btnPressed]}
      onPress={onPress}
    >
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

function FilledButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, styles.filled, pressed && styles.btnPressed]}
      onPress={onPress}
    >
      <Text style={styles.filledText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.lg },
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.textMuted, fontSize: 14 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  back: { color: colors.text, fontSize: 34, lineHeight: 34 },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flex: 1,
    flexWrap: 'wrap',
  },
  bookmark: { color: colors.textMuted, fontSize: 24 },
  bookmarkOn: { color: colors.accent },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.sm,
    marginTop: space.md,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.accent, width: 18 },
  body: { flex: 1, marginVertical: space.lg },
  zoneFill: { flex: 1 },
  // Card surface shared by every face — gives the floating content a real card.
  cardSurface: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  answerSurface: { backgroundColor: colors.surfaceAlt },
  cardPad: { padding: space.xl },
  questionFace: {
    justifyContent: 'center',
    padding: space.xl,
    gap: space.xl,
  },
  questionText: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 35,
    letterSpacing: -0.5,
  },
  swipeHint: { color: colors.textFaint, fontSize: 13, textAlign: 'center' },
  frameworkName: { color: colors.text, fontSize: 22, fontWeight: '700' },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readFull: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  readyCallout: {
    backgroundColor: colors.bgElevated,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: radius.sm,
    padding: space.lg,
  },
  readyText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  card1Extras: { gap: space.md, marginBottom: space.md },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  skip: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  peekRow: { flexDirection: 'row', gap: space.sm },
  peekTab: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: space.sm,
    alignItems: 'center',
  },
  peekText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  footer: { flexDirection: 'row', gap: space.md },
  btn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  btnPressed: { opacity: 0.85 },
  ghost: { borderWidth: 1, borderColor: colors.border },
  ghostText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  filled: { backgroundColor: colors.accent },
  filledText: { color: colors.bg, fontSize: 15, fontWeight: '700' },
});
