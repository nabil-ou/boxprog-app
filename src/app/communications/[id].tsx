import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { loadCommunication, publishedDateLabel, teamLabel } from '@/lib/communications';
import { mediumDate } from '@/lib/dates';
import { errMsg } from '@/lib/supabase';
import { FontSize, FontWeight, Spacing, font, textStyles } from '@/lib/theme';
import type { Communication } from '@/lib/types';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export default function CommunicationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const box = useActiveBox();
  const c = useBrand();
  const t = textStyles(c);
  const insets = useSafeAreaInsets();
  const [item, setItem] = useState<Communication | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Communication introuvable.');
      setItem(null);
      return;
    }
    let alive = true;
    loadCommunication(box.id, id)
      .then((row) => {
        if (!alive) return;
        setItem(row);
        setError(row ? null : 'Communication introuvable.');
      })
      .catch((e) => {
        if (!alive) return;
        setItem(null);
        setError(errMsg(e));
      });
    return () => {
      alive = false;
    };
  }, [box.id, id]);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <Stack.Screen options={{ title: item?.title ?? 'Communication' }} />
      {!item && !error ? (
        <ActivityIndicator color={c.primary} style={styles.spinner} />
      ) : error || !item ? (
        <Text style={[t.body, styles.message, { color: c.muted }]}>{error || 'Communication introuvable.'}</Text>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L }}
          showsVerticalScrollIndicator={false}>
          {item.cover_url ? (
            <Image source={{ uri: item.cover_url }} style={styles.cover} resizeMode="cover" />
          ) : (
            <View style={[styles.cover, { backgroundColor: c.primary }]} />
          )}
          <View style={styles.body}>
            <Text style={[styles.meta, { color: c.muted }]}>
              {item.published_at ? publishedDateLabel(item.published_at) : ''} · {teamLabel(box.name)}
            </Text>
            <Text style={[styles.title, { color: c.text }]}>{item.title}</Text>
            {item.happens_on ? (
              <Text style={[styles.when, { color: c.text }]}>Le {mediumDate(item.happens_on)}</Text>
            ) : null}
            <Text style={[t.bodyNeutral, styles.copy]}>{item.body}</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  spinner: { marginTop: Spacing.XXL },
  message: {
    marginTop: Spacing.XL,
    textAlign: 'center',
    paddingHorizontal: Spacing.M,
  },
  cover: {
    width: '100%',
    height: 220,
  },
  body: {
    padding: Spacing.M,
    gap: Spacing.S,
  },
  meta: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: FontSize.XL,
    fontWeight: FontWeight.SEMI_BOLD,
    letterSpacing: -0.4,
  },
  when: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  copy: {
    lineHeight: 22,
  },
});
