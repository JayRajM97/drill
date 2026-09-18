import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { generateDrillStreaming, type DrillProgress } from '@/data/generateDrill';
import { GeneratingState } from '@/components/GeneratingState';
import { addCustom } from '@/data/customStore';
import { questions } from '@/data';
import { useAuth } from '@/auth/AuthProvider';
import { saveRemoteDrill } from '@/state/cloudProgress';
import type { Question } from '@/types/question';
import { IconButton } from '@/components/ui';
import { colors, radius, shadow, space } from '@/theme/tokens';

const EXAMPLES = [
  'Design a home feed for a government-exam prep app',
  'How would you price Zepto’s membership?',
  'Why did WhatsApp payments fail to take off in India?',
  'Estimate the market for AI voice notes in India',
];

/** Ask what the user wants to practise, then build a drill out of it. */
export default function CreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { account } = useAuth();
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  // Set when generation finishes; the waiting state then writes it out before
  // we navigate, so the drill doesn't just appear from nowhere.
  const [written, setWritten] = useState<Question | null>(null);
  const [progress, setProgress] = useState<DrillProgress>({ title: '', headings: [] });
  // Preview replays the whole animation against a drill already in the app:
  // no API call, no tokens, and nothing saved to the library.
  const [preview, setPreview] = useState(false);
  const timers = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => () => timers.current.forEach(clearInterval), []);

  const runPreview = async () => {
    if (busy) return;
    const sample =
      (await questions.getById('position-notion-vs-confluence-google-docs')) ??
      (await questions.list({ limit: 1 }))[0];
    if (!sample) return;

    setPreview(true);
    setBusy(true);
    setError(null);
    setProgress({ title: '', headings: [] });

    const heads = sample.answer.map((a) => a.heading).slice(0, 5);
    let cut = 4;
    const typing = setInterval(() => {
      if (cut <= sample.title.length) {
        setProgress({ title: sample.title.slice(0, cut), headings: [] });
        cut += 4;
        return;
      }
      clearInterval(typing);
      let n = 0;
      const listing = setInterval(() => {
        n += 1;
        setProgress({ title: sample.title, headings: heads.slice(0, n) });
        if (n >= heads.length) {
          clearInterval(listing);
          const settle = setInterval(() => {
            clearInterval(settle);
            setWritten(sample);
          }, 700);
          timers.current.push(settle);
        }
      }, 620);
      timers.current.push(listing);
    }, 45);
    timers.current.push(typing);
  };

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const generate = async () => {
    const text = topic.trim();
    if (text.length < 3 || busy) return;
    setBusy(true);
    setError(null);
    setNote(null);
    setProgress({ title: '', headings: [] });
    const result = await generateDrillStreaming(text, context.trim() || undefined, setProgress);
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
      return;
    }
    await addCustom(result.question);
    // Signed in: keep it off this device only.
    if (account) saveRemoteDrill(account.uid, result.question).catch(() => {});
    setWritten(result.question);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: space.xxl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bar}>
          <IconButton icon="close" onPress={goBack} />
        </View>

        {busy ? (
          <View style={styles.section}>
            <GeneratingState
              question={written}
              progress={progress}
              onRevealed={() => {
                if (preview) {
                  // Put everything back; a preview leaves no trace.
                  timers.current.forEach(clearInterval);
                  timers.current = [];
                  setPreview(false);
                  setBusy(false);
                  setWritten(null);
                  setProgress({ title: '', headings: [] });
                  return;
                }
                if (written) router.replace(`/question/${written.id}`);
              }}
            />
          </View>
        ) : (
          <>
          <View style={styles.head}>
            <Text style={styles.title}>What drill would you like to solve?</Text>
            <Text style={styles.sub}>
              Type it the way you would say it out loud. A company, a problem, a question you got
              asked — anything.
            </Text>
          </View>

          <View style={styles.section}>
            <TextInput
              value={topic}
              onChangeText={(t) => {
                setTopic(t);
                if (error) setError(null);
              }}
              placeholder="e.g. Revamp Swiggy’s search for late-night orders"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              multiline
              maxLength={500}
              editable={!busy}
              autoFocus
            />
            <Text style={styles.count}>{topic.trim().length}/500</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.eyebrow}>Context — optional</Text>
            <TextInput
              value={context}
              onChangeText={setContext}
              placeholder="Anything that shapes the answer: the product, the users, the numbers, what you have already tried."
              placeholderTextColor={colors.textFaint}
              style={[styles.input, styles.contextInput]}
              multiline
              maxLength={1000}
              editable={!busy}
            />
            <Text style={styles.count}>{context.trim().length}/1000</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.eyebrow}>Or start from one of these</Text>
            <View style={styles.chips}>
              {EXAMPLES.map((e) => (
                <Pressable
                  key={e}
                  onPress={() => setTopic(e)}
                  disabled={busy}
                  style={({ pressed }) => [styles.chip, pressed && { opacity: 0.85 }]}
                >
                  <Text style={styles.chipText}>{e}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {error ? (
            <View style={styles.section}>
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={18} color={colors.warning} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </View>
          ) : null}
          {note ? (
            <View style={styles.section}>
              <Text style={styles.note}>{note}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Pressable
              onPress={generate}
              disabled={busy || topic.trim().length < 3}
              style={({ pressed }) => [
                styles.primary,
                (busy || topic.trim().length < 3) && { opacity: 0.5 },
                pressed && { opacity: 0.9 },
              ]}
            >
              {busy ? (
                <View style={styles.busyRow}>
                  <ActivityIndicator color={colors.onAccent} />
                  <Text style={styles.primaryText}>Writing your drill…</Text>
                </View>
              ) : (
                <Text style={styles.primaryText}>Make the drill</Text>
              )}
            </Pressable>
            <Text style={styles.hint}>
              {busy
                ? 'This takes around half a minute. A full answer is being written, not just a question.'
                : 'It gets saved to your library, so you can come back to it.'}
            </Text>
            <Pressable onPress={runPreview} hitSlop={6} style={styles.ghostBtn}>
              <Text style={styles.ghostText}>See how it works — free, nothing saved</Text>
            </Pressable>
          </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  bar: { flexDirection: 'row', paddingHorizontal: space.lg, marginBottom: space.md },
  head: { paddingHorizontal: space.lg, gap: space.sm },
  title: { color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.6 },
  sub: { color: colors.textMuted, fontSize: 15, lineHeight: 22 },
  section: { paddingHorizontal: space.lg, marginTop: space.lg, gap: space.sm },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    minHeight: 120,
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    textAlignVertical: 'top',
    ...shadow.card,
  },
  count: { color: colors.textFaint, fontSize: 12, fontWeight: '700', alignSelf: 'flex-end' },
  contextInput: { minHeight: 150, fontSize: 15, lineHeight: 22 },
  eyebrow: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  chips: { gap: space.sm },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    ...shadow.card,
  },
  chipText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  errorBox: {
    flexDirection: 'row',
    gap: space.sm,
    alignItems: 'flex-start',
    backgroundColor: '#FFF4DE',
    borderRadius: radius.lg,
    padding: space.md,
  },
  errorText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 },
  note: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.accent,
  },
  busyRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  primaryText: { color: colors.onAccent, fontSize: 16, fontWeight: '800' },
  hint: { color: colors.textFaint, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  ghostBtn: { alignItems: 'center', paddingVertical: 6 },
  ghostText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
});
