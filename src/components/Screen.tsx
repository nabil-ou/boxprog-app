import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { useBrand } from '@/providers/BoxProvider';

/** Écran à contenu défilant sous un header de navigation. */
export function Screen({ children }: { children: ReactNode }) {
  const c = useBrand();
  return (
    <ScrollView
      style={{ backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic">
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
});
