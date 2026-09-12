import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth';
import { authErrorMessage, getAuthOrNull, isCloudConfigured } from './firebase';

export interface Account {
  uid: string;
  email: string | null;
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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(!isCloudConfigured);

  useEffect(() => {
    const auth = getAuthOrNull();
    if (!auth) return;
    return onAuthStateChanged(auth, (user: User | null) => {
      setAccount(user ? { uid: user.uid, email: user.email } : null);
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

  const signOut = useCallback(async () => {
    const auth = getAuthOrNull();
    if (auth) await fbSignOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ account, ready, configured: isCloudConfigured, signIn, signUp, signOut }),
    [account, ready, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
