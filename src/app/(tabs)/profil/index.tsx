import { router } from 'expo-router';
import { Camera, Settings, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_ICON_STROKE } from '@/components/AppIcon';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { FormError } from '@/components/FormError';
import { PrimaryHeader } from '@/components/PrimaryHeader';
import { AthleteSheet } from '@/components/profile/AthleteSheet';
import { BadgesPreview } from '@/components/profile/BadgesPreview';
import { ObjectivesSection } from '@/components/profile/ObjectivesSection';
import {
  ageYears,
  formatAge,
  formatCm,
  formatKg,
  loadAthlete,
  saveAthlete,
  type Athlete,
  type AthleteInput,
} from '@/lib/athlete';
import {
  CameraPermissionError,
  CameraUnavailableError,
  openAppSettings,
  pickAvatarJpeg,
  removeAvatar,
  uploadAvatar,
  type AvatarSource,
} from '@/lib/avatar';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow } from '@/lib/theme';
import { ROLE_LABEL } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { useActiveBox, useBrand } from '@/providers/BoxProvider';

export default function ProfileScreen() {
  const { session } = useAuth();
  const box = useActiveBox();
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const userId = session?.user.id;
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    const fallback = (session?.user.user_metadata?.full_name as string) || '';
    loadAthlete(userId, fallback).then(
      (next) => {
        if (!alive) return;
        setAthlete(next);
        setError(null);
      },
      (err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : 'Impossible de charger le profil');
      },
    );
    return () => {
      alive = false;
    };
  }, [userId, session?.user.user_metadata?.full_name]);

  const changePhoto = async (source: AvatarSource) => {
    if (!userId) return;
    setPhotoBusy(true);
    setError(null);
    try {
      const picked = await pickAvatarJpeg(source);
      if (picked.status !== 'picked') return;
      const url = await uploadAvatar(userId, picked.uri);
      setAthlete((current) => (current ? { ...current, avatarUrl: url } : current));
    } catch (err) {
      if (err instanceof CameraPermissionError) {
        Alert.alert(
          'Appareil photo bloqué',
          'Autorise l’accès à l’appareil photo dans les réglages pour prendre une photo.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Ouvrir les réglages', onPress: () => openAppSettings() },
          ],
        );
      } else if (err instanceof CameraUnavailableError) {
        Alert.alert(
          'Appareil photo indisponible',
          'Cet appareil n’a pas d’appareil photo. Choisis plutôt une photo dans la galerie.',
        );
      } else {
        setError(err instanceof Error ? err.message : 'Impossible de mettre la photo à jour');
      }
    } finally {
      setPhotoBusy(false);
    }
  };

  const clearPhoto = async () => {
    if (!userId) return;
    setPhotoBusy(true);
    setError(null);
    try {
      await removeAvatar(userId);
      setAthlete((current) => (current ? { ...current, avatarUrl: null } : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de retirer la photo');
    } finally {
      setPhotoBusy(false);
    }
  };

  // Même menu que Nudge : ActionSheetIOS évite le plantage Alert → galerie.
  const onPhoto = () => {
    if (!athlete || photoBusy) return;
    const actions: { label: string; run: () => void; destructive?: boolean }[] = [
      { label: 'Prendre une photo', run: () => void changePhoto('camera') },
      { label: 'Choisir dans la galerie', run: () => void changePhoto('library') },
    ];
    if (athlete.avatarUrl) {
      actions.push({ label: 'Retirer la photo', run: () => void clearPhoto(), destructive: true });
    }

    if (Platform.OS === 'ios') {
      const destructiveIndex = actions.findIndex((action) => action.destructive);
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...actions.map((action) => action.label), 'Annuler'],
          cancelButtonIndex: actions.length,
          destructiveButtonIndex: destructiveIndex >= 0 ? destructiveIndex : undefined,
        },
        (index) => actions[index]?.run(),
      );
      return;
    }

    Alert.alert(
      athlete.avatarUrl ? 'Changer la photo' : 'Ajouter une photo',
      undefined,
      actions.map((action) => ({
        text: action.label,
        style: action.destructive ? ('destructive' as const) : ('default' as const),
        onPress: action.run,
      })),
      { cancelable: true },
    );
  };

  const onSave = async (input: AthleteInput) => {
    if (!userId) return 'Session expirée';
    try {
      const fullName = await saveAthlete(userId, input);
      setAthlete((current) =>
        current
          ? {
              ...current,
              ...input,
              fullName,
            }
          : current,
      );
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Impossible d’enregistrer la fiche';
    }
  };

  const name = athlete?.fullName.trim() || 'Ton nom';
  const role = box.my_role ? ROLE_LABEL[box.my_role] : '';
  const display = box.my_display_name;
  const showDisplay = Boolean(display && athlete && display !== athlete.fullName);
  const age = formatAge(ageYears(athlete?.birthDate ?? null));

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader
        title="Profil"
        icon={User}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Réglages"
            hitSlop={8}
            onPress={() => router.push('/(tabs)/profil/reglages')}>
            <Settings size={22} color={c.onPrimary} strokeWidth={APP_ICON_STROKE} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L }]}
        showsVerticalScrollIndicator={false}>
        {error ? <FormError message={error} /> : null}
        {!athlete && !error ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: Spacing.XL }} />
        ) : athlete ? (
          <>
            <View style={[styles.card, styles.identity, softShadow, { backgroundColor: c.surface }]}>
              <Pressable accessibilityRole="button" accessibilityLabel="Photo de profil" onPress={onPhoto} disabled={photoBusy}>
                <Avatar name={name} uri={athlete.avatarUrl} size={96} />
                <View style={[styles.badge, { backgroundColor: c.accent, borderColor: c.surface }]}>
                  {photoBusy ? (
                    <ActivityIndicator color={c.onAccent} size="small" />
                  ) : (
                    <Camera size={14} color={c.onAccent} strokeWidth={APP_ICON_STROKE} />
                  )}
                </View>
              </Pressable>
              <Text style={[styles.name, { color: athlete.fullName.trim() ? c.text : c.muted }]}>{name}</Text>
              {session?.user.email ? <Text style={{ color: c.muted }}>{session.user.email}</Text> : null}
              <Text style={[styles.role, { color: c.muted }]}>
                {[role, box.name].filter(Boolean).join(' · ')}
              </Text>
              {showDisplay ? <Text style={[styles.display, { color: c.secondary }]}>Au classement : {display}</Text> : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Modifier la fiche"
              onPress={() => setEditing(true)}
              style={[styles.stats, softShadow, { backgroundColor: c.surface }]}>
              {[
                { label: 'Âge', value: age },
                { label: 'Taille', value: formatCm(athlete.heightCm) },
                { label: 'Poids', value: formatKg(athlete.weightKg) },
              ].map((stat, index) => (
                <View
                  key={stat.label}
                  style={[styles.stat, index > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: c.border }]}>
                  <Text style={[styles.statValue, { color: c.text }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: c.muted }]}>{stat.label}</Text>
                </View>
              ))}
            </Pressable>

            <Button label="Modifier ma fiche" variant="outline" onPress={() => setEditing(true)} />

            <BadgesPreview />
            <ObjectivesSection />
          </>
        ) : null}
      </ScrollView>
      {editing && athlete ? (
        <AthleteSheet
          initial={{
            firstName: athlete.firstName,
            lastName: athlete.lastName,
            birthDate: athlete.birthDate,
            heightCm: athlete.heightCm,
            weightKg: athlete.weightKg,
          }}
          onClose={() => setEditing(false)}
          onSave={onSave}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    padding: Spacing.M,
    gap: Spacing.M,
  },
  card: {
    borderRadius: BorderRadius.XL,
    padding: Spacing.L,
  },
  identity: {
    alignItems: 'center',
    gap: Spacing.XXS,
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.FULL,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: font.semibold,
    fontSize: FontSize.XL,
    fontWeight: FontWeight.SEMI_BOLD,
    marginTop: Spacing.S,
    textAlign: 'center',
  },
  role: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    marginTop: Spacing.XXS,
    textAlign: 'center',
  },
  display: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    borderRadius: BorderRadius.XL,
    paddingVertical: Spacing.M,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.XXS,
  },
  statValue: {
    fontFamily: font.semibold,
    fontSize: FontSize.M,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  statLabel: {
    fontFamily: font.regular,
    fontSize: FontSize.XS,
  },
});
