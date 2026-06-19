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
import { MaterialIcons } from '@expo/vector-icons';
import { questions } from '@/data';
import type { Question } from '@/types/question';
import { useProgress } from '@/state/useProgress';
import { FlipCard } from '@/components/FlipCard';
import { BulletList } from '@/components/blocks';
import { BottomNavBar } from '@/components/BottomNavBar';
import { BackButton, ContextStrip, DrillHeader, StepProgress } from '@/components/DrillHeader';
import { Tag, DifficultyBadge } from '@/components/ui';
import { colors, radius, space } from '@/theme/tokens';

// Literal 7-card flow: each non-question step matches its own Stitch screen
// (design/stitch/{10,11,12,13,14,15}-*.html). Step 0 is the distraction-free
// flashcard (02-question-drill.html) with no chrome besides the header.
const TOTAL_STEPS = 6; // steps 1..6, step 0 is the flashcard intro

export default function QuestionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { markCompleted } = useProgress();

  const [question, setQuestion] = useState<Question | null>(null);
  const [step, setStep] = useState(0);
  const [frameworkFlipped, setFrameworkFlipped] = useState(false);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (id) questions.getById(id).then(setQuestion);
  }, [id]);

  useEffect(() => {
    if (step !== 0) return;
    setSeconds(30);
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step]);

  const finish = () => {
    if (question) markCompleted(question.id);
    router.back();
  };
  const goNext = () => setStep((s) => Math.min(6, s + 1));
  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  // Step 0 only: vertical swipe — up = next, down = previous (matches the
  // "Previous" / "Next" chevron indicators in 02-question-drill.html).
  const swipe = Gesture.Pan()
    .activeOffsetY([-20, 20])
    .failOffsetX([-12, 12])
    .onEnd((e) => {
      'worklet';
      if (e.translationY < -60) runOnJS(goNext)();
      else if (e.translationY > 60) runOnJS(goPrev)();
    });

  if (!question) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  if (step === 0) {
    return (
      <FlashcardScreen
        question={question}
        seconds={seconds}
        onNext={goNext}
      />
    );
  }

  return (
    <View style={styles.container}>
      <DrillHeader streak={7} />
      <ContextStrip question={question.title} />
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <BackButton onPress={goPrev} />
        {step === 1 ? (
          <FrameworkStep
            question={question}
            flipped={frameworkFlipped}
            onToggleFlip={() => setFrameworkFlipped((f) => !f)}
            onNext={goNext}
          />
        ) : step === 2 ? (
          <ClarifyingStep question={question} step={step} onNext={goNext} />
        ) : step === 3 ? (
          <UserSegmentsStep question={question} step={step} onNext={goNext} />
        ) : step === 4 ? (
          <PainPointsStep question={question} step={step} onNext={goNext} />
        ) : step === 5 ? (
          <SolutionMatrixStep question={question} step={step} onNext={goNext} />
        ) : (
          <FinalAnswerStep question={question} step={step} onRestart={() => setStep(0)} onFinish={finish} />
        )}
      </ScrollView>
      <BottomNavBar active="practice" />
    </View>
  );

  function FlashcardScreen({
    question,
    seconds,
    onNext,
  }: {
    question: Question;
    seconds: number;
    onNext: () => void;
  }) {
    const insets = useSafeAreaInsets();
    return (
      <View style={styles.container}>
        <DrillHeader streak={7} />
        <GestureDetector gesture={swipe}>
          <View style={styles.flashcardCanvas}>
            <View style={styles.swipeIndicator}>
              <MaterialIcons name="keyboard-arrow-up" size={18} color={colors.textMuted} />
              <Text style={styles.swipeLabel}>Previous</Text>
            </View>

            <View style={styles.flashcard}>
              <View style={styles.tagRow}>
                {question.domain_tags[0] ? <Tag label={question.domain_tags[0]} /> : null}
                {question.category[0] ? <Tag label={question.category[0]} /> : null}
                <DifficultyBadge difficulty={question.difficulty} />
              </View>
              <View style={styles.faceCenter}>
                <Text style={styles.questionText}>{question.title}</Text>
              </View>
              <View style={styles.timerRow}>
                <MaterialIcons name="timer" size={16} color={colors.textMuted} />
                <Text style={styles.timerText}>Think: {seconds}s</Text>
              </View>
            </View>

            <View style={styles.swipeIndicator}>
              <Text style={styles.swipeLabel}>Next</Text>
              <MaterialIcons name="keyboard-arrow-down" size={18} color={colors.textMuted} />
            </View>
          </View>
        </GestureDetector>

        {/* Floating peek pills */}
        <View style={styles.peekRow}>
          <PeekPill icon="account-tree" label="Framework" />
          <PeekPill icon="help-outline" label="Clarifying Qs" />
          <PeekPill icon="lightbulb" label="Key Pointers" />
        </View>

        {/* Fixed Flip button */}
        <View style={[styles.flipBtnWrap, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
          <Pressable style={styles.flipBtn} onPress={onNext}>
            <Text style={styles.flipBtnText}>Flip</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}

function PeekPill({ icon, label }: { icon: keyof typeof MaterialIcons.glyphMap; label: string }) {
  return (
    <View style={styles.peekPill}>
      <MaterialIcons name={icon} size={16} color={colors.primary} />
      <Text style={styles.peekText}>{label}</Text>
    </View>
  );
}

/* ---- Step 1: Framework — literal to 11-swiggy-framework-flip-updated.html ---- */
function FrameworkStep({
  question,
  flipped,
  onToggleFlip,
  onNext,
}: {
  question: Question;
  flipped: boolean;
  onToggleFlip: () => void;
  onNext: () => void;
}) {
  return (
    <View style={{ gap: space.xl }}>
      <View style={{ alignItems: 'center', gap: space.xs }}>
        <Text style={styles.stepTitle}>Framework</Text>
        <Text style={styles.stepSub}>
          Analyze the core structure and identify the key friction points in the user journey.
        </Text>
      </View>

      <View style={styles.flipCardBox}>
        <FlipCard
          flipped={flipped}
          front={
            <Pressable style={styles.frameworkFront} onPress={onToggleFlip}>
              <View style={styles.frameworkIconCircle}>
                <MaterialIcons name="account-tree" size={40} color={colors.primary} />
              </View>
              <Text style={styles.frameworkFrontTitle}>The Framework</Text>
              <Text style={styles.frameworkFrontSub}>
                Tap to reveal the structured approach for this question.
              </Text>
            </Pressable>
          }
          back={
            <ScrollView style={styles.frameworkBack} contentContainerStyle={{ padding: space.xl }}>
              <Text style={styles.frameworkFrontTitle}>{question.framework}</Text>
              <View style={{ height: space.lg }} />
              {question.framework_steps.map((step, i) => (
                <View key={i} style={styles.numberedRow}>
                  <View style={styles.numberCircle}>
                    <Text style={styles.numberCircleText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.numberedRowText}>{step}</Text>
                </View>
              ))}
            </ScrollView>
          }
        />
      </View>

      <Pressable
        style={styles.actionBtn}
        onPress={flipped ? onNext : onToggleFlip}
      >
        <MaterialIcons
          name={flipped ? 'arrow-forward' : 'flip-camera-android'}
          size={18}
          color={colors.onAccent}
        />
        <Text style={styles.actionBtnText}>{flipped ? 'Next' : 'Flip Card'}</Text>
      </Pressable>
    </View>
  );
}

/* ---- Step 2: Clarifying Questions — literal to 10-...-updated.html ---- */
function ClarifyingStep({
  question,
  step,
  onNext,
}: {
  question: Question;
  step: number;
  onNext: () => void;
}) {
  return (
    <View style={{ gap: space.xl }}>
      <StepProgress step={step} total={TOTAL_STEPS} />
      <View style={styles.card}>
        <View style={{ alignItems: 'center', gap: space.sm, marginBottom: space.lg }}>
          <Text style={styles.cardHeadline}>{question.title}</Text>
          <Text style={styles.cardHeadlineSub}>
            Before jumping into solutions, pause and ask clarifying questions to narrow the scope.
          </Text>
        </View>
        <View style={styles.divider} />
        <Text style={styles.eyebrow}>Key Clarifying Questions</Text>
        <View style={{ height: space.md }} />
        <View style={{ gap: space.md }}>
          {question.clarifying_qs.map((q, i) => (
            <View key={i} style={styles.numberedRow}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberCircleText}>{i + 1}</Text>
              </View>
              <Text style={styles.numberedRowTextMedium}>{q}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Pressable style={styles.actionBtnCompact} onPress={onNext}>
          <Text style={styles.actionBtnText}>Next</Text>
          <MaterialIcons name="arrow-forward" size={16} color={colors.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

/* ---- Step 3: User Segments — literal to 14-...-updated.html ---- */
const SEGMENT_ICONS: (keyof typeof MaterialIcons.glyphMap)[] = ['person-outline', 'groups', 'accessibility-new'];

function UserSegmentsStep({
  question,
  step,
  onNext,
}: {
  question: Question;
  step: number;
  onNext: () => void;
}) {
  return (
    <View style={{ gap: space.xl }}>
      <StepProgress step={step} total={TOTAL_STEPS} />
      <View>
        <Text style={styles.eyebrow}>Prompt Breakdown</Text>
        <Text style={styles.stepTitleLeft}>User Segments</Text>
        <Text style={styles.stepSubLeft}>{question.category.join(' / ')}</Text>
      </View>
      <View style={styles.card}>
        {question.user_segments.map((seg, i) => (
          <View
            key={i}
            style={[
              styles.segmentRow,
              i < question.user_segments.length - 1 && styles.segmentRowBorder,
            ]}
          >
            <View style={styles.segmentIconCircle}>
              <MaterialIcons name={SEGMENT_ICONS[i % SEGMENT_ICONS.length]} size={20} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.segmentTitleRow}>
                <Text style={styles.segmentTitle}>{seg}</Text>
                {i === 0 ? (
                  <View style={styles.targetTag}>
                    <Text style={styles.targetTagText}>TARGET</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ))}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Pressable style={styles.actionBtnCompact} onPress={onNext}>
          <Text style={styles.actionBtnText}>Next</Text>
          <MaterialIcons name="arrow-forward" size={16} color={colors.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

/* ---- Step 4: Pain Points — literal to 13-...-updated.html ---- */
function PainPointsStep({
  question,
  step,
  onNext,
}: {
  question: Question;
  step: number;
  onNext: () => void;
}) {
  return (
    <View style={{ gap: space.xl }}>
      <StepProgress step={step} total={TOTAL_STEPS} />
      <View>
        <Text style={styles.eyebrow}>Practice Session</Text>
        <Text style={styles.stepTitleLeft}>Pain Points</Text>
      </View>
      <View style={styles.articleCard}>
        <View style={styles.articleHeader}>
          <View style={styles.warningIcon}>
            <MaterialIcons name="warning" size={20} color={colors.onErrorContainer} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardHeadingSm}>Key Pain Points</Text>
            <Text style={styles.cardSubSm}>
              Usability hurdles identified for this scenario.
            </Text>
          </View>
        </View>
        <View style={{ padding: space.xl, gap: space.lg }}>
          {question.pain_points.map((p, i) => (
            <View key={i} style={styles.numberedRow}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberCircleText}>{i + 1}</Text>
              </View>
              <Text style={styles.numberedRowTextMedium}>{p}</Text>
            </View>
          ))}
        </View>
        <View style={styles.tagsRow}>
          {question.domain_tags.slice(0, 2).map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
          {question.difficulty === 'Hard' ? <DifficultyBadge difficulty="Hard" /> : null}
        </View>
      </View>
      <Pressable style={styles.actionBtnFull} onPress={onNext}>
        <Text style={styles.actionBtnText}>Next</Text>
        <MaterialIcons name="arrow-forward" size={18} color={colors.onAccent} />
      </Pressable>
    </View>
  );
}

/* ---- Step 5: Solution Matrix — literal to 12-swiggy-solution-matrix.html ---- */
const SOLUTION_ICONS: (keyof typeof MaterialIcons.glyphMap)[] = ['lightbulb', 'build', 'trending-up', 'map'];
const SOLUTION_IMPACT = ['High Impact', 'High Impact', 'Medium Impact', 'Medium Impact'];
const SOLUTION_EFFORT = ['Low Implementation Effort', 'Medium Implementation Effort', 'High Implementation Effort', 'Medium Implementation Effort'];

function SolutionMatrixStep({
  question,
  step,
  onNext,
}: {
  question: Question;
  step: number;
  onNext: () => void;
}) {
  const solutions = question.full_answer.sections;
  return (
    <View style={{ gap: space.xl }}>
      <StepProgress step={step} total={TOTAL_STEPS} />
      <View style={styles.matrixHeaderRow}>
        <View>
          <Text style={styles.cardHeadingSm}>Solution Matrix</Text>
          <Text style={styles.cardSubSm}>Prioritized by impact vs. effort</Text>
        </View>
      </View>
      <View style={{ gap: space.md }}>
        {solutions.map((s, i) => (
          <View key={i} style={styles.solutionCard}>
            <View style={[styles.solutionBar, i < 2 && styles.solutionBarHigh]} />
            <View style={styles.solutionHeader}>
              <View style={styles.solutionHeaderLeft}>
                <View style={styles.solutionIconCircle}>
                  <MaterialIcons name={SOLUTION_ICONS[i % SOLUTION_ICONS.length]} size={18} color={colors.text} />
                </View>
                <Text style={styles.segmentTitle}>{s.heading}</Text>
              </View>
              <View style={styles.impactTag}>
                <Text style={styles.impactTagText}>{SOLUTION_IMPACT[i % SOLUTION_IMPACT.length]}</Text>
              </View>
            </View>
            <View style={styles.solutionDesc}>
              <BulletList items={s.bullets} />
            </View>
            <View style={styles.effortRow}>
              <MaterialIcons name="check-circle" size={14} color={colors.primary} />
              <Text style={styles.effortText}>{SOLUTION_EFFORT[i % SOLUTION_EFFORT.length]}</Text>
            </View>
          </View>
        ))}
      </View>
      <Pressable style={styles.actionBtnFull} onPress={onNext}>
        <Text style={styles.actionBtnText}>Next</Text>
        <MaterialIcons name="arrow-forward" size={18} color={colors.onAccent} />
      </Pressable>
    </View>
  );
}

/* ---- Step 6: Final Answer — literal to 15-swiggy-final-answer.html ---- */
function FinalAnswerStep({
  question,
  step,
  onRestart,
  onFinish,
}: {
  question: Question;
  step: number;
  onRestart: () => void;
  onFinish: () => void;
}) {
  const sections = question.full_answer.sections;
  const PILLAR_ICONS: (keyof typeof MaterialIcons.glyphMap)[] = ['visibility', 'lightbulb', 'check-circle', 'support-agent'];
  return (
    <View style={{ gap: space.xl }}>
      <StepProgress step={step} total={TOTAL_STEPS} />
      <View style={styles.finalCard}>
        <View style={styles.solutionBarFull} />
        <View style={styles.finalTitleRow}>
          <Text style={styles.cardHeadingMd}>Final Recommendation</Text>
          <View style={styles.solutionChip}>
            <Text style={styles.solutionChipText}>Solution</Text>
          </View>
        </View>
        <Text style={styles.finalIntro}>
          Apply the <Text style={{ fontWeight: '700' }}>{question.framework}</Text> framework,
          focusing on: {sections.map((s) => s.heading).join(', ')}.
        </Text>
        <Text style={styles.eyebrow}>Core Pillars of the Solution</Text>
        <View style={{ gap: space.md, marginTop: space.sm }}>
          {sections.map((s, i) => (
            <View key={i} style={styles.pillarCard}>
              <View style={styles.numberCircle}>
                <MaterialIcons name={PILLAR_ICONS[i % PILLAR_ICONS.length]} size={18} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.segmentTitle}>{s.heading}</Text>
                <View style={styles.pillarDesc}>
                  <BulletList items={s.bullets} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.finalActions}>
        <Pressable style={styles.ghostBtn} onPress={onRestart}>
          <MaterialIcons name="refresh" size={18} color={colors.text} />
          <Text style={styles.ghostBtnText}>Review Previous Steps</Text>
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={onFinish}>
          <Text style={styles.actionBtnText}>Finish Drill</Text>
          <MaterialIcons name="check-circle" size={18} color={colors.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.textMuted, fontSize: 14 },
  scrollPad: { padding: space.lg, paddingBottom: space.xxxl, gap: space.lg },

  // Flashcard (step 0)
  flashcardCanvas: { flex: 1, padding: space.lg, justifyContent: 'center', gap: space.md },
  swipeIndicator: { alignItems: 'center', gap: 2 },
  swipeLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  flashcard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: space.xl,
    minHeight: 380,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginBottom: space.xl },
  faceCenter: { flex: 1, justifyContent: 'center' },
  questionText: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  timerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: space.xs, marginTop: space.xl },
  timerText: { color: colors.textMuted, fontSize: 14 },
  peekRow: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, marginBottom: space.md },
  peekPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  peekText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  flipBtnWrap: { paddingHorizontal: space.lg, paddingTop: space.sm },
  flipBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  flipBtnText: { color: colors.onAccent, fontSize: 17, fontWeight: '700' },

  // Shared step chrome
  stepTitle: { color: colors.text, fontSize: 24, fontWeight: '700' },
  stepTitleLeft: { color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 2 },
  stepSub: { color: colors.textMuted, fontSize: 14, textAlign: 'center', maxWidth: 420 },
  stepSubLeft: { color: colors.textMuted, fontSize: 16, marginTop: space.xs },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: space.xl,
  },
  cardHeadline: { color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  cardHeadlineSub: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
  cardHeadingSm: { color: colors.text, fontSize: 17, fontWeight: '700' },
  cardHeadingMd: { color: colors.text, fontSize: 22, fontWeight: '700' },
  cardSubSm: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: space.lg },
  numberedRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberCircleText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  numberedRowText: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 22 },
  numberedRowTextMedium: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 23, fontWeight: '500' },

  actionBtn: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
  },
  actionBtnCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  actionBtnFull: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: space.lg,
  },
  actionBtnText: { color: colors.onAccent, fontSize: 15, fontWeight: '700' },

  // Framework
  flipCardBox: { height: 320 },
  frameworkFront: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  frameworkIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.accent}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  frameworkFrontTitle: { color: colors.text, fontSize: 19, fontWeight: '700', textAlign: 'center' },
  frameworkFrontSub: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: space.sm },
  frameworkBack: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },

  // User segments
  segmentRow: { flexDirection: 'row', gap: space.lg, padding: space.lg, alignItems: 'flex-start' },
  segmentRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  segmentIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  segmentTitle: { color: colors.text, fontSize: 15, fontWeight: '700', flexShrink: 1 },
  targetTag: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: space.xs,
    paddingVertical: 2,
  },
  targetTagText: { color: colors.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  // Pain points
  articleCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  articleHeader: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.xl,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  warningIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, padding: space.xl, paddingTop: 0 },

  // Solution matrix
  matrixHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  solutionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
    overflow: 'hidden',
  },
  solutionBar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, backgroundColor: colors.outline },
  solutionBarHigh: { backgroundColor: colors.accent },
  solutionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: space.sm },
  solutionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: 1 },
  solutionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  impactTag: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
  },
  impactTagText: { color: colors.textMuted, fontSize: 11, fontWeight: '600' },
  solutionDesc: { marginBottom: space.sm },
  effortRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  effortText: { color: colors.primary, fontSize: 12, fontWeight: '600' },

  // Final answer
  finalCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: space.xl,
    gap: space.lg,
    overflow: 'hidden',
  },
  solutionBarFull: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, backgroundColor: colors.accent },
  finalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: space.md,
  },
  solutionChip: { backgroundColor: colors.bgElevated, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: 4 },
  solutionChipText: { color: colors.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  finalIntro: { color: colors.text, fontSize: 16, lineHeight: 24 },
  pillarCard: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: space.lg,
  },
  pillarDesc: { marginTop: 4 },
  finalActions: { flexDirection: 'row', gap: space.md, flexWrap: 'wrap' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  ghostBtnText: { color: colors.text, fontSize: 14, fontWeight: '600' },
});
