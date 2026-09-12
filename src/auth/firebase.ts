import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, initializeAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase is optional. Drill works entirely offline with progress in
 * AsyncStorage; signing in is what lifts the streak into the cloud so it
 * survives a reinstall or moves to another device.
 *
 * Config comes from EXPO_PUBLIC_FIREBASE_* env vars (see .env.example).
 * These are public client identifiers, not secrets — Firestore rules are what
 * actually protect the data. With no config set, every export here returns
 * null and the app behaves exactly as it did before auth existed.
 */
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

export const isCloudConfigured = Boolean(config.apiKey && config.projectId && config.appId);

/** Point at local Firebase emulators for development, e.g. "localhost". */
const emulatorHost = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST;

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getAppOnce(): FirebaseApp | null {
  if (!isCloudConfigured) return null;
  if (!app) app = getApps().length ? getApp() : initializeApp(config as Required<typeof config>);
  return app;
}

export function getAuthOrNull(): Auth | null {
  const a = getAppOnce();
  if (!a) return null;
  if (authInstance) return authInstance;
  if (Platform.OS === 'web') {
    authInstance = getAuth(a);
    if (emulatorHost) connectAuthEmulator(authInstance, `http://${emulatorHost}:9099`, { disableWarnings: true });
    return authInstance;
  }
  // `getReactNativePersistence` only exists on Firebase's React Native entry
  // point, which its web typings don't declare — hence the require + cast.
  // Without it, auth state is lost every time the app is killed.
  const rn = require('firebase/auth') as {
    getReactNativePersistence?: (storage: unknown) => unknown;
  };
  try {
    authInstance = rn.getReactNativePersistence
      ? initializeAuth(a, { persistence: rn.getReactNativePersistence(AsyncStorage) as never })
      : getAuth(a);
  } catch {
    // initializeAuth throws if it already ran (fast refresh); fall back.
    authInstance = getAuth(a);
  }
  if (emulatorHost) connectAuthEmulator(authInstance, `http://${emulatorHost}:9099`, { disableWarnings: true });
  return authInstance;
}

export function getDbOrNull(): Firestore | null {
  const a = getAppOnce();
  if (!a) return null;
  if (!dbInstance) {
    dbInstance = getFirestore(a);
    if (emulatorHost) connectFirestoreEmulator(dbInstance, emulatorHost, 8080);
  }
  return dbInstance;
}

/** Firebase error codes are noisy; say something a human can act on. */
export function authErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code ?? '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address does not look right.';
    case 'auth/missing-password':
    case 'auth/weak-password':
      return 'Password needs to be at least 6 characters.';
    case 'auth/email-already-in-use':
      return 'That email already has an account — sign in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is not right.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a minute and try again.';
    case 'auth/network-request-failed':
      return 'No connection. Your streak is still saved on this device.';
    default:
      return 'Could not complete that. Your streak is still safe on this device.';
  }
}
