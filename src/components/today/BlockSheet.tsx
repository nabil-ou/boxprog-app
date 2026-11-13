import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeedbackForm } from '@/components/today/FeedbackForm';
import { Leaderboard } from '@/components/today/Leaderboard';
import { ScoreForm } from '@/components/today/ScoreForm';
import { useBlockScores } from '@/hooks/useBlockScores';
import { blockSubtitle, blockTitle } from '@/lib/scoring';
import { kindColor } from '@/lib/theme';
import { feedbackOn, type Block, type Feedback, type Level } from '@/lib/types';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export type SheetTab = 'note' | 'scores';

export function BlockSheet({
  block,
  initialTab,
  myFeedback,
  memberLevel,
  onClose,
}: {
  block: Block;
  initialTab: SheetTab;
  myFeedback?: Feedback;
  memberLevel: Level;
  onClose: () => void;
}) {
  const box = useActiveBox();
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [tab, setTab] = useState<SheetTab>(initialTab === 'scores' && block.score_type ? 'scores' : 'note');
  const [lbLvl, setLbLvl] = useState<Level>(memberLevel);
  const [fb, setFb] = useState(myFeedback);
  const { rows, me, mine, load, toggleBump } = useBlockScores(block, box.id);
  const scored = Boolean(block.score_type);
  const withFeedback = feedbackOn(block, box);
  const accent = kindColor(block.kind, box.kind_colors);
  const sub = block.timer_format ? blockSubtitle(block) : '';
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 280 });
  }, [progress]);

  const close = () => {
    progress.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height }],
  }));

  return (
    <Modal visible animationType="none" transparent statusBarTranslucent onRequestClose={close}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.fill} onPress={close} accessibilityLabel="Fermer" />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            {
              backgroundColor: c.surface,
              borderTopColor: accent,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}>
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: c.border }]} />
          </View>
          <View style={styles.head}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: c.text }]}>{blockTitle(block)}</Text>
              {sub ? <Text style={[styles.sub, { color: c.muted }]}>{sub}</Text> : null}
            </View>
            <Pressable onPress={close} hitSlop={12}>
              <Text style={[styles.close, { color: c.ink }]}>Fermer</Text>
            </Pressable>
          </View>

          {scored ? (
            <View style={[styles.tabs, { backgroundColor: c.background }]}>
              <Tab label={mine ? 'Mon score' : 'Noter'} active={tab === 'note'} onPress={() => setTab('note')} />
              <Tab
                label={rows ? `${rows.length} score${rows.length > 1 ? 's' : ''}` : 'Scores'}
                active={tab === 'scores'}
                onPress={() => setTab('scores')}
              />
            </View>
          ) : null}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}>
            {tab === 'scores' && scored ? (
              <Leaderboard block={block} rows={rows} me={me} onBump={toggleBump} level={lbLvl} setLevel={setLbLvl} />
            ) : (
              <View style={styles.note}>
                {scored ? (
                  <ScoreForm
                    block={block}
                    mine={mine}
                    initialLevel={memberLevel}
                    onSaved={(l) => {
                      setLbLvl(l);
                      load();
                    }}
                  />
                ) : null}
                {withFeedback ? (
                  <>
                    {scored ? <View style={[styles.sep, { backgroundColor: c.border }]} /> : null}
                    <FeedbackForm block={block} mine={fb} onSaved={(f) => setFb(f ?? undefined)} />
                  </>
                ) : null}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const c = useBrand();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && { backgroundColor: c.surface }]}>
      <Text style={{ color: active ? c.text : c.muted, fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fill: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 4,
    paddingHorizontal: 16,
    gap: 12,
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  sub: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  close: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingBottom: 12,
    gap: 12,
    flexGrow: 1,
  },
  note: {
    gap: 16,
  },
  sep: {
    height: StyleSheet.hairlineWidth,
  },
});
