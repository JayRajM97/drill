import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import type { Narration } from '@/data/narration';
import { colors, radius, shadow, space } from '@/theme/tokens';

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.max(0, Math.floor(s % 60));
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/**
 * Narration player: play/pause, ±5s, a progress bar and the chapter currently
 * being explained. One warm voice walks the whole answer.
 */
export function AudioBar({ narration }: { narration: Narration }) {
  const player = useAudioPlayer(narration.source);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    // Play even when the iPhone's ring/silent switch is on silent.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const duration = status.duration || narration.duration;
  const t = status.currentTime ?? 0;
  const progress = duration > 0 ? Math.min(1, t / duration) : 0;
  const chapter = [...narration.chapters].reverse().find((c) => t >= c.at) ?? narration.chapters[0];
  const finished = duration > 0 && t >= duration - 0.3;

  const toggle = () => {
    if (status.playing) player.pause();
    else {
      if (finished) player.seekTo(0);
      player.play();
    }
  };
  const skip = (d: number) => player.seekTo(Math.max(0, Math.min(duration, t + d)));

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
            {fmt(t)} / {fmt(duration)}
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

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
  middle: { flex: 1, gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.sm },
  chapter: { flex: 1, color: colors.text, fontSize: 12, fontWeight: '700' },
  time: { color: colors.textFaint, fontSize: 11, fontWeight: '600', fontVariant: ['tabular-nums'] },
  track: { height: 4, borderRadius: 2, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent, borderRadius: 2 },
});
