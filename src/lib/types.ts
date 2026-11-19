export type Role = 'owner' | 'admin' | 'coach' | 'member';
export type MemberStatus = 'active' | 'pending' | 'blocked';
export type Level = 'RX' | 'Inter' | 'Scaled';
export type TimerFormat = '' | 'amrap' | 'emom' | 'fortime' | 'tabata';
export type ScoreType = '' | 'rounds' | 'time' | 'load';
/** Type par défaut ou type personnalisé de la box. */
export type BlockKind = string;
export type PublishMode = 'now' | 'eve' | 'sunday';
/** closing : suppression demandée, effacement après 30 jours. unpaid : abonnement impayé ou résilié. */
export type BoxStatus = 'active' | 'suspended' | 'closing' | 'unpaid';

export type KindColors = Partial<Record<BlockKind, string>>;

/** Retour de la RPC box_public(slug) */
export interface BoxPublic {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  kind_colors: KindColors | null;
  custom_kinds: string[] | null;
  feedback_kinds?: string[] | null;
  training_days: number[];
  status: BoxStatus;
  require_approval: boolean;
  publish_mode: PublishMode;
  publish_hour: number;
  timezone: string;
  my_role: Role | null;
  my_status: MemberStatus | null;
  my_display_name: string | null;
  my_sex: 'F' | 'H' | null;
  my_level: Level | null;
  my_premium: boolean | null;
}

export type CycleMode = 'general' | 'own' | 'none';

export interface Track {
  id: string;
  name: string;
  color: string;
  is_default: boolean;
  position: number;
  member_id?: string | null;
  cycle_mode?: CycleMode;
}

export interface WorkoutDay {
  id: string;
  box_id: string;
  day: string; // YYYY-MM-DD
  publish_at: string | null;
  blocks: Block[];
}

export interface Block {
  id: string;
  day_id: string;
  box_id: string;
  position: number;
  title: string;
  kind: BlockKind;
  timer_format: TimerFormat;
  minutes: number;
  rx: string;
  scaled: string;
  beginner: string;
  tip: string;
  score_type: ScoreType;
  premium: boolean;
  feedback?: boolean | null;
}

export interface Feedback {
  id: string;
  block_id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export const FEEDBACK_MAX = 1000;

/** true forcé / false coupé / sinon selon feedback_kinds de la box. */
export const feedbackOn = (b: Pick<Block, 'kind' | 'feedback'>, box: Pick<BoxPublic, 'feedback_kinds'>) =>
  b.feedback ?? (box.feedback_kinds || []).includes(b.kind);

export interface Communication {
  id: string;
  box_id: string;
  title: string;
  body: string;
  cover_url: string | null;
  happens_on: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScoreRow {
  id: string;
  block_id: string;
  user_id: string;
  level: Level;
  value: number;
  membership: { display_name: string; sex: 'F' | 'H' | null } | null;
  bumps: { user_id: string }[];
}

export const LEVELS: Level[] = ['RX', 'Inter', 'Scaled'];

/** Couleurs par défaut des types de blocs ; une box peut les remplacer (boxes.kind_colors). */
export const KIND_COLORS: KindColors = {
  'Warm-up': '#CA8A04',
  'Mobilité': '#0D9488',
  Skill: '#7C3AED',
  Force: '#DC2626',
  'Haltérophilie': '#2563EB',
  Gymnastique: '#0891B2',
  WOD: '#DB2777',
  Accessoire: '#16A34A',
  'Développement athlétique': '#EA580C',
  'Cool down': '#64748B',
};

export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Propriétaire', admin: 'Admin', coach: 'Coach', member: 'Adhérent',
};
