import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChronoBuilder } from '@/components/chrono/ChronoBuilder';
import { APP_ICON_STROKE } from '@/components/AppIcon';
import { BorderRadius, FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';
import { useChronoConfig } from '@/providers/ChronoProvider';

export default function ChronoSetupScreen() {
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<Record<string, string>>();
  const { cfg, patch, setMix, sessionName, setSessionName, applySetupParams } = useChronoConfig();

  useEffect(() => {
    if (params.mode) applySetupParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.mode, params.amrap, params.cap, params.iv, params.rounds, params.tw, params.tr, params.tn]);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.primary, paddingTop: insets.top + Spacing.S }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Retour"
          style={styles.headerBtn}>
          <ChevronLeft size={22} color={c.onPrimary} strokeWidth={APP_ICON_STROKE} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.onPrimary }]}>Mon chrono</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L },
        ]}
        keyboardShouldPersistTaps="handled">
        <ChronoBuilder
          cfg={cfg}
          sessionName={sessionName}
          onSessionName={setSessionName}
          onChange={patch}
          onMix={setMix}
          onStart={() => router.push('/(tabs)/chrono/run')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.S,
    paddingBottom: Spacing.M,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.M,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  scroll: {
    paddingHorizontal: Spacing.M,
    paddingTop: Spacing.M,
    gap: Spacing.S,
  },
});
