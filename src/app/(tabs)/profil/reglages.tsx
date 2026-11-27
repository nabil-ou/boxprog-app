import Constants from 'expo-constants';
import { router } from 'expo-router';
import { KeyRound, LogOut, Mail, Trash2, UserMinus } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Stepper } from '@/components/chrono/Stepper';
import { Field } from '@/components/Field';
import { FormError } from '@/components/FormError';
import { PrimaryHeader } from '@/components/PrimaryHeader';
import { SettingsRow } from '@/components/profile/SettingsRow';
import { openAppSettings } from '@/lib/avatar';
import {
  ensureReminderPermission,
  formatReminderTime,
  loadReminder,
  saveReminder,
  shiftReminder,
  syncReminder,
  type ReminderPref,
} from '@/lib/reminders';
import { errMsg, supabase } from '@/lib/supabase';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow } from '@/lib/theme';
import { boxLevel, boxLevels, type Level } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { useActiveBox, useBox, useBrand } from '@/providers/BoxProvider';
import { useTheme } from '@/providers/ThemeProvider';

const DAY = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

function trainingLabel(days: number[]) {
  const list = (days.length ? days : [1, 2, 3, 4, 5, 6]).filter((d) => d >= 1 && d <= 7);
  return list.map((d) => DAY[d - 1]).join(', ');
}

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const { reload } = useBox();
  const box = useActiveBox();
  const c = useBrand();
  const { preference, setPreference } = useTheme();
  const insets = useSafeAreaInsets();
  const [level, setLevel] = useState<Level>(boxLevel(box, box.my_level));
  const [sex, setSex] = useState<'F' | 'H' | ''>(box.my_sex ?? '');
  const [name, setName] = useState(box.my_display_name || '');
  const [error, setError] = useState<string | null>(null);
  const [leaveBusy, setLeaveBusy] = useState(false);
  const [reminder, setReminder] = useState<ReminderPref>(loadReminder);
  const [reminderNote, setReminderNote] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  const { my_level: myLevel, elite_level: eliteLevel } = box;
  useEffect(() => setLevel(boxLevel({ elite_level: eliteLevel }, myLevel)), [myLevel, eliteLevel]);
  useEffect(() => setSex(box.my_sex ?? ''), [box.my_sex]);
  useEffect(() => setName(box.my_display_name || ''), [box.my_display_name]);

  const userId = session?.user.id;

  const chooseLevel = async (next: Level) => {
    if (!userId || next === level) return;
    const previous = level;
    setLevel(next);
    setError(null);
    const { error: updateError } = await supabase
      .from('memberships')
      .update({ default_level: next })
      .eq('box_id', box.id)
      .eq('user_id', userId);
    if (updateError) {
      setLevel(previous);
      setError(errMsg(updateError));
      return;
    }
    reload();
  };

  const chooseSex = async (next: 'F' | 'H' | '') => {
    if (!userId || next === sex) return;
    const previous = sex;
    setSex(next);
    setError(null);
    const { error: updateError } = await supabase
      .from('memberships')
      .update({ sex: next || null })
      .eq('box_id', box.id)
      .eq('user_id', userId);
    if (updateError) {
      setSex(previous);
      setError(errMsg(updateError));
      return;
    }
    reload();
  };

  const commitName = async () => {
    if (!userId) return;
    const next = name.trim();
    if (!next || next === box.my_display_name) {
      setName(box.my_display_name || '');
      return;
    }
    setError(null);
    const { error: updateError } = await supabase
      .from('memberships')
      .update({ display_name: next })
      .eq('box_id', box.id)
      .eq('user_id', userId);
    if (updateError) {
      setError(errMsg(updateError));
      return;
    }
    reload();
  };

  const applyReminder = async (next: ReminderPref) => {
    setReminder(next);
    saveReminder(next);
    try {
      await syncReminder(next, box.training_days, box.name);
      setReminderNote(null);
    } catch (err) {
      setReminderNote(err instanceof Error ? err.message : 'Impossible de programmer le rappel');
    }
  };

  const toggleReminder = async (on: boolean) => {
    setBlocked(false);
    if (!on) {
      await applyReminder({ ...reminder, enabled: false });
      return;
    }
    try {
      const perm = await ensureReminderPermission();
      if (perm !== 'granted') {
        setBlocked(perm === 'blocked');
        setReminderNote(
          perm === 'blocked'
            ? 'Les notifications sont refusées pour l’app.'
            : 'Autorise les notifications pour recevoir le rappel.',
        );
        return;
      }
      await applyReminder({ ...reminder, enabled: true });
    } catch (err) {
      setReminderNote(err instanceof Error ? err.message : 'Notifications indisponibles sur cette version de l’app.');
    }
  };

  const leave = () => {
    Alert.alert(`Quitter ${box.name} ?`, 'Tes scores dans cette box seront supprimés.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Quitter la box',
        style: 'destructive',
        onPress: async () => {
          if (!userId) return;
          setLeaveBusy(true);
          setError(null);
          const { error: deleteError } = await supabase.from('memberships').delete().eq('box_id', box.id).eq('user_id', userId);
          setLeaveBusy(false);
          if (deleteError) setError(errMsg(deleteError));
          else reload();
        },
      },
    ]);
  };

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <PrimaryHeader title="Réglages" onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, Spacing.M) + Spacing.L }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Section title="Apparence">
          <Segment
            options={[
              { value: 'light', label: 'Clair' },
              { value: 'dark', label: 'Sombre' },
              { value: 'system', label: 'Auto' },
            ]}
            value={preference}
            onChange={setPreference}
          />
          <Text style={[styles.hint, { color: c.muted }]}>Auto suit le réglage de l’iPhone.</Text>
        </Section>

        <Section title="Dans la box">
          <Field
            label="Nom affiché"
            hint="Visible des autres adhérents dans les classements."
            value={name}
            onChangeText={setName}
            onEndEditing={commitName}
            maxLength={40}
            autoComplete="nickname"
          />
          <View style={styles.block}>
            <Text style={[styles.label, { color: c.text }]}>Catégorie</Text>
            <Segment
              options={[
                { value: 'F', label: 'Femme' },
                { value: 'H', label: 'Homme' },
                { value: '', label: 'Non précisé' },
              ]}
              value={sex}
              onChange={chooseSex}
            />
          </View>
          <View style={styles.block}>
            <Text style={[styles.label, { color: c.text }]}>Niveau par défaut</Text>
            <Text style={[styles.hint, { color: c.muted }]}>La séance du jour s’ouvrira à ce niveau.</Text>
            <Segment options={boxLevels(box).map((l) => ({ value: l, label: l }))} value={level} onChange={chooseLevel} />
          </View>
          <FormError message={error} />
        </Section>

        <Section title="Notifications">
          <View style={styles.switchRow}>
            <View style={styles.flex}>
              <Text style={[styles.label, { color: c.text }]}>Rappel de séance</Text>
              <Text style={[styles.hint, { color: c.muted }]}>
                Les {trainingLabel(box.training_days)}, à l’heure de ton téléphone.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Rappel de séance"
              value={reminder.enabled}
              onValueChange={toggleReminder}
              trackColor={{ false: c.border, true: c.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
          {reminder.enabled ? (
            <View style={styles.block}>
              <Text style={[styles.label, { color: c.text }]}>Heure</Text>
              <Stepper
                value={formatReminderTime(reminder.hour, reminder.minute)}
                onMinus={() => applyReminder(shiftReminder(reminder, -15))}
                onPlus={() => applyReminder(shiftReminder(reminder, 15))}
              />
            </View>
          ) : null}
          {reminderNote ? <Text style={[styles.hint, { color: c.danger }]}>{reminderNote}</Text> : null}
          {blocked ? (
            <Pressable accessibilityRole="button" onPress={() => openAppSettings()}>
              <Text style={[styles.link, { color: c.link }]}>Ouvrir les réglages</Text>
            </Pressable>
          ) : null}
        </Section>

        <Section title="Compte">
          <SettingsRow icon={Mail} label="E-mail" value={session?.user.email ?? ''} />
          <View style={[styles.rule, { backgroundColor: c.border }]} />
          <SettingsRow icon={KeyRound} label="Modifier le mot de passe" onPress={() => router.push('/(tabs)/profil/mot-de-passe')} />
          <View style={[styles.rule, { backgroundColor: c.border }]} />
          <SettingsRow icon={LogOut} label="Se déconnecter" onPress={signOut} />
          {box.my_role !== 'owner' ? (
            <>
              <View style={[styles.rule, { backgroundColor: c.border }]} />
              <SettingsRow icon={UserMinus} label={`Quitter ${box.name}`} onPress={leave} destructive busy={leaveBusy} />
            </>
          ) : null}
          <View style={[styles.rule, { backgroundColor: c.border }]} />
          <SettingsRow icon={Trash2} label="Supprimer mon compte" onPress={() => router.push('/(tabs)/profil/supprimer')} destructive />
        </Section>

        <Section title="À propos">
          <Text style={[styles.hint, { color: c.muted }]}>Version {version}</Text>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const c = useBrand();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: c.muted }]}>{title}</Text>
      <View style={[styles.card, softShadow, { backgroundColor: c.surface }]}>{children}</View>
    </View>
  );
}

function Segment<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const c = useBrand();
  return (
    <View style={styles.segment} accessibilityRole="radiogroup">
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <Pressable
            key={opt.value || 'empty'}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(opt.value)}
            style={[styles.segmentItem, { borderColor: on ? c.primary : c.border, backgroundColor: on ? c.primary : c.surface }]}>
            <Text style={{ color: on ? c.onPrimary : c.text, fontFamily: font.medium, fontSize: FontSize.XS, textAlign: 'center' }}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: Spacing.M, gap: Spacing.L },
  section: { gap: Spacing.XS },
  sectionTitle: {
    marginLeft: Spacing.XS,
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
  },
  card: {
    borderRadius: BorderRadius.XL,
    padding: Spacing.M,
    gap: Spacing.M,
  },
  block: { gap: Spacing.XS },
  label: { fontFamily: font.medium, fontSize: FontSize.S, fontWeight: FontWeight.MEDIUM },
  hint: { fontFamily: font.regular, fontSize: FontSize.XS, lineHeight: 16 },
  link: { fontFamily: font.medium, fontSize: FontSize.S, fontWeight: FontWeight.MEDIUM },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.S },
  flex: { flex: 1, gap: Spacing.XXS },
  segment: { flexDirection: 'row', gap: Spacing.XS },
  segmentItem: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: BorderRadius.M,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.XXS,
  },
  rule: { height: StyleSheet.hairlineWidth, marginHorizontal: -Spacing.XXS },
});
