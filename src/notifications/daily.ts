import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { questions } from '@/data';
import type { Question } from '@/types/question';
import { FRAMEWORKS } from '@/data/frameworks';
import { SETS, questionFor, type NumberSet } from '@/data/numbers';

/**
 * Six nudges a day — two case studies, two numbers, two frameworks — spread
 * from morning to night. Each one deep-links straight to the thing it asks
 * about, so a notification is one tap from practice.
 *
 * Content rotates by day so nothing repeats until the deck is exhausted.
 * iOS caps pending local notifications at 64, so we lay down a week at a
 * time (6 x 7 = 42) and top the schedule back up every time the app opens.
 */

export type NudgeKind = 'case' | 'number' | 'framework';

interface Slot {
  hour: number;
  minute: number;
  kind: NudgeKind;
  /** Which deck a 'number' slot draws from: anchors in the morning, product metrics later. */
  set?: NumberSet;
}

export const SLOTS: Slot[] = [
  { hour: 8, minute: 30, kind: 'number', set: 'numbers' },
  { hour: 11, minute: 0, kind: 'case' },
  { hour: 13, minute: 30, kind: 'framework' },
  { hour: 16, minute: 30, kind: 'number', set: 'metrics' },
  { hour: 19, minute: 0, kind: 'case' },
  { hour: 21, minute: 30, kind: 'framework' },
];

const DAYS_AHEAD = 7;
const ENABLED_KEY = 'drill.nudges.enabled';

/** Days since the epoch — the rotation counter, so each day draws fresh content. */
function dayNumber(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}

function pick<T>(pool: T[], turn: number): T | undefined {
  if (!pool.length) return undefined;
  return pool[((turn % pool.length) + pool.length) % pool.length];
}

interface Nudge {
  title: string;
  body: string;
  href: string;
}

/**
 * `turn` counts every occurrence of this kind ever: two per day, so a pool of
 * N lasts N/2 days before it comes round again.
 */
function nudgeFor(slot: Slot, turn: number, all: Question[]): Nudge | undefined {
  if (slot.kind === 'case') {
    const q = pick(all, turn);
    if (!q) return undefined;
    return {
      title: `Case study · ${q.categories[0] ?? 'Practice'}`,
      body: q.title,
      href: `/question/${q.id}`,
    };
  }
  if (slot.kind === 'framework') {
    const f = pick(FRAMEWORKS, turn);
    if (!f) return undefined;
    return { title: `Framework · ${f.name}`, body: f.oneLiner, href: `/frameworks/${f.key}` };
  }
  const set: NumberSet = slot.set ?? 'numbers';
  const fact = pick(SETS[set].facts, turn);
  if (!fact) return undefined;
  return {
    title: set === 'metrics' ? 'Metric check' : 'Number check',
    body: questionFor(fact),
    href: `/numbers/shuffle?set=${set}&factId=${encodeURIComponent(fact.id)}`,
  };
}

export async function areNudgesEnabled(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return (await AsyncStorage.getItem(ENABLED_KEY)) !== 'off';
}

export async function setNudgesEnabled(on: boolean): Promise<void> {
  await AsyncStorage.setItem(ENABLED_KEY, on ? 'on' : 'off');
  await rescheduleNudges();
}

/** Asks once; a previous "don't allow" is respected without nagging. */
export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/**
 * Wipes the pending queue and lays down the next week. Safe to call on every
 * launch — rebuilding is cheap and keeps the horizon a full seven days out.
 * Returns how many notifications are now queued.
 */
export async function rescheduleNudges(): Promise<number> {
  if (Platform.OS === 'web') return 0;

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!(await areNudgesEnabled())) return 0;
  if (!(await ensurePermission())) return 0;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('drill-daily', {
      name: 'Daily practice',
      importance: Notifications.AndroidImportance.DEFAULT,
      lightColor: '#1F5EFF',
    });
  }

  const all = await questions.list();
  const cutoff = Date.now() + 60_000; // don't schedule a slot that is already gone
  let queued = 0;

  for (let d = 0; d < DAYS_AHEAD; d++) {
    const day = new Date();
    day.setDate(day.getDate() + d);
    const turnOf = dayNumber(day) * 2; // two of each kind per day
    const seen: Record<NudgeKind, number> = { case: 0, number: 0, framework: 0 };

    for (const slot of SLOTS) {
      const turn = turnOf + seen[slot.kind]++;
      const at = new Date(day);
      at.setHours(slot.hour, slot.minute, 0, 0);
      if (at.getTime() <= cutoff) continue;

      const nudge = nudgeFor(slot, turn, all);
      if (!nudge) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: nudge.title,
          body: nudge.body,
          data: { href: nudge.href },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: at,
          ...(Platform.OS === 'android' ? { channelId: 'drill-daily' } : {}),
        },
      });
      queued++;
    }
  }
  return queued;
}

/** Debug helper: what is actually sitting in the queue right now. */
export async function pendingNudges() {
  if (Platform.OS === 'web') return [];
  return Notifications.getAllScheduledNotificationsAsync();
}
