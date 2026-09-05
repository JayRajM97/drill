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
  /** Seek to a position (seconds); playback state is preserved. */
  seekTo: (seconds: number) => void;
  /** Has the listener started this narration (playing, or paused mid-way)? */
  isActive: () => boolean;
  isPlaying: () => boolean;
}

/**
 * Narration player: play/pause, ±5s, a draggable scrubber and the chapter
 * currently being explained. Fires onChapterChange as the voice crosses into
 * a new chapter so the deck can follow along.
 */
export const AudioBar = forwardRef<AudioBarHandle, {
  narration: Narration;
  onChapterChange?: (chapterIndex: number, playing: boolean) => void;
}>(function AudioBar({ narration, onChapterChange }, ref) {
  const player = useAudioPlayer(narration.source);
  const status = useAudioPlayerStatus(player);
  const [trackW, setTrackW] = useState(1);
  const [scrub, setScrub] = useState<number | null>(null); // 0..1 while dragging
  const lastChapter = useRef(-1);

  useEffect(() => {
    // Play even when the iPhone's ring/silent switch is on silent.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const duration = status.duration || narration.duration;
  const t = status.currentTime ?? 0;
  const progress = scrub ?? (duration > 0 ? Math.min(1, t / duration) : 0);
  const chapterIndex = narration.chapters.reduce((acc, c, i) => (t >= c.at ? i : acc), 0);
  const chapter = narration.chapters[chapterIndex];
  const finished = duration > 0 && t >= duration - 0.3;

  // Announce chapter changes while playing (not while the user is scrubbing).
  useEffect(() => {
    if (scrub != null) return;
    if (chapterIndex !== lastChapter.current) {
      lastChapter.current = chapterIndex;
      onChapterChange?.(chapterIndex, !!status.playing);
    }
  }, [chapterIndex, status.playing, scrub, onChapterChange]);

  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      lastChapter.current = narration.chapters.reduce((acc, c, i) => (seconds >= c.at ? i : acc), 0);
      player.seekTo(Math.max(0, Math.min(duration, seconds)));
    },
    isActive: () => !!status.playing || t > 0.5,
    isPlaying: () => !!status.playing,
  }));

  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (finished) player.seekTo(0);
      player.play();
    }
  };
  const skip = (d: number) => player.seekTo(Math.max(0, Math.min(duration, t + d)));

  // Scrubber: tap or drag anywhere on the track.
  const onTrackLayout = (e: LayoutChangeEvent) => setTrackW(Math.max(1, e.nativeEvent.layout.width));
  const commitScrub = (ratio: number) => {
    const clamped = Math.max(0, Math.min(1, ratio));
    setScrub(null);
    lastChapter.current = -2; // re-announce the chapter we land in
    player.seekTo(clamped * duration);
  };
  const pan = Gesture.Pan()
    .activeOffsetX([-4, 4])
    .onBegin((e) => {
      'worklet';
    })
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

  const scrubT = scrub != null ? scrub * duration : t;

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
            {status.playing || t > 0 ? chapter?.label : 'Listen to the walkthrough'}
          </Text>
          <Text style={styles.time}>
            {fmt(scrubT)} / {fmt(duration)}
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
    borderRadius: radius.pill,
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
  trackHit: { height: 22, justifyContent: 'center', marginRight: 6 },
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
});
