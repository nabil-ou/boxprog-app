import { Trophy } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { PrimaryHeader } from '@/components/PrimaryHeader';
import { Spacing } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export default function RecordsScreen() {
  const c = useBrand();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader title="PR" icon={Trophy} />
      <View
        style={[
          styles.body,
          { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L },
        ]}>
        <EmptyState
          icon={Trophy}
          title="Records de la box"
          body="Tous les PR des adhérents au même endroit : charges, benchmarks et temps, avec leur historique."
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
