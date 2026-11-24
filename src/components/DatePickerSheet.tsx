import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { iso, parse, todayIso, yearsAgo } from '@/lib/dates';
import { BorderRadius, FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';
import { useTheme } from '@/providers/ThemeProvider';

/** Choix d'une date : roues jour / mois / année sur iOS, dialogue système sur Android. */
export function DatePickerSheet({
  open,
  title,
  value,
  minDate = yearsAgo(100),
  maxDate = todayIso(),
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  /** ISO yyyy-mm-dd */
  value: string;
  minDate?: string;
  maxDate?: string;
  onSelect: (day: string) => void;
  onClose: () => void;
}) {
  const c = useBrand();
  const { scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const minimumDate = useMemo(() => parse(minDate), [minDate]);
  const maximumDate = useMemo(() => parse(maxDate), [maxDate]);
  const [draft, setDraft] = useState(() => parse(value));

  useEffect(() => {
    if (open) setDraft(parse(value));
  }, [open, value]);

  const onChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        onClose();
        return;
      }
      if (event.type === 'set' && date) {
        onSelect(iso(date));
        onClose();
      }
      return;
    }
    if (date) setDraft(date);
  };

  if (!open) return null;

  // Android : dialogue système natif (jour / mois / année).
  if (Platform.OS === 'android') {
    return (
      <DateTimePicker
        value={draft}
        mode="date"
        display="default"
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onChange={onChange}
      />
    );
  }

  // iOS : roues jour / mois / année dans une sheet.
  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Fermer" />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: c.surface,
              borderColor: c.border,
              paddingBottom: Math.max(insets.bottom, Spacing.M),
            },
          ]}>
          <Text style={[styles.title, { color: c.text }]}>{title}</Text>
          <DateTimePicker
            value={draft}
            mode="date"
            display="spinner"
            themeVariant={scheme === 'dark' ? 'dark' : 'light'}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale="fr-FR"
            onChange={onChange}
            style={styles.spinner}
          />
          <View style={styles.actions}>
            <Button label="Annuler" variant="outline" onPress={onClose} style={styles.flex} />
            <Button
              label="Valider"
              onPress={() => {
                onSelect(iso(draft));
                onClose();
              }}
              style={styles.flex}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.XL,
    borderTopRightRadius: BorderRadius.XL,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.M,
    paddingHorizontal: Spacing.M,
    gap: Spacing.S,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    fontWeight: FontWeight.SEMI_BOLD,
    textAlign: 'center',
  },
  spinner: {
    alignSelf: 'center',
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.S,
  },
  flex: { flex: 1 },
});
