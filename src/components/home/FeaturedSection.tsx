import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { FeaturedCard } from '@/components/home/FeaturedCard';
import { useCommunications } from '@/hooks/useCommunications';
import { HOME_FEATURED_LIMIT, toFeatured } from '@/lib/communications';
import { FontSize, FontWeight, Spacing, font, textStyles } from '@/lib/theme';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export function FeaturedSection() {
  const c = useBrand();
  const t = textStyles(c);
  const box = useActiveBox();
  const { items, error } = useCommunications(box.id);
  const featured = (items ?? []).slice(0, HOME_FEATURED_LIMIT).map((item) => toFeatured(item, box.name));

  if (!error && (items === null || items.length === 0)) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={t.titleSection}>À la une à la box</Text>
        {items && items.length > HOME_FEATURED_LIMIT ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            style={styles.seeAll}
            onPress={() => router.push('/communications')}>
            <Text style={[styles.seeAllText, { color: c.accent }]}>Tout voir</Text>
            <AppIcon icon={ChevronRight} size={14} color={c.accent} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={[styles.empty, { color: c.muted }]}>{error}</Text>
      ) : (
        <View style={styles.list}>
          {featured.map((item) => (
            <FeaturedCard key={item.id} item={item} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.M,
    paddingHorizontal: Spacing.M,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
  list: {
    gap: Spacing.M,
  },
  empty: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
  },
});
