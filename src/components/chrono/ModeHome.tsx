import { ChevronRight, Plus, Star, Timer, X } from "lucide-react-native";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { APP_ICON_STROKE, AppIcon } from "@/components/AppIcon";
import { PrimaryHeader } from "@/components/PrimaryHeader";
import { HOME_FORMATS, mixTotalSeconds } from "@/lib/chrono/defaults";
import { fmt } from "@/lib/chrono/format";
import type { HomeFormat, MixFavorite } from "@/lib/chrono/types";
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

function favoriteSummary(fav: MixFavorite): string {
  const n = fav.mix.length;
  const total = mixTotalSeconds(fav.mix);
  return `${n} bloc${n > 1 ? "s" : ""}${total > 0 ? ` • ${fmt(total)}` : ""}`;
}

export function ModeHome({
  onSelect,
  onCreate,
  onBack,
  favorites,
  onOpenFavorite,
  onDeleteFavorite,
}: {
  onSelect: (format: HomeFormat) => void;
  onCreate: () => void;
  onBack: () => void;
  favorites: MixFavorite[];
  onOpenFavorite: (id: string) => void;
  onDeleteFavorite: (id: string) => void;
}) {
  const c = useBrand();
  const insets = useSafeAreaInsets();

  const confirmDelete = (fav: MixFavorite) => {
    Alert.alert("Supprimer ce favori ?", `« ${fav.name} » sera retiré de tes favoris.`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => onDeleteFavorite(fav.id),
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader
        title="Chrono"
        onBack={onBack}
        right={
          <Timer size={22} color={c.accent} strokeWidth={APP_ICON_STROKE} />
        }
      />

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
              <AppIcon icon={f.Icon} size={24} color={c.accent} />
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
              strokeWidth={APP_ICON_STROKE}
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
            strokeWidth={APP_ICON_STROKE}
          />
        </Pressable>

        {favorites.length > 0 ? (
          <View style={styles.favSection}>
            <Text style={[styles.sectionLabel, { color: c.muted }]}>
              Mes favoris
            </Text>
            {favorites.map((fav) => (
              <Pressable
                key={fav.id}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir ${fav.name}`}
                onPress={() => onOpenFavorite(fav.id)}
                style={({ pressed }) => [
                  styles.favRow,
                  softShadow,
                  {
                    backgroundColor: c.surface,
                    borderColor: c.border,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
              >
                <Star
                  size={18}
                  color={c.accent}
                  fill={c.accent}
                  strokeWidth={APP_ICON_STROKE}
                />
                <View style={styles.favCopy}>
                  <Text
                    style={[styles.favName, { color: c.text }]}
                    numberOfLines={1}
                  >
                    {fav.name}
                  </Text>
                  <Text style={[styles.favSub, { color: c.muted }]}>
                    {favoriteSummary(fav)}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Supprimer ${fav.name}`}
                  hitSlop={8}
                  onPress={() => confirmDelete(fav)}
                  style={[
                    styles.favDelete,
                    { borderColor: c.border, backgroundColor: c.raised },
                  ]}
                >
                  <X size={16} color={c.muted} strokeWidth={APP_ICON_STROKE} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  favSection: { gap: Spacing.XS },
  sectionLabel: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
  },
  favRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.S,
    minHeight: Height.PRESSABLE_M,
    paddingVertical: Spacing.S,
    paddingHorizontal: Spacing.S,
    borderRadius: BorderRadius.L,
    borderWidth: 1,
  },
  favCopy: { flex: 1, gap: 2 },
  favName: {
    fontFamily: font.semibold,
    fontSize: FontSize.S,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  favSub: {
    fontFamily: font.regular,
    fontSize: FontSize.XXS + 1,
  },
  favDelete: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.S,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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
});
