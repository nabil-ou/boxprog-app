import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { blockSubtitle, blockTitle, levelText } from '@/lib/scoring';
import { font, kindColor, radius, space, type as typeScale } from '@/lib/theme';
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
  const kind = kindColor(block.kind, kindColors);
  const withFeedback = feedbackOn(block, box);
  const scored = Boolean(block.score_type);
  const canNote = scored || withFeedback;
  const noteDone = scored ? myScore !== undefined : Boolean(myFeedback);
  const noteLabel = noteDone ? 'Modifier' : 'Noter';

  return (
    <View style={[styles.card, { backgroundColor: c.surface }]}>
      <View style={[styles.rail, { backgroundColor: kind }]} />
      <View style={styles.inner}>
        <View style={[styles.head, block.premium && styles.headPremium]}>
          <Text style={[styles.title, { color: c.text, fontFamily: font.semibold }]}>{blockTitle(block)}</Text>
          {subtitle ? (
            <Text style={[styles.sub, { color: c.muted, fontFamily: font.regular }]}>{subtitle}</Text>
          ) : null}
        </View>
        {block.premium ? (
          <View style={styles.crown} accessibilityLabel="Premium">
            <Ionicons name="ribbon" size={16} color={c.accent} />
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
              { backgroundColor: c.raised, opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}>
            <View style={styles.tipRow}>
              <Ionicons name="bulb-outline" size={16} color={c.secondary} />
              <Text style={[styles.tipLabel, { color: c.secondary, fontFamily: font.medium }]}>Coach tip</Text>
              <Ionicons name={tipOpen ? 'chevron-up' : 'chevron-down'} size={16} color={c.muted} />
            </View>
            {tipOpen ? <Text style={[styles.tipBody, { color: c.text }]}>{block.tip}</Text> : null}
          </Pressable>
        ) : null}

        {canNote ? (
          <View style={styles.actions}>
            <Pressable
              onPress={onNote}
              style={({ pressed }) => [
                styles.action,
                noteDone
                  ? { backgroundColor: c.raised }
                  : { backgroundColor: c.accent },
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}>
              <Text
                style={[
                  styles.actionLabel,
                  {
                    color: noteDone ? c.text : c.onAccent,
                    fontFamily: font.medium,
                  },
                ]}>
                {noteLabel}
              </Text>
            </Pressable>
            {scored ? (
              <Pressable
                onPress={onScores}
                style={({ pressed }) => [
                  styles.action,
                  styles.actionSecondary,
                  { backgroundColor: c.raised, opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
                ]}>
                <Ionicons name="people-outline" size={16} color={c.secondary} />
                <Text style={[styles.actionLabel, { color: c.secondary, fontFamily: font.medium }]}>
                  {scoreCount || 0} score{(scoreCount || 0) > 1 ? 's' : ''}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  rail: {
    width: 3,
  },
  inner: {
    flex: 1,
    padding: space[5],
    gap: space[3],
  },
  head: {
    gap: 2,
  },
  headPremium: {
    paddingRight: 24,
  },
  crown: {
    position: 'absolute',
    top: space[5],
    right: space[5],
    zIndex: 2,
  },
  title: {
    fontSize: typeScale.lg,
    fontWeight: typeScale.weight.semibold,
  },
  sub: {
    fontSize: typeScale.sm,
    fontWeight: typeScale.weight.regular,
  },
  body: {
    fontSize: typeScale.md,
    lineHeight: 22,
    fontWeight: typeScale.weight.regular,
  },
  tip: {
    borderRadius: radius.md,
    paddingVertical: space[3],
    paddingHorizontal: space[3],
    gap: space[2],
  },
  tipRow: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  tipLabel: {
    flex: 1,
    fontSize: typeScale.md,
    fontWeight: typeScale.weight.medium,
  },
  tipBody: {
    fontSize: typeScale.md,
    lineHeight: 22,
    paddingLeft: 24,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[2],
    marginTop: space[1],
  },
  action: {
    flexGrow: 1,
    minWidth: '40%',
    minHeight: 44,
    paddingVertical: space[3],
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space[2],
  },
  actionSecondary: {},
  actionLabel: {
    fontSize: typeScale.md,
    fontWeight: typeScale.weight.medium,
  },
});
