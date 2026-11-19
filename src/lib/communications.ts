import { iso, mediumDate } from '@/lib/dates';
import { supabase } from '@/lib/supabase';
import type { Communication } from '@/lib/types';

const COLUMNS = 'id, box_id, title, body, cover_url, happens_on, published_at, created_at, updated_at';

/** Nombre de communications montrées sur la home avant « Tout voir ». */
export const HOME_FEATURED_LIMIT = 2;

export type FeaturedCommunication = {
  id: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  author: string;
  coverUrl: string | null;
  badge?: string;
};

export function communicationExcerpt(body: string): string {
  const t = body.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  return t.length > 110 ? t.slice(0, 109).trimEnd() + '…' : t;
}

export function publishedDateLabel(publishedAt: string): string {
  return mediumDate(iso(new Date(publishedAt)));
}

export function teamLabel(boxName: string): string {
  return `L’équipe ${boxName}`;
}

export function toFeatured(item: Communication, boxName: string): FeaturedCommunication {
  return {
    id: item.id,
    title: item.title,
    excerpt: communicationExcerpt(item.body),
    dateLabel: item.published_at ? publishedDateLabel(item.published_at) : '',
    author: teamLabel(boxName),
    coverUrl: item.cover_url,
    badge: item.happens_on ? 'ÉVÉNEMENT' : undefined,
  };
}

function publishedQuery(boxId: string) {
  return supabase
    .from('communications')
    .select(COLUMNS)
    .eq('box_id', boxId)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString());
}

export async function loadPublishedCommunications(boxId: string): Promise<Communication[]> {
  const { data, error } = await publishedQuery(boxId).order('published_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Communication[];
}

export async function loadCommunication(boxId: string, id: string): Promise<Communication | null> {
  const { data, error } = await publishedQuery(boxId).eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Communication | null) ?? null;
}
