import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { blockSubtitle, blockTitle, levelText, showScore } from '@/lib/scoring';
import { kindColor } from '@/lib/theme';
import { feedbackOn, type Block, type BoxPublic, type Feedback, type KindColors, type Level } from '@/lib/types';
import { useBrand } from '@/providers/BoxProvider';

import type { SheetTab } from './BlockSheet';

export function BlockCard({
  block,
  level,
  kindColors,
  box,
  myScore,
  scoreCount,
  myFeedback,
  onOpen,
}: {
  block: Block;
  level: Level;
  kindColors?: KindColors | null;
  box: Pick<BoxPublic, 'feedback_kinds'>;
  myScore?: number;
  scoreCount?: number;
  myFeedback?: Feedback;
  onOpen: (tab: SheetTab) => void;
}) {
  const c = useBrand();
  const [tipOpen, setTipOpen] = useState(false);
  const subtitle = blockSubtitle(block);
  const body = levelText(block, level);
  const accent = kindColor(block.kind, kindColors);
  const withFeedback = feedbackOn(block, box);
  const scored = Boolean(block.score_type);
  const canNote = scored || withFeedback;
  const noteDone = scored ? myScore !== undefined : Boolean(myFeedback);
  const noteLabel = scored && myScore !== undefined ? showScore(block.score_type, myScore) : noteDone ? 'Noté' : 'Noter';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.surface,
          borderColor: c.border,
          borderLeftColor: accent,
        },
      ]}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: c.text }]}>{blockTitle(block)}</Text>
        {subtitle ? <Text style={[styles.sub, { color: c.muted }]}>{subtitle}</Text> : null}
        {block.premium ? (
          <View style={[styles.badge, { backgroundColor: c.accent }]}>
            <Text style={[styles.badgeText, { color: c.onAccent }]}>Premium</Text>
          </View>
        ) : null}
      </View>
      {body ? <Text style={[styles.body, { color: c.text }]}>{body}</Text> : null}
      {block.tip ? (
        <Pressable onPress={() => setTipOpen((o) => !o)} style={styles.tipBtn}>
          <Text style={[styles.tipLabel, { color: c.ink }]}>{tipOpen ? 'Masquer le tip' : 'Coach tip'}</Text>
          {tipOpen ? <Text style={[styles.tipBody, { color: c.muted }]}>{block.tip}</Text> : null}
        </Pressable>
      ) : null}

      {canNote ? (
        <View style={styles.actions}>
          <Action label={noteLabel} done={noteDone} onPress={() => onOpen('note')} tint={accent} />
          {scored ? (
            <Action
              label={`${scoreCount || 0} score${(scoreCount || 0) > 1 ? 's' : ''}`}
              onPress={() => onOpen('scores')}
              tint={accent}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function Action({
  label,
  onPress,
  done,
  tint,
}: {
  label: string;
  onPress: () => void;
  done?: boolean;
  tint: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: done ? tint : soft(tint),
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <Text style={[styles.actionLabel, { color: done ? '#FFFFFF' : tint }]}>{label}</Text>
    </Pressable>
  );
}

function soft(hex: string) {
  const h = hex.replace('#', '');
  if (h.length !== 6) return '#F3F4F6';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (v: number) => Math.round(v * 0.16 + 255 * 0.84);
  return `#${[r, g, b].map((v) => mix(v).toString(16).padStart(2, '0')).join('')}`;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 5,
    padding: 16,
    gap: 10,
  },
  head: {
    gap: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  sub: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  tipBtn: {
    gap: 6,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  tipBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  action: {
    flexGrow: 1,
    minWidth: '40%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
});
