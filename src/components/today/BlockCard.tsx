import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { blockSubtitle, blockTitle, levelText } from "@/lib/scoring";
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Height,
  Spacing,
  font,
  kindColor,
  softShadow,
  tint,
} from "@/lib/theme";
import {
  feedbackOn,
  type Block,
  type BoxPublic,
  type Feedback,
  type KindColors,
  type Level,
} from "@/lib/types";
import { useBrand } from "@/providers/BoxProvider";

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const TIP_MS = 220;

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
  box: Pick<BoxPublic, "feedback_kinds">;
  myScore?: number;
  scoreCount?: number;
  myFeedback?: Feedback;
  onNote: () => void;
  onScores: () => void;
}) {
  const c = useBrand();
  const reduced = useReducedMotion();
  const [tipOpen, setTipOpen] = useState(false);
  const subtitle = blockSubtitle(block);
  const body = levelText(block, level);
  const kind = kindColor(block.kind, kindColors);
  const withFeedback = feedbackOn(block, box);
  const scored = Boolean(block.score_type);
  const canNote = scored || withFeedback;
  const noteDone = scored ? myScore !== undefined : Boolean(myFeedback);
  const noteLabel = noteDone ? "Modifier" : "Noter";

  const tipProgress = useSharedValue(0);
  const tipHeight = useSharedValue(0);

  useEffect(() => {
    setTipOpen(false);
    tipProgress.value = 0;
  }, [block.id, tipProgress]);

  useEffect(() => {
    tipProgress.value = reduced
      ? tipOpen
        ? 1
        : 0
      : withTiming(tipOpen ? 1 : 0, { duration: TIP_MS, easing: EASE_OUT });
  }, [tipOpen, reduced, tipProgress]);

  const tipBodyStyle = useAnimatedStyle(() => ({
    height: tipProgress.value * tipHeight.value,
    opacity: tipProgress.value,
    transform: [
      { translateY: interpolate(tipProgress.value, [0, 1], [-4, 0]) },
    ],
    overflow: "hidden" as const,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(tipProgress.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const tipInk = c.primary;
  const copy = "#3A3A39";
  const tipWash = tint(c.primary, 0.92);
  const tipBorder = tint(c.primary, 0.78);
  const tipIconBg = tint(c.primary, 0.82);
  const editFill = tint(c.accent, 0.88);
  const editBorder = tint(c.accent, 0.55);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      <View style={[styles.rail, { backgroundColor: kind }]} />
      <View style={styles.inner}>
        <View style={[styles.head, block.premium && styles.headPremium]}>
          <Text style={[styles.title, { color: c.text }]}>
            {blockTitle(block)}
          </Text>
          {subtitle ? (
            <Text style={[styles.meta, { color: copy }]}>{subtitle}</Text>
          ) : null}
        </View>
        {block.premium ? (
          <View style={styles.crown} accessibilityLabel="Premium">
            <Ionicons name="ribbon-outline" size={16} color={c.accent} />
          </View>
        ) : null}
        {body ? (
          <Text style={[styles.body, { color: copy }]}>{body}</Text>
        ) : null}

        {block.tip ? (
          <Pressable
            onPress={() => setTipOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityState={{ expanded: tipOpen }}
            style={({ pressed }) => [
              styles.tip,
              {
                backgroundColor: tipWash,
                borderColor: tipBorder,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
          >
            <View style={styles.tipRow}>
              <View style={[styles.tipIcon, { backgroundColor: tipIconBg }]}>
                <Ionicons name="bulb" size={13} color={tipInk} />
              </View>
              <Text style={[styles.tipLabel, { color: copy }]}>
                Coach tip
              </Text>
              <Animated.View style={chevronStyle}>
                <Ionicons name="chevron-down" size={14} color={tipInk} />
              </Animated.View>
            </View>
            <View>
              <View
                style={styles.tipMeasure}
                pointerEvents="none"
                onLayout={(e) => {
                  tipHeight.value = e.nativeEvent.layout.height;
                }}
              >
                <Text style={[styles.tipBody, { color: copy }]}>
                  {block.tip}
                </Text>
              </View>
              <Animated.View style={tipBodyStyle}>
                <Text style={[styles.tipBody, { color: copy }]}>
                  {block.tip}
                </Text>
              </Animated.View>
            </View>
          </Pressable>
        ) : null}

        {canNote ? (
          <View style={styles.actions}>
            <Pressable
              onPress={onNote}
              style={({ pressed }) => [
                styles.action,
                noteDone
                  ? { backgroundColor: editFill, borderColor: editBorder }
                  : [
                      { backgroundColor: c.accent, borderColor: c.accent },
                      softShadow,
                    ],
                {
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <Ionicons
                name={noteDone ? "create-outline" : "add-circle-outline"}
                size={15}
                color={noteDone ? c.accent : c.onAccent}
              />
              <Text
                style={[
                  styles.actionLabel,
                  {
                    color: noteDone ? c.accent : c.onAccent,
                    fontFamily: font.medium,
                  },
                ]}
              >
                {noteLabel}
              </Text>
            </Pressable>
            {scored ? (
              <Pressable
                onPress={onScores}
                style={({ pressed }) => [
                  styles.action,
                  {
                    backgroundColor: c.raised,
                    borderColor: c.border,
                    opacity: pressed ? 0.88 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <Ionicons name="people-outline" size={14} color={c.secondary} />
                <Text
                  style={[
                    styles.actionLabel,
                    { color: c.text, fontFamily: font.medium },
                  ]}
                >
                  {scoreCount || 0} score{(scoreCount || 0) > 1 ? "s" : ""}
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
    borderRadius: BorderRadius.L,
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
  },
  rail: {
    width: 3,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.M,
    paddingVertical: Spacing.M,
    gap: Spacing.S,
  },
  head: {
    gap: 4,
  },
  headPremium: {
    paddingRight: 24,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    fontWeight: FontWeight.SEMI_BOLD,
    lineHeight: 24,
    letterSpacing: -0.4,
  },
  meta: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.NORMAL,
    lineHeight: 16,
  },
  body: {
    fontFamily: font.semibold,
    fontSize: FontSize.XS,
    lineHeight: 18,
  },
  crown: {
    position: "absolute",
    top: Spacing.M,
    right: Spacing.M,
    zIndex: 2,
  },
  tip: {
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.S,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.XS,
  },
  tipIcon: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.FULL,
    alignItems: "center",
    justifyContent: "center",
  },
  tipLabel: {
    flex: 1,
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
    lineHeight: 16,
  },
  tipMeasure: {
    position: "absolute",
    left: 0,
    right: 0,
    opacity: 0,
    zIndex: -1,
  },
  tipBody: {
    fontFamily: font.semibold,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.SEMI_BOLD,
    lineHeight: 18,
    paddingLeft: 30,
    paddingTop: Spacing.XS,
    color: '#3A3A39',
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.XS,
    marginTop: Spacing.XXS,
  },
  action: {
    flexGrow: 1,
    minWidth: "40%",
    minHeight: Height.PRESSABLE_S,
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.S,
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.XS,
  },
  actionLabel: {
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
});
