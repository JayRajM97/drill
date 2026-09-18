import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/auth/AuthProvider';
import { useProgress } from '@/state/useProgress';
import { Card } from '@/components/ui';
import { colors, radius, space } from '@/theme/tokens';

const SYNC_LABEL: Record<string, string> = {
  syncing: 'Syncing…',
  synced: 'Streak saved to your account',
  error: "Couldn't reach the cloud — saved on this device",
  local: 'Saved on this device only',
  off: 'Saved on this device only',
};

/**
 * Sign in to carry the streak across devices and survive a reinstall.
 * Everything keeps working signed out; this only adds a cloud copy.
 */
export function AccountCard() {
  const { account, ready, configured, signIn, signUp, signInWithGoogle, googleReady, signOut } = useAuth();
  const { sync, progress } = useProgress();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>Save your streak</Text>
        <Text style={styles.sub}>
          Cloud sync isn’t set up in this build, so your {progress.streak}-day streak lives only on
          this device.
        </Text>
      </Card>
    );
  }

  if (!ready) {
    return (
      <Card style={[styles.card, styles.center]}>
        <ActivityIndicator color={colors.accent} />
      </Card>
    );
  }

  if (account) {
    return (
      <Card style={styles.card}>
        <View style={styles.row}>
          {account.photo ? (
            <Image source={{ uri: account.photo }} style={styles.avatar} />
          ) : (
            <View style={styles.badge}>
              <MaterialIcons name="person" size={20} color={colors.accent} />
            </View>
          )}
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.title} numberOfLines={1}>
              {account.name ?? account.email ?? 'Signed in'}
            </Text>
            {account.name && account.email ? (
              <Text style={styles.sub} numberOfLines={1} ellipsizeMode="middle">
                {account.email}
              </Text>
            ) : null}
            <Text style={styles.sub}>{SYNC_LABEL[sync] ?? SYNC_LABEL.local}</Text>
          </View>
        </View>
        <Pressable onPress={() => signOut()} style={styles.ghost} hitSlop={6}>
          <Text style={styles.ghostText}>Sign out</Text>
        </Pressable>
      </Card>
    );
  }

  const submit = async () => {
    setBusy(true);
    setError(null);
    const message = mode === 'signIn' ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (message) setError(message);
    else {
      setEmail('');
      setPassword('');
    }
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Save your streak</Text>
      <Text style={styles.sub}>
        {progress.streak > 0
          ? `Your ${progress.streak}-day streak lives only on this phone. Sign in to keep it safe.`
          : 'Sign in to keep your streak, bookmarks and completed drills across devices.'}
      </Text>

      {googleReady ? (
        <>
          <Pressable
            onPress={async () => {
              setBusy(true);
              setError(null);
              const message = await signInWithGoogle();
              setBusy(false);
              if (message) setError(message);
            }}
            disabled={busy}
            style={({ pressed }) => [styles.google, busy && { opacity: 0.6 }, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.gMark}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </Pressable>
          <Text style={styles.or}>or with email</Text>
        </>
      ) : null}

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
        style={styles.input}
        onSubmitEditing={submit}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        onPress={submit}
        disabled={busy || !email || !password}
        style={({ pressed }) => [
          styles.primary,
          (busy || !email || !password) && { opacity: 0.5 },
          pressed && { opacity: 0.85 },
        ]}
      >
        {busy ? (
          <ActivityIndicator color={colors.onAccent} />
        ) : (
          <Text style={styles.primaryText}>{mode === 'signIn' ? 'Sign in' : 'Create account'}</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => {
          setMode(mode === 'signIn' ? 'signUp' : 'signIn');
          setError(null);
        }}
        hitSlop={6}
        style={styles.ghost}
      >
        <Text style={styles.ghostText}>
          {mode === 'signIn' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.sm, marginTop: space.lg },
  center: { alignItems: 'center', paddingVertical: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surfaceAlt },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  sub: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  error: { color: colors.warning, fontSize: 13, lineHeight: 18 },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    paddingVertical: 13,
  },
  gMark: { color: '#4285F4', fontSize: 17, fontWeight: '800' },
  googleText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  or: { color: colors.textFaint, fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  primaryText: { color: colors.onAccent, fontSize: 15, fontWeight: '800' },
  ghost: { alignItems: 'center', paddingVertical: 6 },
  ghostText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
});
