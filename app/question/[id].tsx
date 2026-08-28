import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { questions } from '@/data';
import type { Question } from '@/types/question';
import { useProgress } from '@/state/useProgress';
import { buildDeck, SECTION_LABEL, type DeckCard, type Pill, type Section } from '@/drill/deck';
import { TimerRing } from '@/components/TimerRing';
import { IndexSheet } from '@/components/IndexSheet';
import { DifficultyBadge, Eyebrow, IconButton, PillButton, Tag } from '@/components/ui';
import { colors, radius, shadow, space } from '@/theme/tokens';

const THINK_SECONDS = 30;
const MOVE = { duration: 380, easing: Easing.inOut(Easing.cubic) };
const FAST = { duration: 240, easing: Easing.out(Easing.cubic) };

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
  const [jumpTarget, setJumpTarget] = useState<number | null>(null);
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
  const settle = useCallback(
    (next: number) => {
      setIndex(next);
      setIncoming(null);
      setJumpTarget(null);
      setBusy(false);
      x.value = 0;
      y.value = 0;
      inX.value = -W;
    },
    [x, y, inX, W],
  );

  const goNext = useCallback(
    (axis: 'x' | 'y' = 'x') => {
      if (busy || index + 1 >= total) return;
      setBusy(true);
      const done = (finished?: boolean) => {
        'worklet';
        if (finished) runOnJS(settle)(index + 1);
      };
      if (axis === 'y') y.value = withTiming(-h.value * 1.1, MOVE, done);
      else x.value = withTiming(-W * 1.05, MOVE, done);
    },
    [busy, index, total, W, x, y, h, settle],
  );

  const goPrev = useCallback(() => {
    if (busy || index === 0) return;
    setBusy(true);
    setIncoming(index - 1);
    inX.value = -W * 1.05;
    inX.value = withTiming(0, MOVE, (finished) => {
      if (finished) runOnJS(settle)(index - 1);
    });
  }, [busy, index, W, inX, settle]);

  const go = useCallback((dir: 1 | -1) => (dir === 1 ? goNext() : goPrev()), [goNext, goPrev]);

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
        else if (e.translationX > 70 || e.velocityX > 600) runOnJS(goPrev)();
        else x.value = withTiming(0, MOVE);
      } else {
        if (e.translationY < -90 || e.velocityY < -700) runOnJS(goNext)('y');
        else if (e.translationY > 90 || e.velocityY > 700) runOnJS(goPrev)();
        else y.value = withTiming(0, MOVE);
      }
    });

  // Progress of the forward move (0 → 1) drives the stack behind.
  const frontStyle = useAnimatedStyle(() => {
    const back = interpolate(inX.value, [-W, 0], [0, 1], 'clamp'); // going back
    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { rotate: `${(x.value / W) * 3}deg` },
        { scale: interpolate(back, [0, 1], [1, 0.94]) },
        { translateY: interpolate(back, [0, 1], [0, lift(0.94, 14)]) },
      ],
    };
  });
  const progress = () => {
    'worklet';
    return Math.min(1, Math.max(Math.abs(x.value) / (W * 0.8), Math.abs(y.value) / (h.value * 0.6)));
  };
  const ghost1Style = useAnimatedStyle(() => {
    const p = progress();
    const back = interpolate(inX.value, [-W, 0], [0, 1], 'clamp');
    const scale = interpolate(p, [0, 1], [0.94, 1]) - back * 0.06;
    return {
      transform: [
        { scale },
        { translateY: interpolate(p, [0, 1], [lift(0.94, 14), 0]) + back * (lift(0.88, 28) - lift(0.94, 14)) },
      ],
    };
  });
  const ghost2Style = useAnimatedStyle(() => {
    const p = progress();
    return {
      transform: [
        { scale: interpolate(p, [0, 1], [0.88, 0.94]) },
        { translateY: interpolate(p, [0, 1], [lift(0.88, 28), lift(0.94, 14)]) },
      ],
    };
  });
  const incomingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: inX.value }, { rotate: `${(inX.value / W) * 3}deg` }],
  }));

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
        goPrev();
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
  // Jump from the index: a quick version of the same stack move, forward or back.
  const jumpTo = (i: number) => {
    setIndexOpen(false);
    if (busy || i === index) return;
    setBusy(true);
    if (i > index) {
      setJumpTarget(i);
      x.value = withTiming(-W * 1.05, FAST, (finished) => {
        if (finished) runOnJS(settle)(i);
      });
    } else {
      setIncoming(i);
      inX.value = -W * 1.05;
      inX.value = withTiming(0, FAST, (finished) => {
        if (finished) runOnJS(settle)(i);
      });
    }
  };

  if (!question || !card) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.muted}>Loading…</Text>
      </View>
    );
  }

  const isFirst = index === 0;
  const ahead = jumpTarget != null ? deck.slice(jumpTarget, jumpTarget + 2) : deck.slice(index + 1, index + 3);
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

      {/* Deck */}
      <View style={styles.deck} onLayout={(e) => { h.value = e.nativeEvent.layout.height - 32; }}>
        {ahead[1] ? (
          <Animated.View style={[styles.layer, { width: cardW }, ghost2Style]} pointerEvents="none">
            <CardView card={ahead[1]} question={question} runKey={-1} />
          </Animated.View>
        ) : null}
        {ahead[0] ? (
          <Animated.View style={[styles.layer, { width: cardW }, ghost1Style]} pointerEvents="none">
            <CardView card={ahead[0]} question={question} runKey={-1} />
          </Animated.View>
        ) : null}
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.layer, { width: cardW }, frontStyle]}>
            <CardView card={card} question={question} runKey={index} />
          </Animated.View>
        </GestureDetector>
        {incoming != null ? (
          <Animated.View style={[styles.layer, { width: cardW }, incomingStyle]} pointerEvents="none">
            <CardView card={deck[incoming]} question={question} runKey={-1} />
          </Animated.View>
        ) : null}
      </View>

      {/* Floating index button */}
      <View style={styles.fabWrap} pointerEvents="box-none">
        <IconButton icon="format-list-bulleted" onPress={() => setIndexOpen(true)} size={48} />
      </View>

      {/* Footer controls */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space.lg) }]}>
        {card.kind === 'done' ? (
          <>
            <PillButton label="Restart" tone="ghost" icon="refresh" onPress={restart} style={{ flex: 1 }} />
            <PillButton label="Finish" icon="check" onPress={finish} style={{ flex: 1.4 }} />
          </>
        ) : (
          <>
            <IconButton icon="arrow-back" onPress={() => go(-1)} style={{ opacity: isFirst ? 0.35 : 1 }} size={56} />
            <PillButton label={cta} icon="arrow-forward" onPress={() => go(1)} style={{ flex: 1 }} />
          </>
        )}
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

function pageLabel(card: DeckCard): string {
  const base = card.eyebrow ?? SECTION_LABEL[card.section];
  return card.pages && card.pages > 1 && !/of \d+$/.test(base) ? `${base} · ${card.page} of ${card.pages}` : base;
}

function CardView({ card, question, runKey }: { card: DeckCard; question: Question; runKey: number }) {
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

    case 'list':
      return (
        <View style={[styles.cardBase, styles.cardPad]}>
          <Eyebrow>{pageLabel(card)}</Eyebrow>
          <Text style={styles.title}>{card.title}</Text>
          <ScrollView style={styles.scroll} contentContainerStyle={{ gap: space.md, paddingBottom: space.sm }} showsVerticalScrollIndicator={false}>
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

    case 'pills':
      return <PillsCard card={card} />;

    case 'groups':
      return <GroupsCard card={card} />;

    case 'rows':
      return <RowsCard card={card} />;

    case 'compare':
      return <CompareCard card={card} />;

    case 'text':
      return (
        <View style={[styles.cardBase, styles.cardPad]}>
          <Eyebrow>{pageLabel(card)}</Eyebrow>
          <Text style={styles.title}>{card.title}</Text>
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.body, card.mono && styles.mono]}>{card.body}</Text>
          </ScrollView>
        </View>
      );

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

/** Selectable pills; the selected one is filled. */
function PillRow({ pills, open, onSelect }: { pills: Pill[]; open: number | null; onSelect: (i: number) => void }) {
  return (
    <View style={styles.rowWrap}>
      {pills.map((p, i) => {
        const on = open === i;
        return (
          <Pressable key={i} onPress={() => onSelect(i)} style={[styles.pill, pills.length > 1 && styles.pillHalf, on && styles.pillOn]}>
            <Text style={[styles.pillText, pills.length > 1 && styles.pillTextHalf, on && styles.pillTextOn]} numberOfLines={2}>{p.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Detail on top, pills docked at the bottom; first pill selected by default. */
function PillsCard({ card }: { card: Extract<DeckCard, { kind: 'pills' }> }) {
  const [open, setOpen] = useState(0);
  const sel = card.items[open] ?? card.items[0];
  return (
    <View style={[styles.cardBase, styles.cardPad]}>
      <Eyebrow>{pageLabel(card)}</Eyebrow>
      <Text style={styles.title}>{card.title}</Text>
      {card.intro ? <Text style={styles.intro}>{card.intro}</Text> : null}
      <ScrollView style={styles.grow} contentContainerStyle={styles.detailArea} showsVerticalScrollIndicator={false}>
        {sel?.detail && !sel.detail.toLowerCase().startsWith(sel.label.toLowerCase()) ? (
          <Text style={styles.detailLabel}>{sel.label}</Text>
        ) : null}
        <Text style={styles.detailBig}>{sel?.detail ?? sel?.label}</Text>
      </ScrollView>
      <PillRow pills={card.items} open={open} onSelect={setOpen} />
    </View>
  );
}

/** Table rows as pills: chips for short cells, body for long ones. */
function RowsCard({ card }: { card: Extract<DeckCard, { kind: 'rows' }> }) {
  const [open, setOpen] = useState(0);
  const r = card.items[open] ?? card.items[0];
  return (
    <View style={[styles.cardBase, styles.cardPad]}>
      <Eyebrow>{pageLabel(card)}</Eyebrow>
      <Text style={styles.title}>{card.title}</Text>
      <ScrollView style={styles.grow} contentContainerStyle={styles.detailArea} showsVerticalScrollIndicator={false}>
        {r.kind ? <Text style={styles.groupLabel}>{r.kind}</Text> : null}
        <Text style={styles.detailBig}>{r.text[0] ?? r.label}</Text>
        {r.meta.length ? (
          <View style={[styles.rowWrap, { marginTop: space.xs }]}>
            {r.meta.map(([k, v]) => (
              <View key={k} style={styles.chip}>
                <Text style={styles.chipKey}>{k}</Text>
                <Text style={styles.chipVal}>{v}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {r.text.slice(1).map((t, i) => (
          <Text key={i} style={styles.detailSub}>{t}</Text>
        ))}
      </ScrollView>
      <PillRow pills={card.items.map((i) => ({ label: i.label }))} open={open} onSelect={setOpen} />
    </View>
  );
}

/** Strong vs generic pairs, one pair at a time. */
function CompareCard({ card }: { card: Extract<DeckCard, { kind: 'compare' }> }) {
  const [open, setOpen] = useState(0);
  const r = card.rows[open] ?? card.rows[0];
  return (
    <View style={[styles.cardBase, styles.cardPad]}>
      <Eyebrow>{pageLabel(card)}</Eyebrow>
      <Text style={styles.title}>{card.title}</Text>
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
        <PillRow pills={card.rows.map((_, i) => ({ label: `${i + 1}` }))} open={open} onSelect={setOpen} />
      ) : null}
    </View>
  );
}

/** Groups: plain bullets when items have no detail; otherwise grouped pills docked at the bottom. */
function GroupsCard({ card }: { card: Extract<DeckCard, { kind: 'groups' }> }) {
  const [sel, setSel] = useState<[number, number]>([0, 0]);
  const rich = card.groups.some((g) => g.items.some((p) => p.detail));

  if (!rich) {
    return (
      <View style={[styles.cardBase, styles.cardPad]}>
        <Eyebrow>{pageLabel(card)}</Eyebrow>
        <Text style={styles.title}>{card.title}</Text>
        <ScrollView style={styles.scroll} contentContainerStyle={{ gap: space.lg, paddingBottom: space.sm }} showsVerticalScrollIndicator={false}>
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
            <PillRow pills={grp.items} open={sel[0] === gi ? sel[1] : null} onSelect={(i) => setSel([gi, i])} />
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
  pillHalf: { width: '48%', flexGrow: 1, justifyContent: 'center' },
  pillOn: { backgroundColor: colors.accent },
  pillText: { color: colors.text, fontSize: 14, fontWeight: '700', flexShrink: 1 },
  pillTextHalf: { fontSize: 13, lineHeight: 17, textAlign: 'center' },
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

  fabWrap: { alignItems: 'flex-end', paddingHorizontal: space.lg, marginTop: -8, marginBottom: 4 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingTop: space.sm },
});
