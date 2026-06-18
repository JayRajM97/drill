import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';

type Tab = 'home' | 'practice' | 'bookmarks' | 'profile';

const TABS: { key: Tab; label: string; icon: keyof typeof MaterialIcons.glyphMap; href: '/' | '/practice' | '/bookmarks' | '/profile' }[] = [
  { key: 'home', label: 'Home', icon: 'home', href: '/' },
  { key: 'practice', label: 'Practice', icon: 'fitness-center', href: '/practice' },
  { key: 'bookmarks', label: 'Bookmarks', icon: 'bookmark', href: '/bookmarks' },
  { key: 'profile', label: 'Profile', icon: 'person', href: '/profile' },
];

/** Literal to the BottomNavBar JSON component shared across every mockup. */
export function BottomNavBar({ active }: { active: Tab }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, space.sm) }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            style={styles.item}
            onPress={() => router.navigate(tab.href)}
          >
            <MaterialIcons
              name={tab.icon}
              size={22}
              color={isActive ? colors.primary : colors.secondary}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: space.sm,
  },
  item: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: space.xs },
  label: { fontSize: 10, color: colors.secondary, fontWeight: '500' },
  labelActive: { color: colors.primary, fontWeight: '700' },
});
