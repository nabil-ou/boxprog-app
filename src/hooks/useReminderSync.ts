import { useEffect } from 'react';

import { loadReminder, syncReminder } from '@/lib/reminders';

/** Reprogramme le rappel si les jours d’entraînement de la box changent. */
export function useReminderSync(trainingDays: number[], boxName: string) {
  const key = trainingDays.join(',');
  useEffect(() => {
    const days = key ? key.split(',').map(Number) : [];
    syncReminder(loadReminder(), days, boxName).catch(() => {});
  }, [key, boxName]);
}
