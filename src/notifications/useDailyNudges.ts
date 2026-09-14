import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRootNavigationState, useRouter } from 'expo-router';
import { rescheduleNudges } from './daily';

// A nudge that lands while the app is open still shows — otherwise it would
// arrive silently and the deep link would be the only way to notice it.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Keeps the week-ahead schedule topped up and routes taps to the right screen.
 * Mounted once, in the root layout.
 */
export function useDailyNudges() {
  const router = useRouter();
  // Undefined until the root navigator exists. Tapping a notification on a
  // COLD start resolves the response long before that, and a push issued then
  // is silently dropped — the app just opens on Home. So park the destination
  // and navigate once there is something to navigate.
  const navState = useRootNavigationState();
  const navReady = Boolean(navState?.key);
  const [pending, setPending] = useState<Destination | null>(null);
  const handled = useRef(new Set<string>());

  const open = useCallback((response: Notifications.NotificationResponse | null) => {
    if (!response) return;
    const id = response.notification.request.identifier;
    if (handled.current.has(id)) return; // cold start fires through both paths
    handled.current.add(id);
    const target = toDestination(response.notification.request.content.data);
    if (target) setPending(target);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    rescheduleNudges().catch(() => {});
    Notifications.getLastNotificationResponseAsync().then(open).catch(() => {});

    const tap = Notifications.addNotificationResponseReceivedListener(open);
    // Coming back to the app is the natural moment to extend the horizon.
    const app = AppState.addEventListener('change', (state) => {
      if (state === 'active') rescheduleNudges().catch(() => {});
    });

    return () => {
      tap.remove();
      app.remove();
    };
  }, [open]);

  useEffect(() => {
    if (!pending || !navReady) return;
    setPending(null);
    router.push(pending as never);
  }, [pending, navReady, router]);
}

interface Destination {
  pathname: string;
  params: Record<string, string>;
}

/**
 * Reads the route out of a notification payload. Accepts the old `href` string
 * too, so a nudge queued by a previous build still opens the right screen
 * instead of doing nothing.
 */
function toDestination(data: unknown): Destination | null {
  const d = data as { pathname?: unknown; params?: unknown; href?: unknown } | null;
  if (!d) return null;

  if (typeof d.pathname === 'string' && d.pathname) {
    const params =
      d.params && typeof d.params === 'object' ? (d.params as Record<string, string>) : {};
    return { pathname: d.pathname, params };
  }

  if (typeof d.href === 'string' && d.href) {
    const [path, query] = d.href.split('?');
    const params: Record<string, string> = {};
    for (const pair of query ? query.split('&') : []) {
      const [k, v = ''] = pair.split('=');
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v);
    }
    return { pathname: path, params };
  }

  return null;
}
