import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
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
  const handled = useRef(new Set<string>());

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const open = (response: Notifications.NotificationResponse | null) => {
      if (!response) return;
      const id = response.notification.request.identifier;
      if (handled.current.has(id)) return; // cold start fires through both paths
      handled.current.add(id);
      const href = response.notification.request.content.data?.href;
      if (typeof href === 'string') router.push(href as never);
    };

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
  }, [router]);
}
