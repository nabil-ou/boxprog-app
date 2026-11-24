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
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/AppIcon';
import { Button } from '@/components/Button';
import { DatePickerSheet } from '@/components/DatePickerSheet';
import { Field } from '@/components/Field';
import { todayIso } from '@/lib/dates';
import {
  formatPrDate,
  formatPrInput,
  parsePrValue,
  type PersonalRecord,
  type PrMovement,
  type PrUnit,
} from '@/lib/records';
import { BorderRadius, FontSize, FontWeight, Height, Spacing, font, softShadow } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

function recordMeta(unit: PrUnit): {
  label: string;
  placeholder: string;
  keyboardType: 'decimal-pad' | 'number-pad' | 'default';
} {
  if (unit === 'kg') {
    return { label: 'Record', placeholder: 'Poids en kg (ex. 100)', keyboardType: 'decimal-pad' };
  }
  if (unit === 'reps') {
    return { label: 'Record', placeholder: 'Nombre de reps (ex. 15)', keyboardType: 'number-pad' };
  }
  if (unit === 'm') {
    return { label: 'Record', placeholder: 'Distance en m (ex. 50)', keyboardType: 'decimal-pad' };
  }
  return { label: 'Record', placeholder: 'Temps (ex. 1:30)', keyboardType: 'default' };
}

function invalidMessage(unit: PrUnit): string {
  if (unit === 'kg') return 'Entre un poids en kg, par exemple 100 ou 102,5';
  if (unit === 'reps') return 'Entre un nombre de répétitions';
  if (unit === 'm') return 'Entre une distance en mètres';
  return 'Entre un temps, par exemple 1:30 ou 90';
}

export function PrAddSheet({
  movement,
  initial,
  onClose,
  onSave,
}: {
  movement: PrMovement;
  /** Présent = mode édition, champs préremplis. */
  initial?: PersonalRecord | null;
  onClose: () => void;
  onSave: (input: { value: number; note: string; performedOn: string }) => Promise<string | null>;
}) {
  const c = useBrand();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const progress = useSharedValue(0);
  const editing = Boolean(initial);

  const meta = recordMeta(movement.unit);
  const [value, setValue] = useState(() =>
    initial ? formatPrInput(initial.value, movement.unit) : '',
  );
  const [note, setNote] = useState(() => initial?.note ?? '');
  const [date, setDate] = useState(() => initial?.performed_on ?? todayIso());
  const [dateOpen, setDateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 280 });
  }, [progress]);

  const close = () => {
    progress.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  const save = async () => {
    const parsed = parsePrValue(value, movement.unit);
    if (parsed == null) {
      setError(invalidMessage(movement.unit));
      return;
    }
    if (note.trim().length > 1000) {
      setError('La note est limitée à 1000 caractères');
      return;
    }
    setBusy(true);
    setError(null);
    const err = await onSave({ value: parsed, note, performedOn: date });
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    close();
  };

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height }],
  }));

  return (
    <Modal visible animationType="none" transparent statusBarTranslucent onRequestClose={close}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.fill} onPress={close} accessibilityLabel="Fermer" />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            sheetStyle,
            {
              backgroundColor: c.surface,
              paddingTop: Spacing.M,
              paddingBottom: Math.max(insets.bottom, Spacing.M),
            },
          ]}>
          <View style={styles.head}>
            <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
              {movement.name}
            </Text>
            <Pressable
              onPress={close}
              hitSlop={12}
              accessibilityLabel="Fermer"
              style={[styles.closeBtn, softShadow, { backgroundColor: c.surface, borderColor: c.border }]}>
              <AppIcon icon={X} size={18} color={c.muted} />
            </Pressable>
          </View>

          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={24}>
            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              automaticallyAdjustKeyboardInsets
              showsVerticalScrollIndicator={false}>
              <Field
                label={meta.label}
                placeholder={meta.placeholder}
                value={value}
                onChangeText={(next) => {
                  setValue(next);
                  if (error) setError(null);
                }}
                keyboardType={meta.keyboardType}
                returnKeyType="done"
                error={error}
              />

              <View style={styles.wrap}>
                <Text style={[styles.label, { color: c.text }]}>Note</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Ressenti, remarque, contexte d'entraînement…"
                  placeholderTextColor={c.muted}
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.note,
                    {
                      borderColor: c.border,
                      color: c.text,
                      backgroundColor: c.raised,
                    },
                  ]}
                />
              </View>

              <View style={styles.wrap}>
                <Text style={[styles.label, { color: c.text }]}>Date</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Modifier la date"
                  onPress={() => setDateOpen(true)}
                  style={[
                    styles.dateBtn,
                    softShadow,
                    { borderColor: c.border, backgroundColor: c.surface },
                  ]}>
                  <Text style={[styles.dateTxt, { color: c.text }]}>{formatPrDate(date)}</Text>
                </Pressable>
              </View>

              <Button label={editing ? 'Mettre à jour' : 'Enregistrer'} onPress={save} busy={busy} />
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>

      <DatePickerSheet
        open={dateOpen}
        title="Date du PR"
        value={date}
        maxDate={todayIso()}
        onSelect={(day) => {
          setDate(day);
          setDateOpen(false);
        }}
        onClose={() => setDateOpen(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fill: { flex: 1 },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    height: '85%',
    borderTopLeftRadius: BorderRadius.XL,
    borderTopRightRadius: BorderRadius.XL,
    paddingHorizontal: Spacing.M,
    gap: Spacing.S,
    overflow: 'hidden',
  },
  flex: { flex: 1 },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.S,
  },
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
  body: {
    paddingBottom: Spacing.S,
    gap: Spacing.M,
    flexGrow: 1,
  },
  wrap: { gap: Spacing.XS },
  label: {
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  note: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: BorderRadius.M,
    paddingHorizontal: Spacing.S,
    paddingTop: Spacing.S,
    paddingBottom: Spacing.S,
    fontFamily: font.regular,
    fontSize: FontSize.S,
    lineHeight: 22,
  },
  dateBtn: {
    minHeight: Height.INPUT_S,
    borderWidth: 1,
    borderRadius: BorderRadius.M,
    paddingHorizontal: Spacing.S,
    justifyContent: 'center',
  },
  dateTxt: {
    fontFamily: font.regular,
    fontSize: FontSize.S,
  },
});
