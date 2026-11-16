import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import type { MockFeatured } from '@/components/home/mock';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function FeaturedCard({ item, onPress }: { item: MockFeatured; onPress?: () => void }) {
  const c = useBrand();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        softShadow,
        { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.94 : 1 },
      ]}>
      <View style={[styles.image, { backgroundColor: c.primary }]}>
        <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
          <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>{item.category}</Text>
        </View>
        <Text style={[styles.imageTitle, { color: c.onPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.meta, { color: c.muted }]}>
          {item.dateLabel} · {item.author}
        </Text>
        <Text style={[styles.title, { color: c.text }]}>{item.title}</Text>
        <Text style={[styles.excerpt, { color: c.muted }]}>{item.excerpt}</Text>
        <View style={styles.readRow}>
          <Text style={[styles.read, { color: c.primary }]}>Lire l’article</Text>
          <AppIcon icon={ArrowRight} size={14} color={c.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.L,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  image: {
    height: 140,
    padding: Spacing.M,
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.XS,
    paddingVertical: 4,
    borderRadius: BorderRadius.XS,
  },
  badgeText: {
    fontFamily: font.semibold,
    fontSize: FontSize.XXS,
    fontWeight: FontWeight.SEMI_BOLD,
    letterSpacing: 0.4,
  },
  imageTitle: {
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  body: {
    padding: Spacing.M,
    gap: Spacing.XS,
  },
  meta: {
    fontFamily: font.regular,
    fontSize: FontSize.XXS,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: FontSize.M,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  excerpt: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
    lineHeight: 18,
  },
  readRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: Spacing.XXS,
  },
  read: {
    fontFamily: font.semibold,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.SEMI_BOLD,
  },
});
