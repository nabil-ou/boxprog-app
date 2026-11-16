import { Users } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppDrawer } from '@/components/AppDrawer';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryHeader } from '@/components/PrimaryHeader';
import { Spacing } from '@/lib/theme';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export default function CommunityScreen() {
  const box = useActiveBox();
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader title="Communauté" onOpenMenu={() => setDrawerOpen(true)} />
      <View
        style={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L },
        ]}>
        <EmptyState
          icon={Users}
          title="Communauté à venir"
          body={`Bientôt : le fil social de ${box.name}, les défis entre athlètes et les moments forts de la box.`}
        />
      </View>
      <AppDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: {
    flex: 1,
    padding: Spacing.M,
    justifyContent: 'center',
  },
});
