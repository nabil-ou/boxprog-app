import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { initials } from '@/components/Avatar';
import { BRAND_FALLBACK } from '@/config/box';
import { useBox, useBrand } from '@/providers/BoxProvider';

/** Écran hors onglets (connexion, adhésion, attente) : marque de la box en haut, carte blanche dessous. */
export function BrandScreen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { box } = useBox();
  const c = useBrand();
  const name = box?.name || BRAND_FALLBACK.name;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.primary }]}>
      <StatusBar style={c.onPrimary === '#FFFFFF' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets>
        <View style={styles.brand}>
          {box?.logo_url ? (
            <Image source={{ uri: box.logo_url }} style={styles.logo} resizeMode="contain" />
          ) : (
            <View style={[styles.logo, styles.monogram, { backgroundColor: c.accent }]}>
              <Text style={[styles.monogramText, { color: c.onAccent }]}>{initials(name)}</Text>
            </View>
          )}
          <Text style={[styles.boxName, { color: c.onPrimary }]}>{name}</Text>
          {box?.tagline ? <Text style={[styles.tagline, { color: c.onPrimaryMuted }]}>{box.tagline}</Text> : null}
        </View>

        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: c.muted }]}>{subtitle}</Text> : null}
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 28,
  },
  brand: {
    alignItems: 'center',
    gap: 6,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    marginBottom: 8,
  },
  monogram: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  monogramText: {
    fontSize: 28,
    fontWeight: '800',
  },
  boxName: {
    fontSize: 28,
    fontWeight: '800',
  },
  tagline: {
    fontSize: 15,
  },
  card: {
    borderRadius: 22,
    padding: 22,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: -8,
  },
});
