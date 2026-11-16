import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppDrawer } from '@/components/AppDrawer';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { HomeHeader } from '@/components/home/HomeHeader';
import { ReservationsSection } from '@/components/home/ReservationsSection';
import { loadAthlete, splitName } from '@/lib/athlete';
import { Spacing } from '@/lib/theme';
import { useAuth } from '@/providers/AuthProvider';
import { useBrand } from '@/providers/BoxProvider';

export default function HomeScreen() {
  const { session } = useAuth();
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const uid = session?.user?.id;
    if (!uid) {
      setFirstName('');
      setFullName('');
      setAvatarUrl(null);
      return;
    }
    const metaFull = (session.user.user_metadata?.full_name as string | undefined) || '';
    setFirstName(splitName(metaFull).firstName);
    setFullName(metaFull);
    loadAthlete(uid)
      .then((athlete) => {
        if (cancelled) return;
        if (athlete.firstName) setFirstName(athlete.firstName);
        if (athlete.fullName) setFullName(athlete.fullName);
        setAvatarUrl(athlete.avatarUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, session?.user?.user_metadata?.full_name]);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <HomeHeader
        firstName={firstName}
        fullName={fullName}
        avatarUrl={avatarUrl}
        onOpenMenu={() => setDrawerOpen(true)}
      />

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.XL },
        ]}
        showsVerticalScrollIndicator={false}>
        <ReservationsSection />
        <FeaturedSection />
      </ScrollView>
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    paddingTop: Spacing.L,
    gap: Spacing.XL,
  },
});
