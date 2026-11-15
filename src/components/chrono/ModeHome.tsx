import { ChevronRight, Plus, Timer } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CHRONO_ICON_STROKE, ChronoIcon } from "@/components/chrono/ChronoIcon";
import {
  HOME_FORMATS,
  OTHER_FORMATS,
  type OtherFormatId,
} from "@/lib/chrono/defaults";
import type { HomeFormat } from "@/lib/chrono/types";
import {
  BorderRadius,
  FontSize,
  FontWeight,
  Height,
  Spacing,
  font,
  softShadow,
} from "@/lib/theme";
import { useBrand } from "@/providers/BoxProvider";

export function ModeHome({
  onSelect,
  onOther,
  onCreate,
}: {
  onSelect: (format: HomeFormat) => void;
  onOther: (id: OtherFormatId) => void;
  onCreate: () => void;
}) {
  const c = useBrand();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: c.primary, paddingTop: insets.top + Spacing.S },
        ]}
      >
        <ChronoIcon icon={Timer} size={24} color={c.accent} />
        <Text style={[styles.headerTitle, { color: c.onPrimary }]}>Chrono</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.question, { color: c.text }]}>
          Quel est ton WOD ?
        </Text>

        <View style={styles.grid}>
          {HOME_FORMATS.map((f) => (
            <Pressable
              key={f.id}
              accessibilityRole="button"
              onPress={() => onSelect(f.id)}
              style={({ pressed }) => [
                styles.card,
                softShadow,
                {
                  backgroundColor: c.surface,
                  borderColor: c.border,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <ChronoIcon icon={f.Icon} size={24} color={c.accent} />
              <Text style={[styles.cardTitle, { color: c.text }]}>
                {f.title}
              </Text>
              <Text style={[styles.cardDesc, { color: c.muted }]}>
                {f.desc}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onCreate}
          style={({ pressed }) => [
            styles.create,
            {
              backgroundColor: c.primary,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View style={[styles.createIcon, { backgroundColor: c.accent }]}>
            <Plus
              size={18}
              color={c.onAccent}
              strokeWidth={CHRONO_ICON_STROKE}
            />
          </View>
          <View style={styles.createCopy}>
            <Text style={[styles.createTitle, { color: c.onPrimary }]}>
              Créer mon chrono
            </Text>
            <Text style={[styles.createSub, { color: c.onPrimaryMuted }]}>
              Combine tes blocs, à ton rythme
            </Text>
          </View>
          <ChevronRight
            size={18}
            color={c.onPrimaryMuted}
            strokeWidth={CHRONO_ICON_STROKE}
          />
        </Pressable>

        <View style={styles.otherSection}>
          <Text style={[styles.otherTitle, { color: c.muted }]}>
            Autres formats
          </Text>
          <View style={styles.otherRow}>
            {OTHER_FORMATS.map((f) => (
              <Pressable
                key={f.id}
                accessibilityRole="button"
                onPress={() => onOther(f.id)}
                style={({ pressed }) => [
                  styles.pill,
                  softShadow,
                  {
                    backgroundColor: c.surface,
                    borderColor: c.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text style={[styles.pillTxt, { color: c.text }]}>
                  {f.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.S,
    paddingHorizontal: Spacing.M,
    paddingBottom: Spacing.M,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    fontWeight: FontWeight.SEMI_BOLD,
    marginRight: 22,
  },
  headerSpacer: { width: 22 },
  scroll: {
    paddingHorizontal: Spacing.M,
    paddingTop: Spacing.L,
    gap: Spacing.M,
  },
  question: {
    fontFamily: font.semibold,
    fontSize: FontSize.XXL,
    fontWeight: FontWeight.SEMI_BOLD,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.S,
  },
  card: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "46%",
    minHeight: 104,
    padding: Spacing.S,
    borderRadius: BorderRadius.L,
    borderWidth: 1,
    gap: Spacing.XXS,
  },
  cardTitle: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
    marginTop: Spacing.XXS,
  },
  cardDesc: {
    fontFamily: font.regular,
    fontSize: FontSize.XXS + 1,
    lineHeight: 16,
  },
  create: {
    minHeight: Height.PRESSABLE_M + 8,
    borderRadius: BorderRadius.L,
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.S,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.S,
  },
  createIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  createCopy: { flex: 1, gap: 2 },
  createTitle: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  createSub: {
    fontFamily: font.regular,
    fontSize: FontSize.XXS + 1,
  },
  otherSection: { gap: Spacing.XS },
  otherTitle: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
  otherRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.XS,
  },
  pill: {
    paddingHorizontal: Spacing.S,
    paddingVertical: Spacing.XS,
    borderRadius: BorderRadius.XL,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: "center",
  },
  pillTxt: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
});
