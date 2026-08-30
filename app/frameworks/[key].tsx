import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AREA_PASTEL, FRAMEWORK_BY_KEY } from '@/data/frameworks';
import { questions } from '@/data';
import type { Question } from '@/types/question';
import { QuestionCard } from '@/components/QuestionCard';
import { Eyebrow, IconButton } from '@/components/ui';
import { categoryPastel, colors, radius, shadow, space } from '@/theme/tokens';

/** One framework: context (when / trap / signals) first, then one card per step, then the drills that use it. */
export default function FrameworkScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key } = useLocalSearchParams<{ key: string }>();
  const fw = FRAMEWORK_BY_KEY[key ?? ''];
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/frameworks'));

  const [drills, setDrills] = useState<Question[]>([]);

  useEffect(() => {
    if (!fw) return;
    questions.list().then((all) => setDrills(fw.drills.map((id) => all.find((q) => q.id === id)).filter((q): q is Question => !!q)));
  }, [fw]);

  if (!fw) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.muted}>Framework not found.</Text>
      </View>
    );
  }

  const cat = fw.categories[0];
  const pastel = cat === 'Behavioural' || cat === 'Execution' ? AREA_PASTEL[cat] : categoryPastel[cat];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + space.sm, paddingBottom: insets.bottom + space.xxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.bar}>
          <IconButton icon="arrow-back" onPress={goBack} />
          <View style={[styles.catChip, { backgroundColor: pastel.bg }]}>
            <Text style={[styles.catText, { color: pastel.fg }]}>{fw.categories.join(' · ')}</Text>
          </View>
        </View>

        <View style={styles.head}>
          <Text style={styles.emoji}>{fw.emoji}</Text>
          <Text style={styles.title}>{fw.name}</Text>
          <Text style={styles.oneLiner}>{fw.oneLiner}</Text>
          {fw.alsoKnownAs ? <Text style={styles.aka}>Also known as: {fw.alsoKnownAs}</Text> : null}
        </View>

        {/* Context first: when to use it, the trap, senior signals */}
        <View style={styles.section}>
          <View style={styles.block}>
            <View style={styles.blockHead}>
              <MaterialIcons name="check-circle" size={18} color={colors.success} />
              <Text style={[styles.blockLabel, { color: colors.success }]}>When to use it</Text>
            </View>
            <Text style={styles.blockText}>{fw.whenToUse}</Text>
          </View>
          <View style={[styles.block, { backgroundColor: '#FDECEC' }]}>
            <View style={styles.blockHead}>
              <MaterialIcons name="warning-amber" size={18} color={colors.danger} />
              <Text style={[styles.blockLabel, { color: colors.danger }]}>The trap</Text>
            </View>
            <Text style={styles.blockText}>{fw.trap}</Text>
          </View>
          {fw.tips?.length ? (
            <View style={[styles.block, { backgroundColor: colors.accentSoft }]}>
              <View style={styles.blockHead}>
                <MaterialIcons name="auto-awesome" size={18} color={colors.accent} />
                <Text style={[styles.blockLabel, { color: colors.accent }]}>Senior signals</Text>
              </View>
              {fw.tips.map((t, i) => (
                <Text key={i} style={styles.blockText}>• {t}</Text>
              ))}
            </View>
          ) : null}
        </View>

        {/* One card per step */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The steps</Text>
          {fw.steps.map((st, i) => (
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

        {drills.length ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>See it applied</Text>
            <View style={{ gap: space.sm }}>
              {drills.map((q) => (
                <QuestionCard key={q.id} question={q} compact onPress={() => router.push(`/question/${q.id}`)} />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  muted: { color: colors.textMuted, fontSize: 15 },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, marginBottom: space.lg },
  catChip: { borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
  catText: { fontSize: 12, fontWeight: '800' },
  head: { paddingHorizontal: space.lg, gap: 6, marginBottom: space.lg },
  emoji: { fontSize: 36 },
  title: { color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.6 },
  oneLiner: { color: colors.textMuted, fontSize: 16, lineHeight: 23 },
  aka: { color: colors.textFaint, fontSize: 13, marginTop: 2 },
  stepCard: { flexDirection: 'row', gap: space.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, ...shadow.card },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepNumText: { color: colors.onAccent, fontSize: 14, fontWeight: '800' },
  stepTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: '800', letterSpacing: -0.3 },
  stepDetail: { color: colors.text, fontSize: 15, lineHeight: 22 },
  section: { paddingHorizontal: space.lg, marginTop: space.xl, gap: space.md },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
  block: { backgroundColor: '#E8F7EE', borderRadius: radius.lg, padding: space.lg, gap: 6 },
  blockHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  blockLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  blockText: { color: colors.text, fontSize: 15, lineHeight: 22 },
});
