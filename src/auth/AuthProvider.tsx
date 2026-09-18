import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import type { AuthSessionResult } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { authErrorMessage, getAuthOrNull, isCloudConfigured } from './firebase';

// Finishes the OAuth redirect when the browser hands control back.
WebBrowser.maybeCompleteAuthSession();

// Google needs its own OAuth client ids, created alongside the Firebase
// project. Without them the Google button is hidden rather than broken.
const GOOGLE_IDS = {
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};
export const isGoogleConfigured = Boolean(
  isCloudConfigured && (GOOGLE_IDS.iosClientId || GOOGLE_IDS.webClientId),
);

export interface Account {
  uid: string;
  email: string | null;
  /** Google gives these; an email account has neither. */
  name: string | null;
  photo: string | null;
}

interface AuthContextValue {
  /** null until we know, then the signed-in account or null. */
  account: Account | null;
  /** False while restoring a saved session on launch. */
  ready: boolean;
  /** Whether cloud sync is even available in this build. */
  configured: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  /** Opens Google's sheet; resolves to a message on failure, null on success. */
  signInWithGoogle: () => Promise<string | null>;
  /** Whether the Google button should be offered at all. */
  googleReady: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(!isCloudConfigured);
  const promptRef = useRef<null | (() => Promise<AuthSessionResult | null>)>(null);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => {
    const auth = getAuthOrNull();
    if (!auth) return;
    return onAuthStateChanged(auth, (user: User | null) => {
      setAccount(
        user
          ? { uid: user.uid, email: user.email, name: user.displayName, photo: user.photoURL }
          : null,
      );
      setReady(true);
    });
  }, []);

  /** Each action returns null on success, or a message to show the user. */
  const run = useCallback(
    async (fn: (auth: NonNullable<ReturnType<typeof getAuthOrNull>>) => Promise<unknown>) => {
      const auth = getAuthOrNull();
      if (!auth) return 'Cloud sync is not set up in this build.';
      try {
        await fn(auth);
        return null;
      } catch (err) {
        return authErrorMessage(err);
      }
    },
    [],
  );

  const signIn = useCallback(
    (email: string, password: string) =>
      run((auth) => signInWithEmailAndPassword(auth, email.trim(), password)),
    [run],
  );

  const signUp = useCallback(
    (email: string, password: string) =>
      run((auth) => createUserWithEmailAndPassword(auth, email.trim(), password)),
    [run],
  );

  /**
   * Google hands back an ID token, which Firebase swaps for a session. The
   * account then behaves exactly like an email one — same document, same merge.
   */
  const signInWithGoogle = useCallback(async () => {
    const auth = getAuthOrNull();
    const prompt = promptRef.current;
    if (!auth || !isGoogleConfigured || !prompt) return 'Google sign-in is not set up in this build.';
    try {
      const result = await prompt();
      if (result?.type === 'dismiss' || result?.type === 'cancel') return null; // user backed out
      const idToken =
        result?.type === 'success' ? (result.params?.id_token ?? result.authentication?.idToken) : null;
      if (!idToken) return 'Google did not return a sign-in token. Try again.';
      await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
      return null;
    } catch (err) {
      return authErrorMessage(err);
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getAuthOrNull();
    if (auth) await fbSignOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      account,
      ready,
      configured: isCloudConfigured,
      signIn,
      signUp,
      signInWithGoogle,
      googleReady,
      signOut,
    }),
    [account, ready, signIn, signUp, signInWithGoogle, googleReady, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {isGoogleConfigured ? (
        <GoogleBridge
          onReady={(prompt) => {
            promptRef.current = prompt;
            setGoogleReady(!!prompt);
          }}
        />
      ) : null}
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Holds the Google auth request. It lives in its own component because
 * `useIdTokenAuthRequest` THROWS when no client ids are set, which would take
 * the whole provider — and therefore the whole app — down with it. Mounted
 * only when the ids exist.
 */
function GoogleBridge({
  onReady,
}: {
  onReady: (prompt: null | (() => Promise<AuthSessionResult | null>)) => void;
}) {
  const [request, , promptAsync] = Google.useIdTokenAuthRequest(GOOGLE_IDS);
  useEffect(() => {
    onReady(request ? () => promptAsync() : null);
  }, [request, promptAsync, onReady]);
  return null;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
