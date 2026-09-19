import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as NativeSplash from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/auth/AuthProvider';
import { ProgressProvider } from '@/state/useProgress';
import { useDailyNudges } from '@/notifications/useDailyNudges';
import { SplashOverlay } from '@/components/SplashOverlay';
import { colors } from '@/theme/tokens';

// Hold the native splash until our own one is on screen, otherwise the app
// flashes white between the two.
NativeSplash.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useDailyNudges();
  const [opening, setOpening] = useState(true);

  useEffect(() => {
    NativeSplash.hideAsync().catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ProgressProvider>
            <StatusBar style="dark" />
            {/* On desktop web, keep the app a phone-width column in the middle. */}
            <View style={styles.frame}>
              <View style={styles.column}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.bg },
                    animation: 'slide_from_right',
                  }}
                />
              </View>
            </View>
            {opening ? <SplashOverlay onDone={() => setOpening(false)} /> : null}
          </ProgressProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#E9EBEF' : colors.bg, alignItems: 'center' },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 520 : undefined,
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
});
