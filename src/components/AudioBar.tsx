import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import type { Narration } from '@/data/narration';
import { colors, radius, shadow, space } from '@/theme/tokens';

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.max(0, Math.floor(s % 60));
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export interface AudioBarHandle {
  /** Jump to a chapter's start; playback state is preserved, no echo announce. */
  seekToChapter: (chapterIndex: number) => void;
  /** Has the listener started this narration (playing, or paused mid-way)? */
  isActive: () => boolean;
  /** The chapter currently being narrated. */
  currentChapter: () => number;
}

/**
 * Chapter-scoped narration player. The scrubber covers ONLY the current
 * chapter (it resets card by card); the dot row underneath shows the whole
 * walkthrough — filled dots are done, the wide one is now, tap any to jump.
 * onChapterChange fires when the voice crosses into a new chapter so the
 * deck can turn its cards.
 */
export const AudioBar = forwardRef<AudioBarHandle, {
  narration: Narration;
  onChapterChange?: (chapterIndex: number, playing: boolean) => void;
}>(function AudioBar({ narration, onChapterChange }, ref) {
  const player = useAudioPlayer(narration.source);
  const status = useAudioPlayerStatus(player);
  const [trackW, setTrackW] = useState(1);
  const [scrub, setScrub] = useState<number | null>(null); // 0..1 within the chapter, while dragging
  const lastAnnounced = useRef(0);
  // iOS seeks are async: the player briefly reports the OLD position after
  // seekTo, which would re-announce the old chapter and yank the deck back.
  // Suppress announcements around every imperative seek.
  const suppressUntil = useRef(0);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);
  // Never let a narration outlive its screen.
  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch {}
    };
  }, [player]);

  const chapters = narration.chapters;
  // The registry duration is measured from PCM — trust it over container estimates.
  const duration = narration.duration || status.duration;
  const t = status.currentTime ?? 0;
  const ci = chapters.reduce((acc, c, i) => (t >= c.at ? i : acc), 0);
  const ciRef = useRef(ci);
  ciRef.current = ci;
  const chStart = chapters[ci].at;
  const chEnd = ci + 1 < chapters.length ? chapters[ci + 1].at : duration;
  const chDur = Math.max(0.1, chEnd - chStart);
  const chT = Math.max(0, Math.min(chDur, t - chStart));
  const progress = scrub ?? chT / chDur;
  const finished = duration > 0 && t >= duration - 0.3;

  // Announce chapter changes while playing (not mid-scrub, not mid-seek).
  useEffect(() => {
    if (scrub != null) return;
    if (ci !== lastAnnounced.current) {
      lastAnnounced.current = ci;
      if (Date.now() < suppressUntil.current) return; // settling after a seek
      onChapterChange?.(ci, !!status.playing);
    }
  }, [ci, status.playing, scrub, onChapterChange]);

  const goChapter = (i: number, announce: boolean) => {
    const clamped = Math.max(0, Math.min(chapters.length - 1, i));
    lastAnnounced.current = clamped;
    suppressUntil.current = Date.now() + 900;
    player.seekTo(chapters[clamped].at + 0.01);
    if (announce) onChapterChange?.(clamped, true); // dot taps turn the card immediately
  };

  useImperativeHandle(ref, () => ({
    seekToChapter: (i: number) => goChapter(i, false),
    isActive: () => !!status.playing || t > 0.5,
    currentChapter: () => ciRef.current,
  }));

  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (finished) goChapter(0, true);
      player.play();
    }
  };
  // ±5s inside the whole track — crossing a boundary announces and turns the card.
  const skip = (d: number) => {
    const dest = Math.max(0, Math.min(duration - 0.2, t + d));
    const destCi = chapters.reduce((acc, c, i) => (dest >= c.at ? i : acc), 0);
    suppressUntil.current = Date.now() + 900;
    if (destCi !== lastAnnounced.current) {
      lastAnnounced.current = destCi;
      onChapterChange?.(destCi, !!status.playing);
    }
    player.seekTo(dest);
  };

  // Scrubber: tap or drag, scoped to the current chapter.
  const onTrackLayout = (e: LayoutChangeEvent) => setTrackW(Math.max(1, e.nativeEvent.layout.width));
  const commitScrub = (ratio: number) => {
    const clamped = Math.max(0, Math.min(1, ratio));
    setScrub(null);
    suppressUntil.current = Date.now() + 900;
    player.seekTo(chStart + clamped * chDur);
  };
  const pan = Gesture.Pan()
    .activeOffsetX([-4, 4])
    .onUpdate((e) => {
      setScrub(Math.max(0, Math.min(1, e.x / trackW)));
    })
    .onEnd((e) => {
      commitScrub(e.x / trackW);
    })
    .runOnJS(true);
  const tap = Gesture.Tap()
    .onEnd((e) => {
      commitScrub(e.x / trackW);
    })
    .runOnJS(true);

  const shownT = scrub != null ? scrub * chDur : chT;

  return (
    <View style={styles.bar}>
      <Pressable onPress={() => skip(-5)} hitSlop={8} style={styles.skip}>
        <MaterialIcons name="replay-5" size={22} color={colors.text} />
      </Pressable>
      <Pressable onPress={toggle} hitSlop={8} style={styles.play}>
        <MaterialIcons name={status.playing ? 'pause' : 'play-arrow'} size={24} color={colors.onAccent} />
      </Pressable>
      <Pressable onPress={() => skip(5)} hitSlop={8} style={styles.skip}>
        <MaterialIcons name="forward-5" size={22} color={colors.text} />
      </Pressable>
      <View style={styles.middle}>
        <View style={styles.metaRow}>
          <Text style={styles.chapter} numberOfLines={1}>
            {status.playing || t > 0 ? chapters[ci]?.label : 'Listen to the walkthrough'}
          </Text>
          <Text style={styles.time}>
            {fmt(shownT)} / {fmt(chDur)}
          </Text>
        </View>
        <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
          <View style={styles.trackHit} onLayout={onTrackLayout}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress * 100}%` }]} />
            </View>
            <View style={[styles.thumb, { left: `${progress * 100}%` }]} />
          </View>
        </GestureDetector>
        {/* The whole walkthrough: one dot per chapter, tap to jump. */}
        <View style={styles.dots}>
          {chapters.map((c, i) => (
            <Pressable
              key={c.at}
              onPress={() => goChapter(i, true)}
              hitSlop={{ top: 8, bottom: 8, left: 2, right: 2 }}
              style={[styles.dot, i < ci && styles.dotDone, i === ci && styles.dotNow]}
            />
          ))}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.lg,
    marginBottom: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 8,
    paddingHorizontal: space.md,
    ...shadow.card,
  },
  skip: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  play: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  middle: { flex: 1, gap: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.sm },
  chapter: { flex: 1, color: colors.text, fontSize: 12, fontWeight: '700' },
  time: { color: colors.textFaint, fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },
  trackHit: { height: 18, justifyContent: 'center', marginRight: 6 },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
  thumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
    marginLeft: -6,
    borderWidth: 2,
    borderColor: colors.surface,
    ...shadow.card,
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.surfaceAlt },
  dotDone: { backgroundColor: colors.accent, opacity: 0.35 },
  dotNow: { backgroundColor: colors.accent },
});
