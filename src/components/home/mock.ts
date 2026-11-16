import { addDays, dowShort, longDate, todayIso } from '@/lib/dates';
import { sessionDurationMin, type Session } from '@/lib/booking';

export type MockReservation = {
  id: string;
  sessionId: string;
  tag: string;
  status: string;
  title: string;
  time: string;
  meta: string;
  dateLabel: string;
};

export type MockFeatured = {
  id: string;
  category: string;
  dateLabel: string;
  author: string;
  title: string;
  excerpt: string;
};

function dayTag(day: string, today = todayIso()): string {
  if (day === today) return 'AUJOURD’HUI';
  if (day === addDays(today, 1)) return 'DEMAIN';
  return dowShort(day);
}

function shortDateLabel(day: string): string {
  const dow = dowShort(day);
  const pretty = `${dow.charAt(0)}${dow.slice(1).toLowerCase()}.`;
  // "Lundi 16 novembre" → "16 novembre"
  const rest = longDate(day).replace(/^\S+\s+/, '');
  return `${pretty} ${rest}`;
}

export function reservationFromSession(session: Session): MockReservation {
  const duration = sessionDurationMin(session.start, session.end);
  const coach = session.coachName ? ` · Coach ${session.coachName}` : '';
  return {
    id: `${session.id}-${session.day}`,
    sessionId: session.id,
    tag: dayTag(session.day),
    status: session.status === 'waitlist' ? 'Liste d’attente' : 'Confirmé',
    title: session.type,
    time: session.start,
    meta: `${duration} min${coach}`,
    dateLabel: shortDateLabel(session.day),
  };
}

export const MOCK_FEATURED: MockFeatured[] = [
  {
    id: 'f1',
    category: 'PROGRAMMATION',
    dateLabel: '13 octobre 2026',
    author: 'L’équipe Blue Monkey',
    title: 'Cycle 2 : Build & Transfer',
    excerpt: 'Découvre les objectifs du nouveau cycle.',
  },
  {
    id: 'f2',
    category: 'ÉVÉNEMENT',
    dateLabel: '20 octobre 2026',
    author: 'L’équipe Blue Monkey',
    title: 'Le prochain rendez-vous de la box',
    excerpt: 'Inscris-toi pour la prochaine compétition interne.',
  },
];
