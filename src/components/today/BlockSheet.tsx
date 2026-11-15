import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NoteForm } from '@/components/today/NoteForm';
import { useBlockScores } from '@/hooks/useBlockScores';
import { blockSubtitle, blockTitle } from '@/lib/scoring';
import { font, kindColor, radius, space, type as typeScale } from '@/lib/theme';
import { feedbackOn, type Block, type Feedback, type Level } from '@/lib/types';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export function BlockSheet({
  block,
  myFeedback,
  memberLevel,
  onClose,
}: {
  block: Block;
  myFeedback?: Feedback;
  memberLevel: Level;
  onClose: () => void;
}) {
  const box = useActiveBox();
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { mine, load } = useBlockScores(block, box.id);
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
              paddingBottom: Math.max(insets.bottom, space[4]),
            },
          ]}>
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: c.border }]} />
          </View>
          <View style={styles.head}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.title, { color: c.text, fontFamily: font.semibold }]}>{blockTitle(block)}</Text>
              <View style={[styles.kindMark, { backgroundColor: accent }]} />
              {sub ? <Text style={[styles.sub, { color: c.muted }]}>{sub}</Text> : null}
            </View>
            <Pressable onPress={close} hitSlop={12} accessibilityLabel="Fermer" style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={c.muted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}>
            <NoteForm
              block={block}
              mineScore={mine}
              mineFeedback={myFeedback}
              initialLevel={memberLevel}
              withFeedback={withFeedback}
              onSaved={() => {
                load();
                close();
              }}
            />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
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
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: space[4],
    gap: space[3],
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: space[2],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space[3],
  },
  title: {
    fontSize: typeScale.xl,
    fontWeight: typeScale.weight.semibold,
  },
  kindMark: {
    width: 28,
    height: 2,
    borderRadius: 1,
  },
  sub: {
    fontSize: typeScale.sm,
    fontWeight: typeScale.weight.regular,
  },
  closeBtn: {
    padding: space[1],
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingBottom: space[3],
    gap: space[3],
    flexGrow: 1,
  },
});
