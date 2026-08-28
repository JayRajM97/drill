import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, space } from '@/theme/tokens';

type Tab = 'home' | 'practice' | 'numbers' | 'profile';

const TABS: {
  key: Tab;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  href: '/' | '/practice' | '/numbers' | '/profile';
}[] = [
  { key: 'home', label: 'Home', icon: 'home', href: '/' },
  { key: 'practice', label: 'Library', icon: 'grid-view', href: '/practice' },
  { key: 'numbers', label: 'Numbers', icon: 'tag', href: '/numbers' },
  { key: 'profile', label: 'You', icon: 'person-outline', href: '/profile' },
];

/** Floating pill nav: the active tab expands into a labelled accent pill. */
export function BottomNavBar({ active }: { active: Tab }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, space.md) }]}>
      <View style={styles.nav}>
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              style={[styles.item, isActive && styles.itemActive]}
              onPress={() => router.navigate(tab.href)}
            >
              <MaterialIcons
                name={tab.icon}
                size={22}
                color={isActive ? colors.onAccent : colors.text}
              />
              {isActive ? <Text style={styles.label}>{tab.label}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Height reserved at the bottom of scroll views so content clears the nav. */
export const NAV_CLEARANCE = 112;

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    padding: 6,
    ...shadow.nav,
  },
  item: {
    height: 52,
    minWidth: 52,
    paddingHorizontal: 15,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
  },
  itemActive: { backgroundColor: colors.accent, paddingHorizontal: 20 },
  label: { color: colors.onAccent, fontSize: 15, fontWeight: '700' },
});
