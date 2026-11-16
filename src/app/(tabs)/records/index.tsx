import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppDrawer } from "@/components/AppDrawer";
import { PrimaryHeader } from "@/components/PrimaryHeader";
import { PrCategoryRow } from "@/components/records/PrCategoryRow";
import { PrFamilyChips } from "@/components/records/PrFamilyChips";
import { PrRecordList } from "@/components/records/PrRecordList";
import { PrSearch } from "@/components/records/PrSearch";
import {
  familiesForCategory,
  filterMovements,
  groupByFamily,
  listTitleForCategory,
  type PrCategory,
  type PrFamilyId,
} from "@/lib/records";
import { FontSize, Spacing, font } from "@/lib/theme";
import { useBrand } from "@/providers/BoxProvider";
import { usePersonalRecords } from "@/providers/RecordsProvider";

export default function RecordsScreen() {
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const { bestByMovement, error } = usePersonalRecords();
  const [category, setCategory] = useState<PrCategory>("lift");
  const [family, setFamily] = useState<PrFamilyId | "all">("all");
  const [query, setQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const families = useMemo(() => familiesForCategory(category), [category]);

  const groups = useMemo(() => {
    const items = filterMovements(category, family, query);
    return groupByFamily(items);
  }, [category, family, query]);

  const onCategoryChange = (next: PrCategory) => {
    setCategory(next);
    setFamily("all");
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader title="Mes PR" onOpenMenu={() => setDrawerOpen(true)} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {error ? <Text style={[styles.error, { color: c.danger }]}>{error}</Text> : null}
        <PrSearch value={query} onChangeText={setQuery} />
        <PrCategoryRow value={category} onChange={onCategoryChange} />
        <PrFamilyChips
          families={families}
          value={family}
          onChange={setFamily}
        />
        <PrRecordList title={listTitleForCategory(category)} groups={groups} values={bestByMovement} />
      </ScrollView>
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.M,
    paddingTop: Spacing.M,
    gap: Spacing.M,
  },
  error: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
});
