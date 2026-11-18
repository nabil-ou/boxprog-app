import { pad, todayIso } from '@/lib/dates';
import { supabase } from '@/lib/supabase';

export type SessionStatus = 'available' | 'full' | 'booked' | 'waitlist';

/** Un créneau daté, tel que l'adhérent le voit : compteurs, pas les noms des autres. */
export type Session = {
  id: string;
  day: string;
  type: string;
  start: string;
  end: string;
  booked: number;
  waitlist: number;
  capacity: number | null;
  status: SessionStatus;
  coachName: string;
  coachAvatarUrl: string | null;
  hasProgramming: boolean;
};

type SessionRow = {
  id: string;
  day: string;
  track_name: string;
  start_time: string;
  end_time: string;
  capacity: number | null;
  booked: number;
  waitlist: number;
  my_status: 'booked' | 'waitlist' | null;
  coach_name: string | null;
  coach_avatar_url: string | null;
  has_programming: boolean;
};

const hm = (t: string) => t.slice(0, 5);

/** Durée en minutes à partir de HH:MM. */
export function sessionDurationMin(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

/** True si le créneau n’a pas encore commencé (jours futurs inclus). */
export function isSessionUpcoming(day: string, start: string, now = new Date()): boolean {
  const today = todayIso();
  if (day > today) return true;
  if (day < today) return false;
  const nowHm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  return start >= nowHm;
}

function toSession(r: SessionRow): Session {
  const capacity = r.capacity;
  const booked = Number(r.booked) || 0;
  const waitlist = Number(r.waitlist) || 0;
  let status: SessionStatus = 'available';
  if (r.my_status === 'booked') status = 'booked';
  else if (r.my_status === 'waitlist') status = 'waitlist';
  else if (capacity != null && booked >= capacity) status = 'full';
  return {
    id: r.id,
    day: String(r.day).slice(0, 10),
    type: r.track_name,
    start: hm(r.start_time),
    end: hm(r.end_time),
    booked,
    waitlist,
    capacity,
    status,
    coachName: r.coach_name?.trim() || '',
    coachAvatarUrl: r.coach_avatar_url,
    hasProgramming: Boolean(r.has_programming),
  };
}

async function rows(call: PromiseLike<{ data: unknown; error: { message?: string } | null }>): Promise<Session[]> {
  const { data, error } = await call;
  if (error) throw error;
  return ((data || []) as SessionRow[]).map(toSession);
}

export function loadSessions(boxId: string, day: string) {
  return rows(supabase.rpc('sessions_for_day', { p_box: boxId, p_day: day }));
}

export function loadMyBookings(boxId: string) {
  return rows(supabase.rpc('my_bookings', { p_box: boxId }));
}

export async function bookClass(slotId: string, day: string) {
  const { error } = await supabase.rpc('book_class', { p_slot: slotId, p_day: day });
  if (error) throw error;
}

export async function cancelClass(slotId: string, day: string) {
  const { error } = await supabase.rpc('cancel_booking', { p_slot: slotId, p_day: day });
  if (error) throw error;
}

export type RosterStatus = 'booked' | 'waitlist';

export type RosterEntry = {
  displayName: string;
  avatarUrl: string | null;
  status: RosterStatus;
};

type RosterRow = {
  display_name: string | null;
  avatar_url: string | null;
  status: string;
};

/** Liste des inscrits et de la liste d’attente — réservée au staff (RPC session_roster). */
export async function loadRoster(slotId: string, day: string): Promise<RosterEntry[]> {
  const { data, error } = await supabase.rpc('session_roster', { p_slot: slotId, p_day: day });
  if (error) throw error;
  return ((data || []) as RosterRow[])
    .map((r) => {
      const status = r.status === 'waitlist' ? 'waitlist' : r.status === 'booked' ? 'booked' : null;
      if (!status) return null;
      return {
        displayName: r.display_name?.trim() || 'Adhérent',
        avatarUrl: r.avatar_url,
        status,
      } satisfies RosterEntry;
    })
    .filter((r): r is RosterEntry => r != null);
}
