import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NoteForm } from '@/components/today/NoteForm';
import { useBlockScores } from '@/hooks/useBlockScores';
import { blockSubtitle, blockTitle } from '@/lib/scoring';
import { BorderRadius, Spacing, kindColor, softShadow, textStyles } from '@/lib/theme';
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
  const t = textStyles(c);
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
              paddingTop: Spacing.M,
              paddingBottom: Math.max(insets.bottom, Spacing.M),
            },
          ]}>
          <View style={styles.head}>
            <View style={{ flex: 1, gap: Spacing.XXS }}>
              <Text style={t.titleSection}>{blockTitle(block)}</Text>
              <View style={[styles.kindMark, { backgroundColor: accent }]} />
              {sub ? <Text style={t.bodySmall}>{sub}</Text> : null}
            </View>
            <Pressable
              onPress={close}
              hitSlop={12}
              accessibilityLabel="Fermer"
              style={[styles.closeBtn, softShadow, { backgroundColor: c.surface, borderColor: c.border }]}>
              <Ionicons name="close" size={18} color={c.muted} />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    height: '85%',
    borderTopLeftRadius: BorderRadius.XL,
    borderTopRightRadius: BorderRadius.XL,
    paddingHorizontal: Spacing.M,
    gap: Spacing.S,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.S,
  },
  kindMark: {
    width: 28,
    height: 2,
    borderRadius: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.FULL,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingBottom: Spacing.S,
    gap: Spacing.S,
    flexGrow: 1,
  },
});
