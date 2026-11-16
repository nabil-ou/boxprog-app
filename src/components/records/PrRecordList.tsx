import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import {
  formatPrValue,
  type PrFamily,
  type PrMovement,
} from "@/lib/records";
import {
  BorderRadius,
  font,
  FontSize,
  FontWeight,
  softShadow,
  Spacing,
} from "@/lib/theme";
import { useBrand } from "@/providers/BoxProvider";

export function PrRecordList({
  title,
  groups,
  values,
}: {
  title: string;
  groups: { family: PrFamily; items: PrMovement[] }[];
  /** Meilleure valeur déjà enregistrée, par id de mouvement. */
  values: Record<string, number>;
}) {
  const c = useBrand();

  if (!groups.length) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.hint, { color: c.muted }]}>
          Aucun mouvement pour ces filtres.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {groups.map(({ family, items }) => (
        <View
          key={family.id}
          style={[
            styles.group,
            softShadow,
            { backgroundColor: c.surface, borderColor: c.border },
          ]}
        >
          <View style={[styles.groupHead, { backgroundColor: c.neutral }]}>
            <Text style={[styles.groupLabel, { color: c.muted }]}>
              {family.label.toUpperCase()}
            </Text>
          </View>
          {items.map((m, i) => {
            const pr = values[m.id];
            const last = i === items.length - 1;
            return (
              <Pressable
                key={m.id}
                accessibilityRole="button"
                onPress={() => router.push(`/(tabs)/records/${m.id}`)}
                style={({ pressed }) => [
                  styles.row,
                  !last && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: c.border,
                  },
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={[styles.name, { color: c.text }]}>{m.name}</Text>
                <View style={styles.valueRow}>
                  <Text
                    style={[
                      styles.value,
                      { color: pr != null ? c.text : c.muted },
                    ]}
                  >
                    {pr != null ? formatPrValue(pr, m.unit) : "—"}
                  </Text>
                  <AppIcon icon={ChevronRight} size={16} color={c.muted} />
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.S },
  title: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  group: {
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    overflow: "hidden",
  },
  groupHead: {
    paddingHorizontal: Spacing.S,
    paddingVertical: Spacing.XS,
  },
  groupLabel: {
    fontFamily: font.medium,
    fontSize: FontSize.XXS + 1,
    fontWeight: FontWeight.MEDIUM,
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.S,
    paddingVertical: Spacing.S,
    gap: Spacing.S,
    minHeight: 48,
  },
  name: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: FontSize.S,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.XXS,
  },
  value: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
    fontVariant: ["tabular-nums"],
  },
  hint: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: Spacing.XS,
  },
  empty: {
    paddingVertical: Spacing.L,
  },
});
