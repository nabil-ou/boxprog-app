import { Megaphone } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { PrimaryHeader } from '@/components/PrimaryHeader';
import { Spacing } from '@/lib/theme';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export default function NewsScreen() {
  const box = useActiveBox();
  const c = useBrand();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader title="Actus" icon={Megaphone} />
      <View
        style={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L },
        ]}>
        <EmptyState
          icon={Megaphone}
          title="Les actus de la box"
          body={`Les annonces de ${box.name} arriveront ici, sous forme de fil d’actualité : événements, horaires, nouveautés.`}
        />
      </View>
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
