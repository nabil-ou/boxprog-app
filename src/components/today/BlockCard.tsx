import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { blockSubtitle, blockTitle, levelText } from '@/lib/scoring';
import { symbol } from '@/lib/symbols';
import { kindColor } from '@/lib/theme';
import { feedbackOn, type Block, type BoxPublic, type Feedback, type KindColors, type Level } from '@/lib/types';
import { useBrand } from '@/providers/BoxProvider';

export function BlockCard({
  block,
  level,
  kindColors,
  box,
  myScore,
  scoreCount,
  myFeedback,
  onNote,
  onScores,
}: {
  block: Block;
  level: Level;
  kindColors?: KindColors | null;
  box: Pick<BoxPublic, 'feedback_kinds'>;
  myScore?: number;
  scoreCount?: number;
  myFeedback?: Feedback;
  onNote: () => void;
  onScores: () => void;
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
  const noteLabel = noteDone ? 'Modifier' : 'Noter';
  const tipTint = soft(c.accent);

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
      <View style={[styles.head, block.premium && styles.headPremium]}>
        <Text style={[styles.title, { color: c.text }]}>{blockTitle(block)}</Text>
        {subtitle ? <Text style={[styles.sub, { color: c.muted }]}>{subtitle}</Text> : null}
      </View>
      {block.premium ? (
        <View style={styles.crown} accessibilityLabel="Premium">
          <Text style={[styles.crownGlyph, { color: c.accent }]}>♛</Text>
        </View>
      ) : null}
      {body ? <Text style={[styles.body, { color: c.text }]}>{body}</Text> : null}
      {block.tip ? (
        <Pressable
          onPress={() => setTipOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityState={{ expanded: tipOpen }}
          style={({ pressed }) => [
            styles.tip,
            { backgroundColor: tipTint, opacity: pressed ? 0.9 : 1 },
          ]}>
          <View style={styles.tipRow}>
            <SymbolView name={symbol('lightbulb.fill', 'emoji_objects')} tintColor={c.ink} size={16} />
            <Text style={[styles.tipLabel, { color: c.ink }]}>Coach tip</Text>
            <SymbolView
              name={symbol(tipOpen ? 'chevron.up' : 'chevron.down', tipOpen ? 'expand_less' : 'expand_more')}
              tintColor={c.ink}
              size={16}
            />
          </View>
          {tipOpen ? <Text style={[styles.tipBody, { color: c.text }]}>{block.tip}</Text> : null}
        </Pressable>
      ) : null}

      {canNote ? (
        <View style={styles.actions}>
          <Action label={noteLabel} done={noteDone} onPress={onNote} tint={accent} />
          {scored ? (
            <Action
              label={`${scoreCount || 0} score${(scoreCount || 0) > 1 ? 's' : ''}`}
              onPress={onScores}
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
    overflow: 'visible',
  },
  head: {
    gap: 2,
  },
  headPremium: {
    paddingRight: 28,
  },
  crown: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  crownGlyph: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  sub: {
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  tip: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  tipRow: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  tipBody: {
    fontSize: 15,
    lineHeight: 22,
    paddingLeft: 24,
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
