import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { FeaturedCard } from '@/components/home/FeaturedCard';
import { MOCK_FEATURED } from '@/components/home/mock';
import { FontSize, FontWeight, Spacing, font, textStyles } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function FeaturedSection() {
  const c = useBrand();
  const t = textStyles(c);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={t.titleSection}>À la une à la box</Text>
        <Pressable accessibilityRole="button" hitSlop={8} style={styles.seeAll}>
          <Text style={[styles.seeAllText, { color: c.accent }]}>Tout voir</Text>
          <AppIcon icon={ChevronRight} size={14} color={c.accent} />
        </Pressable>
      </View>

      <View style={styles.list}>
        {MOCK_FEATURED.map((item) => (
          <FeaturedCard key={item.id} item={item} />
        ))}
      </View>
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
});
