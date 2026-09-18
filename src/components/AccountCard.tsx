import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/auth/AuthProvider';
import { useProgress } from '@/state/useProgress';
import { colors, radius, shadow, space } from '@/theme/tokens';

const SYNC_LABEL: Record<string, string> = {
  syncing: 'Syncing…',
  synced: 'Streak saved to your account',
  error: "Couldn't reach the cloud — saved on this device",
  local: 'Saved on this device only',
  off: 'Saved on this device only',
};

/**
 * Google only. Signed out it is a single button; signed in it is the person's
 * name, their picture, and a way out. Nothing else belongs here.
 */
export function AccountCard({ compact, showSignedIn }: { compact?: boolean; showSignedIn?: boolean }) {
  const { account, ready, signInWithGoogle, googleReady } = useAuth();
  const { sync } = useProgress();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready) return null;

  const onPress = async () => {
    if (!googleReady) {
      setError('Google sign-in is not configured in this build.');
      return;
    }
    setBusy(true);
    setError(null);
    const message = await signInWithGoogle();
    setBusy(false);
    if (message) setError(message);
  };

  if (account) {
    if (compact || !showSignedIn) return null;
    return (
      <View style={styles.signedIn}>
        {account.photo ? (
          <Image source={{ uri: account.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.badge}>
            <MaterialIcons name="person" size={20} color={colors.accent} />
          </View>
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.name} numberOfLines={1}>
            {account.name ?? account.email ?? 'Signed in'}
          </Text>
          <Text style={styles.sync} numberOfLines={1}>
            {SYNC_LABEL[sync] ?? SYNC_LABEL.local}
          </Text>
        </View>
        <SignOutButton />
      </View>
    );
  }

  return (
    <View style={compact ? undefined : { gap: 6 }}>
      <Pressable
        onPress={onPress}
        disabled={busy}
        style={({ pressed }) => [
          compact ? styles.googleCompact : styles.google,
          busy && { opacity: 0.6 },
          pressed && { opacity: 0.9 },
        ]}
      >
        {busy ? (
          <ActivityIndicator color={compact ? colors.onAccent : colors.text} />
        ) : (
          <>
            <Text style={[styles.gMark, compact && styles.gMarkCompact]}>G</Text>
            <Text style={[styles.googleText, compact && styles.googleTextCompact]}>
              {compact ? 'Continue with Google to save your streak' : 'Continue with Google'}
            </Text>
          </>
        )}
      </Pressable>
      {error && !compact ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function SignOutButton() {
  const { signOut } = useAuth();
  return (
    <Pressable onPress={() => signOut()} hitSlop={8} style={styles.out}>
      <Text style={styles.outText}>Sign out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  googleCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: space.md,
    marginTop: space.sm,
  },
  gMark: { color: '#4285F4', fontSize: 17, fontWeight: '800' },
  gMarkCompact: { color: colors.onAccent, fontSize: 14 },
  googleText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  googleTextCompact: { color: colors.onAccent, fontSize: 13, fontWeight: '700' },
  signedIn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.md,
    ...shadow.card,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surfaceAlt },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: colors.text, fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  sync: { color: colors.textMuted, fontSize: 12 },
  out: { paddingHorizontal: space.sm, paddingVertical: 6 },
  outText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  error: { color: colors.warning, fontSize: 13, lineHeight: 18, textAlign: 'center' },
});
