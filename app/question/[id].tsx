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
import { runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { questions } from '@/data';
import type { Question } from '@/types/question';
import { useProgress } from '@/state/useProgress';
import { FlipCard } from '@/components/FlipCard';
import { TimerRing } from '@/components/TimerRing';
import { BottomSheet } from '@/components/BottomSheet';
import { AnswerSections, BulletList, SectionLabel } from '@/components/blocks';
import { CategoryPill, DifficultyDot } from '@/components/ui';
import { colors, radius, space } from '@/theme/tokens';

// Card steps: 0 Question · 1 Framework · 2 Clarifying · 3 Pointers · 4 Answer.
// 0→1 and 3→4 are flips (within a FlipCard); the rest are swipes.
type Sheet = { title: string; items: string[] } | null;

export default function QuestionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isBookmarked, toggleBookmark, markCompleted } = useProgress();

  const [question, setQuestion] = useState<Question | null>(null);
  const [step, setStep] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [timerHidden, setTimerHidden] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);

  useEffect(() => {
    if (id) questions.getById(id).then(setQuestion);
  }, [id]);

  const finish = () => {
    if (question) markCompleted(question.id);
    router.back();
  };
  const goNext = () => {
    if (step >= 4) finish();
    else setStep(step + 1);
  };
  const goPrev = () => setStep(Math.max(0, step - 1));

  // Horizontal swipe: left → next, right → previous (PRD card navigation).
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
  const answerZone = step === 4;

  return (
    <View
      style={[
        styles.container,
        answerZone && { backgroundColor: colors.bgElevated },
        { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.lg },
      ]}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <View style={styles.pillRow}>
          {question.category[0] ? (
            <CategoryPill category={question.category[0]} />
          ) : null}
          <DifficultyDot difficulty={question.difficulty} showLabel />
        </View>
        <Pressable onPress={() => toggleBookmark(question.id)} hitSlop={12}>
          <Text style={[styles.bookmark, bookmarked && styles.bookmarkOn]}>
            {bookmarked ? '★' : '☆'}
          </Text>
        </Pressable>
      </View>

      {/* Card body */}
      <GestureDetector gesture={swipe}>
        <View style={styles.body}>
          {step <= 1 ? (
            <FlipCard
              flipped={step === 1}
              front={<QuestionFace question={question} />}
              back={<FrameworkFace question={question} />}
            />
          ) : step === 2 ? (
            <ClarifyingCard question={question} />
          ) : (
            <FlipCard
              flipped={step === 4}
              front={<PointersFace question={question} />}
              back={<AnswerFace question={question} />}
            />
          )}
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
                setSheet({ title: 'Framework', items: question.framework_steps })
              }
            />
            <PeekTab
              label="Clarifying Qs"
              onPress={() =>
                setSheet({ title: 'Clarifying Questions', items: question.clarifying_qs })
              }
            />
            <PeekTab
              label="Key Pointers"
              onPress={() =>
                setSheet({ title: 'Key Pointers', items: question.pain_points })
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

function QuestionFace({ question }: { question: Question }) {
  return (
    <View style={styles.faceCenter}>
      <Text style={styles.questionText}>{question.title}</Text>
    </View>
  );
}

function FrameworkFace({ question }: { question: Question }) {
  return (
    <ScrollView contentContainerStyle={styles.facePad}>
      <SectionLabel>Framework</SectionLabel>
      <Text style={styles.frameworkName}>{question.framework}</Text>
      <View style={{ height: space.md }} />
      <BulletList items={question.framework_steps} />
    </ScrollView>
  );
}

function ClarifyingCard({ question }: { question: Question }) {
  return (
    <ScrollView contentContainerStyle={styles.facePad}>
      <SectionLabel>Clarifying Questions</SectionLabel>
      <View style={{ height: space.md }} />
      <BulletList items={question.clarifying_qs} />
      <View style={{ height: space.xl }} />
      <SectionLabel>Who are you building for?</SectionLabel>
      <View style={{ height: space.md }} />
      <BulletList items={question.user_segments} />
    </ScrollView>
  );
}

function PointersFace({ question }: { question: Question }) {
  const covers = question.full_answer.sections.map((s) => s.heading);
  return (
    <ScrollView contentContainerStyle={styles.facePad}>
      <SectionLabel>Key Pointers</SectionLabel>
      <View style={{ height: space.md }} />
      <Text style={styles.subLabel}>Pain points</Text>
      <BulletList items={question.pain_points} />
      <View style={{ height: space.xl }} />
      <Text style={styles.subLabel}>What a strong answer covers</Text>
      <BulletList items={covers} />
    </ScrollView>
  );
}

function AnswerFace({ question }: { question: Question }) {
  return (
    <ScrollView contentContainerStyle={styles.facePad}>
      <SectionLabel>Answer</SectionLabel>
      <View style={{ height: space.lg }} />
      <AnswerSections sections={question.full_answer.sections} />
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
    <Pressable style={[styles.btn, styles.ghost]} onPress={onPress}>
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

function FilledButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.btn, styles.filled]} onPress={onPress}>
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
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: 1, flexWrap: 'wrap' },
  bookmark: { color: colors.textMuted, fontSize: 24 },
  bookmarkOn: { color: colors.accent },
  body: { flex: 1, marginVertical: space.lg },
  faceCenter: { flex: 1, justifyContent: 'center' },
  facePad: { paddingVertical: space.sm },
  questionText: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  frameworkName: { color: colors.text, fontSize: 22, fontWeight: '700' },
  subLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: space.sm,
  },
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
  ghost: { borderWidth: 1, borderColor: colors.border },
  ghostText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  filled: { backgroundColor: colors.accent },
  filledText: { color: colors.bg, fontSize: 15, fontWeight: '700' },
});
