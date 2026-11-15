import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppIcon } from "@/components/AppIcon";
import { PR_CATEGORIES, type PrCategory } from "@/lib/records";
import { BorderRadius, FontSize, Spacing, font, softShadow } from "@/lib/theme";
import { useBrand } from "@/providers/BoxProvider";

export function PrCategoryRow({
  value,
  onChange,
}: {
  value: PrCategory;
  onChange: (c: PrCategory) => void;
}) {
  const c = useBrand();

  return (
    <View style={styles.row}>
      {PR_CATEGORIES.map((cat) => {
        const active = cat.id === value;
        return (
          <Pressable
            key={cat.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(cat.id)}
            style={({ pressed }) => [
              styles.tile,
              softShadow,
              {
                backgroundColor: active ? c.primary : c.surface,
                borderColor: active ? c.primary : c.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <AppIcon
              icon={cat.Icon}
              size={24}
              color={active ? c.accent : c.accent}
            />
            <Text
              style={[styles.label, { color: active ? c.onPrimary : c.text }]}
              numberOfLines={1}
            >
              {cat.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.XS,
  },
  tile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.XXS,
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.XXS,
    borderRadius: BorderRadius.M,
    borderWidth: 1,
    minHeight: 72,
  },
  label: {
    fontFamily: font.semibold,
    fontSize: FontSize.XXS + 1,
    textAlign: "center",
  },
});
