import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  cancelAnimation,
  withRepeat,
  withSequence,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { questions } from '@/data';
import type { Question } from '@/types/question';
import { useProgress } from '@/state/useProgress';
import { buildDeck, SECTION_LABEL, type DeckCard, type Pill, type Section } from '@/drill/deck';
import { frameworkForQuestion } from '@/data/frameworks';
import { TimerRing } from '@/components/TimerRing';
import { IndexSheet } from '@/components/IndexSheet';
import { AudioBar } from '@/components/AudioBar';
import { NARRATION } from '@/data/narration';
import { DifficultyBadge, Eyebrow, IconButton, PillButton, Tag } from '@/components/ui';
import { colors, radius, shadow, space } from '@/theme/tokens';

const THINK_SECONDS = 30;
const MOVE = { duration: 380, easing: Easing.inOut(Easing.cubic) };
const FAST = { duration: 110, easing: Easing.out(Easing.quad) };
const PILL_DWELL_MS = 5000;

/** Dot colour per section so the progress row is honest about where you are. */
const SECTION_COLOR: Record<Section, string> = {
  Question: colors.text,
  Framework: '#7E22CE',
  Clarify: '#0369A1',
  Users: '#15803D',
  Pointers: '#B45309',
  Answer: colors.accent,
  Compare: '#BE185D',
  Done: colors.success,
};

export default function QuestionScreen() {
  const router = useRouter();
  // On a deep link / web refresh there is no history to pop; fall back to Home.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { markCompleted, isBookmarked, toggleBookmark } = useProgress();

  const [question, setQuestion] = useState<Question | null>(null);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [incoming, setIncoming] = useState<number | null>(null);
  const jumpTarget = useRef<number | null>(null);
  const [indexOpen, setIndexOpen] = useState(false);

  useEffect(() => {
    if (id) questions.getById(id).then(setQuestion);
  }, [id]);

  const deck = useMemo(() => (question ? buildDeck(question) : []), [question]);
  const card = deck[index];
  const total = deck.length;
  const cardW = Math.min((W - space.lg * 2) * 0.9, 380);

  // ---- stack motion ------------------------------------------------------
  // Forward: the front card slides off to the left while the card behind
  // rises into its place. Back: the previous card slides in from the left
  // over the stack while the front settles back one step.
  const x = useSharedValue(0); // front card drag / exit (horizontal)
  const y = useSharedValue(0); // front card drag / exit (vertical)
  const inX = useSharedValue(-W); // incoming (previous) card
  const h = useSharedValue(600); // deck height, measured

  const lift = (scale: number, gap: number) => -((1 - scale) * h.value) / 2 - gap;

  // Reset motion values in the same JS tick as the index change so the old
  // card never paints a frame at its home position with stale content.
  const settle = useCallback((next: number) => {
    setIndex(next);
    setIncoming(null);
    setBusy(false);
  }, []);

  // Reset motion only once React has committed the new index — after the DOM
  // update, before paint — so the old card never flashes back to rest.
  useLayoutEffect(() => {
    x.value = 0;
    y.value = 0;
    inX.value = -W;
  }, [index, x, y, inX, W]);

  const goNext = useCallback(
    (axis: 'x' | 'y' = 'x', timing = MOVE) => {
      if (busy || index + 1 >= total) return;
      setBusy(true);
      const done = (finished?: boolean) => {
        'worklet';
        if (finished) runOnJS(settle)(index + 1);
      };
      if (axis === 'y') y.value = withTiming(-h.value * 1.1, timing, done);
      else x.value = withTiming(-W * 1.05, timing, done);
    },
    [busy, index, total, W, x, y, h, settle],
  );

  const goPrev = useCallback(
    (timing = MOVE) => {
      if (busy || index === 0) return;
      setBusy(true);
      setIncoming(index - 1);
      inX.value = -W * 1.05;
      inX.value = withTiming(0, timing, (finished) => {
        if (finished) runOnJS(settle)(index - 1);
      });
    },
    [busy, index, W, inX, settle],
  );

  // A jump from the index flips through the cards one by one, fast.
  useEffect(() => {
    const target = jumpTarget.current;
    if (target == null || busy) return;
    if (target === index) {
      jumpTarget.current = null;
      return;
    }
    if (target > index) goNext('x', FAST);
    else goPrev(FAST);
  }, [index, busy, goNext, goPrev]);


  // Swipe in any direction: left / up = next, right / down = previous.
  const pan = Gesture.Pan()
    .activeOffsetX([-14, 14])
    .activeOffsetY([-24, 24])
    .onChange((e) => {
      'worklet';
      if (Math.abs(e.translationX) >= Math.abs(e.translationY)) {
        x.value = Math.min(0, e.translationX); // only drag forward
        y.value = 0;
      } else {
        y.value = Math.min(0, e.translationY);
        x.value = 0;
      }
    })
    .onEnd((e) => {
      'worklet';
      const horizontal = Math.abs(e.translationX) >= Math.abs(e.translationY);
      if (horizontal) {
        if (e.translationX < -70 || e.velocityX < -600) runOnJS(goNext)('x');
        else if (e.translationX > 70 || e.velocityX > 600) runOnJS(goPrev)(MOVE);
        else x.value = withTiming(0, MOVE);
      } else {
        if (e.translationY < -90 || e.velocityY < -700) runOnJS(goNext)('y');
        else if (e.translationY > 90 || e.velocityY > 700) runOnJS(goPrev)(MOVE);
        else y.value = withTiming(0, MOVE);
      }
    });

  // Keyboard arrows on web.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext('x');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        goNext('y');
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        goPrev(MOVE);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const finish = () => {
    if (question) markCompleted(question.id);
    goBack();
  };
  const restart = () => {
    x.value = 0;
    y.value = 0;
    settle(0);
  };
  const jumpTo = (i: number) => {
    setIndexOpen(false);
    if (i === index) return;
    jumpTarget.current = i;
    if (!busy) (i > index ? goNext('x', FAST) : goPrev(FAST));
  };

  if (!question || !card) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  const isFirst = index === 0;
  const cta = card.kind === 'question' ? 'Reveal' : card.kind === 'prompt' ? 'Show me' : 'Next';

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.sm }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="close" onPress={() => goBack()} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{SECTION_LABEL[card.section]}</Text>
          <Text style={styles.headerCount}>
            {index + 1} of {total}
          </Text>
        </View>
        <IconButton
          icon={isBookmarked(question.id) ? 'bookmark' : 'bookmark-border'}
          onPress={() => toggleBookmark(question.id)}
        />
      </View>

      {/* One dot per card, coloured by section — an honest map of the deck */}
      <View style={styles.progress}>
        {deck.map((c, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: SECTION_COLOR[c.section], opacity: i < index ? 0.35 : i === index ? 1 : 0.15 },
              i === index && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Deck: every visible card is its own persistent layer, positioned by
          its depth (0 = front). Cards keep their element as they move forward,
          so nothing remounts between swipes. */}
      <GestureDetector gesture={pan}>
        <View style={styles.deck} onLayout={(e) => { h.value = e.nativeEvent.layout.height - 32; }}>
          {[2, 1, 0, -1].map((offset) => {
            if (offset === -1 && incoming == null) return null;
            const i = offset === -1 ? incoming! : index + offset;
            if (i < 0 || i >= total) return null;
            return (
              <Layer key={i} offset={offset} x={x} y={y} inX={inX} h={h} W={W} width={cardW}>
                <CardView
                  card={deck[i]}
                  question={question}
                  runKey={offset === 0 ? index : -1}
                  fresh={i > 0 && deck[i].section === 'Answer' && deck[i].kind !== 'prompt' && deck[i - 1].title !== deck[i].title}
                />
              </Layer>
            );
          })}
        </View>
      </GestureDetector>

      {/* Narration: one warm voice walking the whole answer */}
      {NARRATION[question.id] ? <AudioBar narration={NARRATION[question.id]} /> : null}

      {/* Footer controls: back · next · index */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        <IconButton icon="arrow-back" onPress={() => goPrev()} style={{ opacity: isFirst ? 0.35 : 1 }} size={56} />
        {card.kind === 'done' ? (
          <PillButton label="Finish" icon="check" onPress={finish} style={{ flex: 1 }} />
        ) : (
          <PillButton label={cta} icon="arrow-forward" onPress={() => goNext()} style={{ flex: 1 }} />
        )}
        <Pressable onPress={() => setIndexOpen(true)} style={styles.menuBtn} hitSlop={6}>
          <MaterialIcons name="format-list-bulleted" size={24} color={colors.accent} />
        </Pressable>
      </View>

      <IndexSheet
        visible={indexOpen}
        deck={deck}
        current={index}
        onJump={jumpTo}
        onClose={() => setIndexOpen(false)}
      />
    </View>
  );
}

/* ------------------------------------------------------------------------ */

/**
 * One card in the stack. `offset` is its resting depth: 0 front, 1 and 2
 * behind (fanned slightly), -1 the card sliding back in from the left. The
 * live depth d = offset − forwardProgress + backProgress, so cards glide
 * continuously between depths while the front card is dragged or animated.
 */
function Layer({
  offset,
  x,
  y,
  inX,
  h,
  W,
  width,
  children,
}: {
  offset: number;
  x: SharedValue<number>;
  y: SharedValue<number>;
  inX: SharedValue<number>;
  h: SharedValue<number>;
  W: number;
  width: number;
  children: React.ReactNode;
}) {
  const style = useAnimatedStyle(() => {
    if (offset === -1) {
      return { transform: [{ translateX: inX.value }, { rotate: `${(inX.value / W) * 3}deg` }], zIndex: 10 };
    }
    const p = Math.min(1, Math.max(Math.abs(x.value) / (W * 0.8), Math.abs(y.value) / (h.value * 0.6)));
    const back = interpolate(inX.value, [-W, 0], [0, 1], 'clamp');
    const d = Math.max(0, offset - p + back);
    const scale = 1 - 0.06 * d;
    const lift = -((1 - scale) * h.value) / 2 - 14 * d;
    // Fan: first card behind leans left, the next leans right.
    const fanX = d <= 1 ? -7 * d : -7 + 16 * (d - 1);
    const fanR = d <= 1 ? -2.2 * d : -2.2 + 5 * (d - 1);
    const drag = offset === 0 ? { tx: x.value, ty: y.value, r: (x.value / W) * 3 } : { tx: 0, ty: 0, r: 0 };
    return {
      zIndex: 5 - offset,
      opacity: d > 2.5 ? 0 : 1,
      transform: [
        { translateX: drag.tx + fanX },
        { translateY: drag.ty + lift },
        { scale },
        { rotate: `${drag.r + fanR}deg` },
      ],
    };
  });
  return <Animated.View style={[styles.layer, { width }, style]}>{children}</Animated.View>;
}

function pageLabel(card: DeckCard): string {
  const base = card.eyebrow ?? SECTION_LABEL[card.section];
  return card.pages && card.pages > 1 && !/of \d+$/.test(base) ? `${base} · ${card.page} of ${card.pages}` : base;
}

/** Animated accent underline that draws in — marks the first card of a new answer section. */
function NewMark({ on }: { on: boolean }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = 0;
    if (on) w.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [on, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  if (!on) return null;
  return (
    <View style={styles.newMarkTrack}>
      <Animated.View style={[styles.newMarkBar, style]} />
    </View>
  );
}

function CardView({ card, question, runKey, fresh }: { card: DeckCard; question: Question; runKey: number; fresh?: boolean }) {
  const front = runKey >= 0;
  const newSection = !!fresh && front;
  switch (card.kind) {
    case 'question':
      return (
        <View style={[styles.cardBase, styles.cardPad]}>
          <View style={styles.rowWrap}>
            <Tag label={question.categories[0] ?? ''} tone="accent" />
            {question.domain_tags[0] ? <Tag label={question.domain_tags[0]} /> : null}
          </View>
          <View style={[styles.grow, { justifyContent: 'center' }]}>
            <Text style={styles.questionText}>{question.title}</Text>
          </View>
          <View style={styles.questionFooter}>
            <View>
              <DifficultyBadge difficulty={question.difficulty} />
              <Text style={styles.hint}>Think out loud, then reveal.</Text>
            </View>
            <TimerRing seconds={THINK_SECONDS} size={60} strokeWidth={5} runKey={runKey} />
          </View>
        </View>
      );

    case 'prompt':
      return (
        <View style={[styles.cardBase, styles.cardPad, styles.cardPrompt]}>
          <View style={styles.promptTop}>
            <Eyebrow style={{ color: colors.accent }}>Think first</Eyebrow>
            <TimerRing seconds={card.seconds} size={44} strokeWidth={4} runKey={runKey} />
          </View>
          <View style={[styles.grow, { justifyContent: 'center', gap: space.lg }]}>
            <Text style={styles.promptTitle}>{card.title}</Text>
            {card.body ? <Text style={styles.promptBody}>{card.body}</Text> : null}
            {card.hints ? (
              <View style={styles.rowWrap}>
                {card.hints.map((h) => (
                  <View key={h} style={styles.hintChip}>
                    <Text style={styles.hintChipText}>{h}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
          <Text style={styles.hint}>Say it out loud, then tap Show me.</Text>
        </View>
      );

    case 'callout':
      return (
        <View style={[styles.cardBase, styles.cardPad, styles.cardAccent, shadow.accent, { justifyContent: 'center' }]}>
          <Eyebrow style={{ color: colors.onAccentMuted }}>{card.label}</Eyebrow>
          <Text style={[styles.title, styles.onAccent]}>{card.title}</Text>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.bodyLg, styles.onAccent]}>{card.body}</Text>
          </ScrollView>
        </View>
      );

    case 'list': {
      const fw = card.section === 'Framework' ? frameworkForQuestion(question.id) : undefined;
      return (
        <View style={[styles.cardBase, styles.cardPad, styles.topAlign]}>
          <Eyebrow>{pageLabel(card)}</Eyebrow>
          <Text style={styles.title}>{card.title}</Text>
          <NewMark on={newSection} />
          {fw ? (
            <Link href={`/frameworks/${fw.key}`} asChild>
              <Pressable style={styles.fwLink}>
                <Text style={styles.fwLinkText}>{fw.emoji} Learn this framework</Text>
                <MaterialIcons name="arrow-forward" size={16} color={colors.accent} />
              </Pressable>
            </Link>
          ) : null}
          <ScrollView style={styles.grow} contentContainerStyle={[styles.centerBody, { gap: space.md }]} showsVerticalScrollIndicator={false}>
            {card.items.map((item, i) => (
              <View key={i} style={styles.item}>
                {card.numbered ? (
                  <View style={styles.numBadge}>
                    <Text style={styles.numText}>{i + 1}</Text>
                  </View>
                ) : (
                  <View style={styles.bullet} />
                )}
                <Text style={styles.body}>{item}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      );
    }

    case 'pills':
      return <PillsCard card={card} front={front} newSection={newSection} />;

    case 'groups':
      return <GroupsCard card={card} front={front} newSection={newSection} />;

    case 'rows':
      return <RowsCard card={card} front={front} newSection={newSection} />;

    case 'compare':
      return <CompareCard card={card} front={front} newSection={newSection} />;

    case 'text': {
      // Text-only cards (a paragraph, no pills) are the punchlines — always blue.
      const hero = !card.mono;
      return (
        <View style={[styles.cardBase, styles.cardPad, hero && styles.cardAccent, hero && shadow.accent]}>
          <Eyebrow style={hero ? { color: colors.onAccentMuted } : undefined}>{pageLabel(card)}</Eyebrow>
          <Text style={[styles.title, hero && styles.onAccent]}>{card.title}</Text>
          {hero ? null : <NewMark on={newSection} />}
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.body, hero && styles.bodyLg, hero && styles.onAccent, card.mono && styles.mono]}>{card.body}</Text>
          </ScrollView>
        </View>
      );
    }

    case 'done':
      return (
        <View style={[styles.cardBase, styles.cardPad, styles.center]}>
          <View style={styles.doneIcon}>
            <MaterialIcons name="check" size={40} color={colors.onAccent} />
          </View>
          <Text style={[styles.title, styles.centerText, { marginTop: space.xl }]}>Nice work</Text>
          <Text style={[styles.promptBody, styles.centerText]}>
            You walked the whole answer. Say it out loud once more before you finish.
          </Text>
        </View>
      );
  }
}

/**
 * Selectable pills. When `auto` is on, the selected pill fills up over five
 * seconds and then hands over to the next one (or calls onEnd after the last).
 */
function PillRow({
  pills,
  open,
  onSelect,
  auto,
  onEnd,
  inverted,
}: {
  pills: Pill[];
  open: number | null;
  onSelect: (i: number) => void;
  auto?: boolean;
  onEnd?: () => void;
  /** On a blue card: white pills, selected = solid white with blue text. */
  inverted?: boolean;
}) {
  const fill = useSharedValue(0);
  const [paused, setPaused] = useState(false);
  const advance = useCallback(() => {
    if (open == null) return;
    if (open < pills.length - 1) onSelect(open + 1);
    else onEnd?.();
  }, [open, pills.length, onSelect, onEnd]);

  useEffect(() => {
    cancelAnimation(fill);
    fill.value = 0;
    if (!auto || paused || open == null) return;
    fill.value = withTiming(1, { duration: PILL_DWELL_MS, easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(advance)();
    });
    return () => cancelAnimation(fill);
  }, [auto, paused, open, fill, advance]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <View style={styles.rowWrap}>
      {pills.map((p, i) => {
        const on = open === i;
        return (
          <Pressable
            key={i}
            onPress={() => {
              setPaused(true); // a tap means the reader is driving — stop auto-advance
              onSelect(i);
            }}
            style={[styles.pill, inverted && styles.pillInv, on && (inverted ? styles.pillInvOn : styles.pillOn)]}
          >
            {on && auto && !paused ? <Animated.View style={[styles.pillFill, inverted && { backgroundColor: 'rgba(31,94,255,0.18)' }, fillStyle]} /> : null}
            <Text style={[styles.pillText, inverted && styles.onAccent, on && (inverted ? { color: colors.accent } : styles.pillTextOn)]} numberOfLines={1}>{p.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Detail on top, pills docked at the bottom; first pill selected by default. */
function PillsCard({ card, front, newSection }: { card: Extract<DeckCard, { kind: 'pills' }>; front: boolean; newSection: boolean }) {
  const [open, setOpen] = useState(0);
  const sel = card.items[open] ?? card.items[0];
  return (
    <View style={[styles.cardBase, styles.cardPad]}>
      <Eyebrow>{pageLabel(card)}</Eyebrow>
      <Text style={styles.title}>{card.title}</Text>
      <NewMark on={newSection} />
      {card.intro ? <Text style={styles.intro}>{card.intro}</Text> : null}
      <ScrollView style={styles.grow} contentContainerStyle={styles.detailArea} showsVerticalScrollIndicator={false}>
        {sel?.detail && !sel.detail.toLowerCase().startsWith(sel.label.toLowerCase()) ? (
          <Text style={styles.detailLabel}>{sel.label}</Text>
        ) : null}
        <Text style={styles.detailBig}>{sel?.detail ?? sel?.label}</Text>
      </ScrollView>
      <PillRow pills={card.items} open={open} onSelect={setOpen} auto={front} />
    </View>
  );
}

/** low / medium / high → 0 / 1 / 2 (undefined if not a level). */
function level(v: string): 0 | 1 | 2 | undefined {
  const t = v.toLowerCase();
  if (/\b(very high|high|large|big|strong)\b/.test(t)) return 2;
  if (/\b(medium|med|mid|moderate)\b/.test(t)) return 1;
  if (/\b(low|small|light|minimal|easy)\b/.test(t)) return 0;
  return undefined;
}
/** Effort-like axes are "lower is better". */
const INVERSE = /effort|cost|risk|complexity|time|lift/i;
function chipTone(key: string, val: string): { bg: string; fg: string; icon?: 'arrow-upward' | 'arrow-downward' | 'remove' } {
  const l = level(val);
  if (l === undefined) return { bg: colors.accentSoft, fg: colors.accent };
  const good = INVERSE.test(key) ? l === 0 : l === 2;
  const bad = INVERSE.test(key) ? l === 2 : l === 0;
  const icon = l === 2 ? 'arrow-upward' : l === 0 ? 'arrow-downward' : 'remove';
  if (good) return { bg: '#E8F7EE', fg: colors.success, icon };
  if (bad) return { bg: '#FDECEC', fg: colors.danger, icon };
  return { bg: '#FFF4DE', fg: colors.warning, icon };
}

/** 2×2 impact-vs-effort grid with a pulsing dot for the selected row. */
function Matrix({ impact, effort }: { impact: 0 | 1 | 2; effort: 0 | 1 | 2 }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.35, { duration: 600 }), withTiming(1, { duration: 600 })), -1, false);
    return () => cancelAnimation(pulse);
  }, [pulse]);
  const dot = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const SIZE = 120;
  const x = 12 + (effort / 2) * (SIZE - 24);
  const y = 12 + ((2 - impact) / 2) * (SIZE - 24);
  const sweet = impact === 2 && effort === 0;
  return (
    <View style={styles.matrixWrap}>
      <Text style={styles.axisY}>Impact ↑</Text>
      <View>
        <View style={[styles.matrix, { width: SIZE, height: SIZE }]}>
          <View style={[styles.quad, styles.quadSweet, { top: 0, left: 0 }]} />
          <View style={[styles.quad, { top: 0, right: 0 }]} />
          <View style={[styles.quad, { bottom: 0, left: 0 }]} />
          <View style={[styles.quad, { bottom: 0, right: 0 }]} />
          <Animated.View style={[styles.matrixDot, { left: x - 7, top: y - 7, backgroundColor: sweet ? colors.success : colors.accent }, dot]} />
        </View>
        <Text style={styles.axisX}>Effort →</Text>
      </View>
      <Text style={styles.matrixNote}>{sweet ? 'High impact, low effort — do this first.' : impact === 2 ? 'High impact — worth the effort.' : effort === 0 ? 'Cheap, but not the lever.' : 'Park it.'}</Text>
    </View>
  );
}

/** Table rows as pills: numbered pills, semantic chips, and an impact/effort grid when the table has both. */
function RowsCard({ card, front, newSection }: { card: Extract<DeckCard, { kind: 'rows' }>; front: boolean; newSection: boolean }) {
  const [open, setOpen] = useState(0);
  const r = card.items[open] ?? card.items[0];
  const n = card.startIndex + open + 1;
  const imp = r.meta.find(([k]) => /impact|value/i.test(k));
  const eff = r.meta.find(([k]) => /effort|cost/i.test(k));
  const li = imp ? level(imp[1]) : undefined;
  const le = eff ? level(eff[1]) : undefined;
  return (
    <View style={[styles.cardBase, styles.cardPad]}>
      <Eyebrow>{pageLabel(card)}</Eyebrow>
      <Text style={styles.title}>
        {card.title}
        {card.pages && card.pages > 1 ? <Text style={styles.titlePart}>  · part {card.page}</Text> : null}
      </Text>
      <NewMark on={newSection} />
      <ScrollView style={styles.grow} contentContainerStyle={styles.detailArea} showsVerticalScrollIndicator={false}>
        {r.kind ? <Text style={styles.groupLabel}>{r.kind}</Text> : null}
        <Text style={styles.detailBig}>{r.text[0] ?? r.label}</Text>
        {r.meta.length ? (
          <View style={[styles.rowWrap, { marginTop: space.xs }]}>
            {r.meta.map(([k, v]) => {
              const tone = chipTone(k, v);
              return (
                <View key={k} style={[styles.chip, { backgroundColor: tone.bg }]}>
                  <Text style={styles.chipKey}>{k}</Text>
                  <Text style={[styles.chipVal, { color: tone.fg }]}>{v}</Text>
                  {tone.icon ? <MaterialIcons name={tone.icon} size={14} color={tone.fg} /> : null}
                </View>
              );
            })}
          </View>
        ) : null}
        {li !== undefined && le !== undefined ? <Matrix impact={li} effort={le} /> : null}
        {r.text.slice(1).map((t, i) => (
          <Text key={i} style={styles.detailSub}>{t}</Text>
        ))}
      </ScrollView>
      <Text style={styles.pillCaption}>
        <Text style={{ color: colors.accent }}>#{n}</Text> · {r.label}
      </Text>
      <PillRow pills={card.items.map((_, i) => ({ label: `#${card.startIndex + i + 1}` }))} open={open} onSelect={setOpen} auto={front} />
    </View>
  );
}

/** Strong vs generic pairs, one pair at a time. */
function CompareCard({ card, front, newSection }: { card: Extract<DeckCard, { kind: 'compare' }>; front: boolean; newSection: boolean }) {
  const [open, setOpen] = useState(0);
  const r = card.rows[open] ?? card.rows[0];
  return (
    <View style={[styles.cardBase, styles.cardPad]}>
      <Eyebrow>{pageLabel(card)}</Eyebrow>
      <Text style={styles.title}>{card.title}</Text>
      <NewMark on={newSection} />
      <ScrollView style={styles.grow} contentContainerStyle={[styles.detailArea, { gap: space.md }]} showsVerticalScrollIndicator={false}>
        {r.strong ? (
          <View style={[styles.block, { backgroundColor: '#E8F7EE' }]}>
            <View style={styles.compareHead}>
              <MaterialIcons name="check-circle" size={16} color={colors.success} />
              <Text style={[styles.compareLabel, { color: colors.success }]}>Strong</Text>
            </View>
            <Text style={styles.blockBodyDark}>{r.strong}</Text>
          </View>
        ) : null}
        {r.generic ? (
          <View style={styles.block}>
            <View style={styles.compareHead}>
              <MaterialIcons name="remove-circle-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.compareLabel, { color: colors.textMuted }]}>Generic</Text>
            </View>
            <Text style={styles.blockBody}>{r.generic}</Text>
          </View>
        ) : null}
      </ScrollView>
      {card.rows.length > 1 ? (
        <PillRow pills={card.rows.map((_, i) => ({ label: `${i + 1}` }))} open={open} onSelect={setOpen} auto={front} />
      ) : null}
    </View>
  );
}

/** Groups: plain bullets when items have no detail; otherwise grouped pills docked at the bottom. */
function GroupsCard({ card, front, newSection }: { card: Extract<DeckCard, { kind: 'groups' }>; front: boolean; newSection: boolean }) {
  const [sel, setSel] = useState<[number, number]>([0, 0]);
  const rich = card.groups.some((g) => g.items.some((p) => p.detail));

  if (!rich) {
    return (
      <View style={[styles.cardBase, styles.cardPad, styles.topAlign]}>
        <Eyebrow>{pageLabel(card)}</Eyebrow>
        <Text style={styles.title}>{card.title}</Text>
        <NewMark on={newSection} />
        <ScrollView style={styles.grow} contentContainerStyle={[styles.centerBody, { gap: space.lg }]} showsVerticalScrollIndicator={false}>
          {card.groups.map((g, gi) => (
            <View key={gi} style={{ gap: space.sm }}>
              <Text style={styles.groupLabel}>{g.label}</Text>
              {g.items.map((p, i) => (
                <View key={i} style={styles.item}>
                  <View style={styles.bullet} />
                  <Text style={styles.body}>{p.label}</Text>
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  const g = card.groups[sel[0]] ?? card.groups[0];
  const p = g.items[sel[1]] ?? g.items[0];
  return (
    <View style={[styles.cardBase, styles.cardPad]}>
      <Eyebrow>{pageLabel(card)}</Eyebrow>
      <Text style={styles.title}>{card.title}</Text>
      <NewMark on={newSection} />
      <ScrollView style={styles.grow} contentContainerStyle={styles.detailArea} showsVerticalScrollIndicator={false}>
        <Text style={styles.groupLabel}>{g.label}</Text>
        {p.detail && !p.detail.toLowerCase().startsWith(p.label.toLowerCase()) ? (
          <Text style={styles.detailLabel}>{p.label}</Text>
        ) : null}
        <Text style={styles.detailBig}>{p.detail ?? p.label}</Text>
      </ScrollView>
      <View style={{ gap: space.md }}>
        {card.groups.map((grp, gi) => (
          <View key={gi} style={{ gap: 6 }}>
            <Text style={styles.groupLabelSm}>{grp.label}</Text>
            <PillRow
              pills={grp.items}
              open={sel[0] === gi ? sel[1] : null}
              onSelect={(i) => setSel([gi, i])}
              auto={front}
              onEnd={() => (gi + 1 < card.groups.length ? setSel([gi + 1, 0]) : undefined)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
  centerText: { textAlign: 'center' },
  muted: { color: colors.textMuted, fontSize: 15 },
  grow: { flex: 1 },
  scroll: { flexGrow: 0, flexShrink: 1 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg },
  headerCenter: { alignItems: 'center', gap: 1 },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  headerCount: { color: colors.textFaint, fontSize: 11, fontWeight: '600' },

  progress: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4, paddingTop: space.md, paddingHorizontal: space.xl },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 18 },

  deck: { flex: 1, alignItems: 'center', marginTop: space.lg, marginBottom: space.sm },
  layer: { position: 'absolute', top: 32, bottom: 0 },
  cardBase: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.card, overflow: 'hidden', ...shadow.cardStrong },
  cardPad: { padding: 26, gap: space.md, justifyContent: 'center' },
  topAlign: { justifyContent: 'flex-start' },
  fwLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 },
  fwLinkText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  centerBody: { flexGrow: 1, justifyContent: 'center', paddingBottom: space.sm },
  titlePart: { color: colors.textFaint, fontSize: 16, fontWeight: '700' },
  punch: { backgroundColor: colors.accent, borderRadius: radius.lg, padding: space.lg, gap: space.sm, ...shadow.accent },
  pillCaption: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: -4 },
  matrixWrap: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.sm },
  matrix: { borderRadius: radius.md, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  quad: { position: 'absolute', width: '50%', height: '50%', borderColor: colors.surface, borderWidth: 1 },
  quadSweet: { backgroundColor: '#E8F7EE' },
  matrixDot: { position: 'absolute', width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: colors.surface },
  axisY: { color: colors.textFaint, fontSize: 11, fontWeight: '700', transform: [{ rotate: '-90deg' }], width: 64, textAlign: 'center', marginRight: -24, marginLeft: -24 },
  axisX: { color: colors.textFaint, fontSize: 11, fontWeight: '700', textAlign: 'right', marginTop: 4 },
  matrixNote: { flex: 1, color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  cardAccent: { backgroundColor: colors.accent },
  cardPrompt: { backgroundColor: colors.accentSoft },
  onAccent: { color: colors.onAccent },

  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  questionText: { color: colors.text, fontSize: 26, lineHeight: 34, fontWeight: '700', letterSpacing: -0.4 },
  questionFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  hint: { color: colors.textFaint, fontSize: 13, marginTop: 6 },
  intro: { color: colors.textMuted, fontSize: 14, lineHeight: 20, marginTop: -4 },

  promptTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  promptTitle: { color: colors.text, fontSize: 28, lineHeight: 36, fontWeight: '800', letterSpacing: -0.6 },
  promptBody: { color: colors.textMuted, fontSize: 17, lineHeight: 25 },
  hintChip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  hintChipText: { color: colors.accent, fontSize: 14, fontWeight: '700' },

  title: { color: colors.text, fontSize: 23, lineHeight: 30, fontWeight: '700', letterSpacing: -0.3, marginBottom: space.xs },
  body: { flex: 1, color: colors.text, fontSize: 16, lineHeight: 24 },
  bodyLg: { fontSize: 18, lineHeight: 28, fontWeight: '500' },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 14, lineHeight: 21 },

  item: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  numBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  numText: { color: colors.accent, fontSize: 12, fontWeight: '800' },
  bullet: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.accent, marginTop: 9, marginHorizontal: 6 },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  pillOn: { backgroundColor: colors.accent, overflow: 'hidden' },
  pillInv: { backgroundColor: 'rgba(255,255,255,0.18)' },
  pillInvOn: { backgroundColor: colors.onAccent, overflow: 'hidden' },
  pillFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.28)' },
  newMarkTrack: { height: 3, borderRadius: 2, backgroundColor: colors.accentSoft, marginTop: -4, marginBottom: 4, overflow: 'hidden' },
  newMarkBar: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
  pillText: { color: colors.text, fontSize: 14, fontWeight: '700', flexShrink: 1 },
  pillTextOn: { color: colors.onAccent },
  detailArea: { flexGrow: 1, justifyContent: 'center', gap: space.sm, paddingVertical: space.md },
  detailLabel: { color: colors.accent, fontSize: 13, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  detailSub: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  chipKey: { color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase' },
  chipVal: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  detailBig: { color: colors.text, fontSize: 20, lineHeight: 29, fontWeight: '600', letterSpacing: -0.2 },

  groupLabel: { color: colors.accent, fontSize: 13, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  groupLabelSm: { color: colors.textFaint, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },

  block: { backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: space.lg, gap: 6 },
  blockBody: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  blockBodyDark: { color: colors.text, fontSize: 15, lineHeight: 22 },

  compareHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  compareLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },

  doneIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', ...shadow.accent },

  menuBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingTop: space.sm },
});
