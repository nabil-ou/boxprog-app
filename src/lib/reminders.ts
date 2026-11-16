import 'expo-sqlite/localStorage/install';

import { requireOptionalNativeModule } from 'expo-modules-core';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

const MISSING = 'Les notifications seront disponibles après la prochaine mise à jour de l’app.';

async function notifications(): Promise<NotificationsModule> {
  if (!requireOptionalNativeModule('ExpoNotificationScheduler')) throw new Error(MISSING);
  return import('expo-notifications');
}

const KEY = 'boxprog-reminder';
const PREFIX = 'wod-reminder-';
const CHANNEL = 'session-reminder';

export interface ReminderPref {
  enabled: boolean;
  hour: number;
  minute: number;
}

const DEFAULT: ReminderPref = { enabled: false, hour: 18, minute: 0 };

let handlerReady = false;
let queue: Promise<void> = Promise.resolve();

function ensureHandler(Notifications: NotificationsModule) {
  if (handlerReady) return;
  handlerReady = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export function loadReminder(): ReminderPref {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    const parsed = JSON.parse(raw) as Partial<ReminderPref>;
    const hour = Number(parsed.hour);
    const minute = Number(parsed.minute);
    return {
      enabled: Boolean(parsed.enabled),
      hour: Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : DEFAULT.hour,
      minute: Number.isInteger(minute) && minute >= 0 && minute <= 59 ? minute : DEFAULT.minute,
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveReminder(pref: ReminderPref) {
  try {
    localStorage.setItem(KEY, JSON.stringify(pref));
  } catch {
    /* quota */
  }
}

export function formatReminderTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function shiftReminder(pref: ReminderPref, deltaMinutes: number): ReminderPref {
  const total = (pref.hour * 60 + pref.minute + deltaMinutes + 24 * 60) % (24 * 60);
  return { ...pref, hour: Math.floor(total / 60), minute: total % 60 };
}

/** Jours ISO 1 = lundi … 7 = dimanche → weekday Expo 1 = dimanche. */
function expoWeekday(isoDay: number) {
  return isoDay === 7 ? 1 : isoDay + 1;
}

export type ReminderPermission = 'granted' | 'denied' | 'blocked';

export async function ensureReminderPermission(): Promise<ReminderPermission> {
  const Notifications = await notifications();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  if (!current.canAskAgain) return 'blocked';
  const next = await Notifications.requestPermissionsAsync();
  if (next.granted) return 'granted';
  return next.canAskAgain ? 'denied' : 'blocked';
}

async function apply(pref: ReminderPref, trainingDays: number[], boxName: string) {
  const Notifications = await notifications();
  ensureHandler(Notifications);
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    existing
      .filter((item) => item.identifier.startsWith(PREFIX))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
  if (!pref.enabled) return;
  const perm = await Notifications.getPermissionsAsync();
  if (!perm.granted) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Rappel de séance',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const days = [...new Set((trainingDays.length ? trainingDays : [1, 2, 3, 4, 5, 6]).filter((d) => d >= 1 && d <= 7))];
  for (const isoDay of days) {
    const weekday = expoWeekday(isoDay);
    await Notifications.scheduleNotificationAsync({
      identifier: `${PREFIX}${weekday}`,
      content: {
        title: 'Séance du jour',
        body: boxName ? `C’est l’heure de t’entraîner à ${boxName}.` : 'C’est l’heure de t’entraîner.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: pref.hour,
        minute: pref.minute,
        channelId: CHANNEL,
      },
    });
  }
}

/** Annule puis reprogramme. Les appels se suivent pour ne pas se doubler. */
export function syncReminder(pref: ReminderPref, trainingDays: number[], boxName: string) {
  const run = queue.then(() => apply(pref, trainingDays, boxName));
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
