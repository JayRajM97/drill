import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { questions, type CategorySummary } from '@/data';
import { useDaily } from '@/state/useDaily';
import { useProgress } from '@/state/useProgress';
import { CategoryTile } from '@/components/CategoryTile';
import { DifficultyBadge } from '@/components/ui';
import { BottomNavBar } from '@/components/BottomNavBar';
import { colors, font, radius, space } from '@/theme/tokens';

// Literal to design/stitch/04-home-2x2-grid.html ("Home - 2x2 Category Grid").
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useProgress();
  const { daily } = useDaily();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [search, setSearch] = useState('');
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    questions.getCategories().then(setCategories);
  }, []);

  const needle = search.trim().toLowerCase();
  const filteredCategories = useMemo(
    () => categories.filter((c) => c.category.toLowerCase().includes(needle)),
    [categories, needle]
  );

  const featured = daily[0];

  return (
    <View style={styles.screen}>
      {/* TopAppBar */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <View style={styles.flameChip}>
            <MaterialIcons name="local-fire-department" size={20} color={colors.primary} />
          </View>
          <Text style={styles.wordmark}>DRILL</Text>
        </View>
        <Pressable
          style={styles.searchBtn}
          onPress={() => searchRef.current?.focus()}
          hitSlop={8}
        >
          <MaterialIcons name="search" size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          paddingTop: space.xl,
          paddingBottom: space.xxxl,
          gap: space.xxl,
        }}
      >
        {/* Welcome & Search */}
        <View style={{ gap: space.lg }}>
          <View style={{ gap: space.xs }}>
            <Text style={styles.hero}>Ready to focus?</Text>
            <Text style={styles.heroSub}>Continue your mastery journey.</Text>
          </View>
          <View style={styles.searchWrap}>
            <MaterialIcons name="search" size={18} color={colors.outline} />
            <TextInput
              ref={searchRef}
              value={search}
              onChangeText={setSearch}
              placeholder="Search drills, categories, or concepts..."
              placeholderTextColor={colors.outline}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Featured Daily Drill */}
        {featured ? (
          <View>
            <Text style={styles.sectionTitle}>Daily Drill</Text>
            <Pressable
              style={styles.dailyCard}
              onPress={() => router.push(`/question/${featured.id}`)}
            >
              <View style={styles.dailyTopRow}>
                <DifficultyBadge difficulty={featured.difficulty} />
                <Text style={styles.dailyCategory}>{featured.category[0]}</Text>
              </View>
              <Text style={styles.dailyTitle}>{featured.title}</Text>
              <Text style={styles.dailyDesc} numberOfLines={2}>
                Practice with the {featured.framework} framework — explore{' '}
                {featured.domain_tags.slice(0, 2).join(' & ')}.
              </Text>
              <View style={styles.dailyFooter}>
                <View style={styles.dailyMeta}>
                  <MaterialIcons name="bar-chart" size={16} color={colors.textMuted} />
                  <Text style={styles.dailyMetaText}>{featured.difficulty}</Text>
                </View>
                <Pressable
                  style={styles.startBtn}
                  onPress={() => router.push(`/question/${featured.id}`)}
                >
                  <Text style={styles.startBtnText}>Start Drill</Text>
                  <MaterialIcons name="play-arrow" size={18} color={colors.onAccent} />
                </Pressable>
              </View>
            </Pressable>
          </View>
        ) : null}

        {/* Categories grid */}
        <View style={{ gap: space.md }}>
          <View style={styles.categoriesHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Pressable
              style={styles.viewAll}
              onPress={() => router.push('/practice')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <MaterialIcons name="arrow-forward" size={14} color={colors.primary} />
            </Pressable>
          </View>
          <View style={styles.grid}>
            {filteredCategories.map((c) => (
              <View key={c.category} style={styles.gridCell}>
                <CategoryTile
                  category={c.category}
                  count={c.count}
                  onPress={() =>
                    router.push(`/category/${encodeURIComponent(c.category)}`)
                  }
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNavBar active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flameChip: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: `${colors.accent}26`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { color: colors.text, fontSize: 19, fontWeight: '800', letterSpacing: -0.3 },
  searchBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { color: colors.text, fontSize: font.display, fontWeight: '700', letterSpacing: -0.5 },
  heroSub: { color: colors.textMuted, fontSize: 16, lineHeight: 24 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: '700', marginBottom: space.md },
  dailyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: space.xl,
    gap: space.sm,
  },
  dailyTopRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dailyCategory: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  dailyTitle: { color: colors.text, fontSize: 22, fontWeight: '700', lineHeight: 28 },
  dailyDesc: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  dailyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.sm,
  },
  dailyMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dailyMetaText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  startBtnText: { color: colors.onAccent, fontSize: 14, fontWeight: '700' },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  gridCell: { width: '47%', flexGrow: 1 },
});
