import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { CONCEPT_BY_KEY } from '@/data/concepts';
import { Eyebrow, IconButton } from '@/components/ui';
import { colors, radius, shadow, space } from '@/theme/tokens';

/**
 * One concept, card by card: what it is, how it works (one card per step),
 * who uses it in the wild, the terms that travel with it, and the PM angle.
 */
export default function ConceptScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key } = useLocalSearchParams<{ key: string }>();
  const concept = CONCEPT_BY_KEY[key ?? ''];
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/learn'));

  if (!concept) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.muted}>Concept not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.xxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.bar}>
          <IconButton icon="arrow-back" onPress={goBack} />
          <View style={styles.chip}>
            <Text style={styles.chipText}>AI PM</Text>
          </View>
        </View>

        <View style={styles.head}>
          <Text style={styles.emoji}>{concept.emoji}</Text>
          <Text style={styles.title}>{concept.name}</Text>
          <Text style={styles.tagline}>{concept.tagline}</Text>
        </View>

        {/* What it is — the blue hero card */}
        <View style={styles.section}>
          <View style={[styles.hero, shadow.accent]}>
            <Eyebrow style={{ color: colors.onAccentMuted }}>What it is</Eyebrow>
            <Text style={styles.heroText}>{concept.what}</Text>
          </View>
        </View>

        {/* How it works — one card per step */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          {concept.how.map((st, i) => (
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

        {/* In the wild */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>In the wild</Text>
          {concept.useCases.map((u) => (
            <View key={u.product} style={styles.useCard}>
              <MaterialIcons name="rocket-launch" size={18} color={colors.accent} style={{ marginTop: 2 }} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.useProduct}>{u.product}</Text>
                <Text style={styles.useText}>{u.use}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Terms to know */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms to know</Text>
          <View style={styles.termsCard}>
            {concept.terms.map((t, i) => (
              <View key={t.term} style={[styles.termRow, i > 0 && styles.termDivider]}>
                <Text style={styles.term}>{t.term}</Text>
                <Text style={styles.termDef}>{t.def}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* The PM angle */}
        <View style={styles.section}>
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <MaterialIcons name="auto-awesome" size={18} color={colors.accent} />
              <Text style={styles.blockLabel}>The PM angle</Text>
            </View>
            {concept.pmAngle.map((p, i) => (
              <View key={i} style={styles.angleRow}>
                <View style={styles.bullet} />
                <Text style={styles.blockText}>{p}</Text>
              </View>
            ))}
          </View>
          {concept.tradeoff ? (
            <View style={[styles.block, { backgroundColor: '#FFF4DE' }]}>
              <View style={styles.blockHead}>
                <MaterialIcons name="balance" size={18} color={colors.warning} />
                <Text style={[styles.blockLabel, { color: colors.warning }]}>The trade-off</Text>
              </View>
              <Text style={styles.blockText}>{concept.tradeoff}</Text>
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
  useCard: { flexDirection: 'row', gap: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, ...shadow.card },
  useProduct: { color: colors.text, fontSize: 15, fontWeight: '800' },
  useText: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
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
