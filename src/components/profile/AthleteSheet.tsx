import { X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { Button } from '@/components/Button';
import { DatePickerSheet } from '@/components/DatePickerSheet';
import { Field } from '@/components/Field';
import { FormError } from '@/components/FormError';
import {
  parseHeight,
  parseWeight,
  weightInput,
  type AthleteInput,
} from '@/lib/athlete';
import { mediumDate, todayIso, yearsAgo } from '@/lib/dates';
import { BorderRadius, FontSize, FontWeight, Spacing, font, softShadow } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function AthleteSheet({
  initial,
  onClose,
  onSave,
}: {
  initial: AthleteInput;
  onClose: () => void;
  onSave: (input: AthleteInput) => Promise<string | null>;
}) {
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const progress = useSharedValue(0);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [birth, setBirth] = useState(initial.birthDate ?? '');
  const [heightCm, setHeightCm] = useState(initial.heightCm == null ? '' : String(initial.heightCm));
  const [weightKg, setWeightKg] = useState(weightInput(initial.weightKg));
  const [dateOpen, setDateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 280 });
  }, [progress]);

  const close = (force = false) => {
    if (busy && !force) return;
    progress.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };
  const dismiss = () => close(false);

  const save = async () => {
    const first = firstName.trim();
    const last = lastName.trim();
    if (!first) {
      setError('Indique ton prénom.');
      return;
    }
    const heightValue = parseHeight(heightCm);
    if (heightValue === 'invalid') {
      setError('La taille se situe entre 100 et 250 cm.');
      return;
    }
    const weightValue = parseWeight(weightKg);
    if (weightValue === 'invalid') {
      setError('Le poids se situe entre 30 et 300 kg.');
      return;
    }
    if (birth && birth > todayIso()) {
      setError('La date de naissance ne peut pas être dans le futur.');
      return;
    }
    setBusy(true);
    setError(null);
    const err = await onSave({
      firstName: first,
      lastName: last,
      birthDate: birth || null,
      heightCm: heightValue,
      weightKg: weightValue,
    });
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    close(true);
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height }],
  }));

  return (
    <Modal visible animationType="none" transparent statusBarTranslucent onRequestClose={dismiss}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.fill} onPress={dismiss} accessibilityLabel="Fermer" />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            { backgroundColor: c.surface, paddingBottom: Math.max(insets.bottom, Spacing.M) },
          ]}>
          <View style={styles.head}>
            <Text style={[styles.title, { color: c.text }]}>Ma fiche</Text>
            <Pressable
              onPress={dismiss}
              hitSlop={12}
              accessibilityLabel="Fermer"
              style={[styles.closeBtn, softShadow, { backgroundColor: c.surface, borderColor: c.border }]}>
              <AppIcon icon={X} size={18} color={c.muted} />
            </Pressable>
          </View>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              automaticallyAdjustKeyboardInsets
              showsVerticalScrollIndicator={false}>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Field
                    label="Prénom"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoComplete="given-name"
                    textContentType="givenName"
                    maxLength={60}
                  />
                </View>
                <View style={styles.flex}>
                  <Field
                    label="Nom"
                    value={lastName}
                    onChangeText={setLastName}
                    autoComplete="family-name"
                    textContentType="familyName"
                    maxLength={60}
                  />
                </View>
              </View>
              <View style={styles.field}>
                <Text style={[styles.label, { color: c.text }]}>Date de naissance</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Choisir la date de naissance"
                  onPress={() => setDateOpen(true)}
                  style={[styles.dateBtn, { borderColor: c.border, backgroundColor: c.surface }]}>
                  <Text style={{ color: birth ? c.text : c.muted, fontFamily: font.regular, fontSize: FontSize.S }}>
                    {birth ? mediumDate(birth) : 'Choisir'}
                  </Text>
                </Pressable>
                {birth ? (
                  <Pressable accessibilityRole="button" onPress={() => setBirth('')} hitSlop={6}>
                    <Text style={{ color: c.muted, fontFamily: font.medium, fontSize: FontSize.XS }}>Effacer la date</Text>
                  </Pressable>
                ) : (
                  <Text style={{ color: c.muted, fontSize: FontSize.XS, lineHeight: 16 }}>
                    L’âge affiché se calcule à partir de cette date.
                  </Text>
                )}
              </View>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Field
                    label="Taille"
                    value={heightCm}
                    onChangeText={setHeightCm}
                    keyboardType="number-pad"
                    placeholder="cm"
                    maxLength={3}
                  />
                </View>
                <View style={styles.flex}>
                  <Field
                    label="Poids"
                    value={weightKg}
                    onChangeText={setWeightKg}
                    keyboardType="decimal-pad"
                    placeholder="kg"
                    maxLength={5}
                  />
                </View>
              </View>
              <FormError message={error} />
              <Button label="Enregistrer" onPress={save} busy={busy} disabled={!firstName.trim()} />
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
      <DatePickerSheet
        open={dateOpen}
        title="Date de naissance"
        value={birth || yearsAgo(25)}
        minDate={yearsAgo(100)}
        maxDate={todayIso()}
        onSelect={(day) => {
          setBirth(day);
          setDateOpen(false);
        }}
        onClose={() => setDateOpen(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  fill: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    height: '85%',
    borderTopLeftRadius: BorderRadius.XL,
    borderTopRightRadius: BorderRadius.XL,
    paddingTop: Spacing.M,
    paddingHorizontal: Spacing.M,
    gap: Spacing.S,
  },
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: Spacing.S },
  title: {
    flex: 1,
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.FULL,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { gap: Spacing.M, paddingBottom: Spacing.L },
  row: { flexDirection: 'row', gap: Spacing.S },
  field: { gap: Spacing.XS },
  label: { fontFamily: font.medium, fontSize: FontSize.S, fontWeight: FontWeight.MEDIUM },
  dateBtn: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.M,
    paddingHorizontal: Spacing.S,
    justifyContent: 'center',
  },
});
