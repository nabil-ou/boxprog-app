import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeaturedCard } from '@/components/home/FeaturedCard';
import { useCommunications } from '@/hooks/useCommunications';
import { toFeatured } from '@/lib/communications';
import { Spacing, textStyles } from '@/lib/theme';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export default function CommunicationsScreen() {
  const box = useActiveBox();
  const c = useBrand();
  const t = textStyles(c);
  const insets = useSafeAreaInsets();
  const { items, error } = useCommunications(box.id);
  const featured = (items ?? []).map((item) => toFeatured(item, box.name));

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      {items === null && !error ? (
        <ActivityIndicator color={c.primary} style={styles.spinner} />
      ) : error ? (
        <Text style={[t.body, styles.message, { color: c.muted }]}>{error}</Text>
      ) : featured.length === 0 ? (
        <Text style={[t.body, styles.message]}>Aucune communication pour l’instant.</Text>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L },
          ]}
          showsVerticalScrollIndicator={false}>
          {featured.map((item) => (
            <FeaturedCard key={item.id} item={item} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  spinner: { marginTop: Spacing.XXL },
  message: {
    marginTop: Spacing.XL,
    textAlign: 'center',
    paddingHorizontal: Spacing.M,
  },
  list: {
    padding: Spacing.M,
    gap: Spacing.M,
  },
});
