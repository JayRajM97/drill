import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { PLAYBOOK_BY_KEY } from '@/data/analytics';
import { Eyebrow, IconButton } from '@/components/ui';
import { colors, radius, shadow, space } from '@/theme/tokens';

/**
 * One playbook, card by card: the situation (or when to reach for the method),
 * the walkthrough step by step, the concrete list of data to pull, the terms
 * that travel with it, the PM angle — and the trap.
 */
export default function PlaybookScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key } = useLocalSearchParams<{ key: string }>();
  const playbook = PLAYBOOK_BY_KEY[key ?? ''];
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/data'));

  if (!playbook) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.muted}>Playbook not found.</Text>
      </View>
    );
  }

  const scenario = playbook.kind === 'scenario';

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.xxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.bar}>
          <IconButton icon="arrow-back" onPress={goBack} />
          <View style={styles.chip}>
            <Text style={styles.chipText}>{scenario ? 'Worked example' : 'Data method'}</Text>
          </View>
        </View>

        <View style={styles.head}>
          <Text style={styles.emoji}>{playbook.emoji}</Text>
          <Text style={styles.title}>{scenario ? playbook.name.replace('Worked example: ', '') : playbook.name}</Text>
          <Text style={styles.tagline}>{playbook.tagline}</Text>
        </View>

        {/* The situation / when to reach for it — the blue hero card */}
        <View style={styles.section}>
          <View style={[styles.hero, shadow.accent]}>
            <Eyebrow style={{ color: colors.onAccentMuted }}>{scenario ? 'The situation' : 'When to reach for it'}</Eyebrow>
            <Text style={styles.heroText}>{playbook.when}</Text>
          </View>
        </View>

        {/* The walkthrough — one card per step */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{scenario ? 'The walkthrough' : 'The method'}</Text>
          {playbook.steps.map((st, i) => (
            <View key={st.label} style={styles.stepCard}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.stepTitle}>{st.label}</Text>
                <Text style={styles.stepDetail}>{st.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* What data to pull */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What data to pull</Text>
          <View style={styles.pullCard}>
            {playbook.pull.map((p, i) => (
              <View key={i} style={[styles.pullRow, i > 0 && styles.pullDivider]}>
                <MaterialIcons name="query-stats" size={16} color={colors.accent} style={{ marginTop: 3 }} />
                <Text style={styles.pullText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Terms to know */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms to know</Text>
          <View style={styles.termsCard}>
            {playbook.terms.map((t, i) => (
              <View key={t.term} style={[styles.termRow, i > 0 && styles.termDivider]}>
                <Text style={styles.term}>{t.term}</Text>
                <Text style={styles.termDef}>{t.def}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* The PM angle + the trap */}
        <View style={styles.section}>
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <MaterialIcons name="auto-awesome" size={18} color={colors.accent} />
              <Text style={styles.blockLabel}>The PM angle</Text>
            </View>
            {playbook.pmAngle.map((p, i) => (
              <View key={i} style={styles.angleRow}>
                <View style={styles.bullet} />
                <Text style={styles.blockText}>{p}</Text>
              </View>
            ))}
          </View>
          {playbook.trap ? (
            <View style={[styles.block, { backgroundColor: '#FFF4DE' }]}>
              <View style={styles.blockHead}>
                <MaterialIcons name="warning-amber" size={18} color={colors.warning} />
                <Text style={[styles.blockLabel, { color: colors.warning }]}>The trap</Text>
              </View>
              <Text style={styles.blockText}>{playbook.trap}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.textMuted, fontSize: 15 },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, marginBottom: space.lg },
  chip: { backgroundColor: colors.accentSoft, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: colors.accent, fontSize: 12, fontWeight: '800' },
  head: { paddingHorizontal: space.lg, gap: 6, marginBottom: space.lg },
  emoji: { fontSize: 36 },
  title: { color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.6 },
  tagline: { color: colors.textMuted, fontSize: 16, lineHeight: 23 },
  section: { paddingHorizontal: space.lg, marginTop: space.lg, gap: space.md },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
  hero: { backgroundColor: colors.accent, borderRadius: radius.card, padding: space.xl, gap: space.sm },
  heroText: { color: colors.onAccent, fontSize: 16, lineHeight: 24, fontWeight: '500' },
  stepCard: { flexDirection: 'row', gap: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, ...shadow.card },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepNumText: { color: colors.onAccent, fontSize: 14, fontWeight: '800' },
  stepTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: '800', letterSpacing: -0.3 },
  stepDetail: { color: colors.text, fontSize: 15, lineHeight: 22 },
  pullCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, ...shadow.card },
  pullRow: { flexDirection: 'row', gap: space.sm, paddingVertical: space.sm, alignItems: 'flex-start' },
  pullDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  pullText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 },
  termsCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, ...shadow.card },
  termRow: { paddingVertical: space.sm, gap: 2 },
  termDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  term: { color: colors.accent, fontSize: 14, fontWeight: '800' },
  termDef: { color: colors.text, fontSize: 14, lineHeight: 20 },
  block: { backgroundColor: colors.accentSoft, borderRadius: radius.lg, padding: space.lg, gap: space.sm },
  blockHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  blockLabel: { color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  blockText: { flex: 1, color: colors.text, fontSize: 15, lineHeight: 22 },
  angleRow: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginTop: 8 },
});
