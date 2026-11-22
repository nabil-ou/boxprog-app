import { router } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BadgeThumb } from '@/components/profile/BadgeThumb';
import { useBadges } from '@/hooks/useBadges';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function BadgesPreview() {
  const c = useBrand();
  const { unlocked, recent, loading } = useBadges();

  return (
    <View style={[styles.card, softShadow, { backgroundColor: c.surface }]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: c.text }]}>Mes badges</Text>
          <Text style={[styles.sub, { color: c.muted }]}>
            {unlocked} mouvement{unlocked > 1 ? 's' : ''} débloqué{unlocked > 1 ? 's' : ''}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ma collection"
          hitSlop={8}
          onPress={() => router.push('/(tabs)/profil/badges')}>
          <Text style={[styles.link, { color: c.primary }]}>Collection →</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={c.primary} style={{ marginVertical: Spacing.M }} />
      ) : recent.length > 0 ? (
        <View style={styles.row}>
          {recent.map((badge) => (
            <BadgeThumb
              key={badge.id}
              badge={badge}
              size={76}
              onPress={() => router.push(`/(tabs)/profil/badges/${badge.id}`)}
            />
          ))}
        </View>
      ) : (
        <Text style={[styles.empty, { color: c.muted }]}>
          Ajoute un PR gym pour débloquer ton premier badge
        </Text>
      )}

      <Text style={[styles.caption, { color: c.secondary }]}>
        Chaque nouveau mouvement mérite son badge
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.XL,
    padding: Spacing.L,
    gap: Spacing.M,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.S,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: FontSize.M,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  sub: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
  link: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.XS,
  },
  empty: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
    textAlign: 'center',
    paddingVertical: Spacing.M,
  },
  caption: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
