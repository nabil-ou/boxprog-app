import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { BorderRadius, FontSize, FontWeight, Height, Spacing, font, softShadow } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function SelectMenu<T extends string>({
  label,
  title,
  options,
  value,
  onChange,
}: {
  /** Texte du bouton. */
  label: string;
  /** Titre de la liste ouverte. */
  title: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const c = useBrand();
  const { height } = useWindowDimensions();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title} : ${label}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          softShadow,
          { backgroundColor: c.surface, borderColor: c.border, opacity: pressed ? 0.85 : 1 },
        ]}>
        <Text style={[styles.triggerText, { color: c.text }]} numberOfLines={1}>
          {label}
        </Text>
        <AppIcon icon={ChevronDown} size={18} color={c.text} />
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.root}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Fermer" />
          <View style={[styles.sheet, { backgroundColor: c.surface, borderColor: c.border, maxHeight: height * 0.6 }]}>
            <Text style={[styles.title, { color: c.muted }]}>{title}</Text>
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {options.map((opt, i) => {
                const on = opt.value === value;
                return (
                  <Pressable
                    key={opt.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => {
                      setOpen(false);
                      if (!on) onChange(opt.value);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
                      { opacity: pressed ? 0.7 : 1 },
                    ]}>
                    <Text
                      style={[styles.optionText, { color: c.text, fontFamily: on ? font.semibold : font.regular }]}>
                      {opt.label}
                    </Text>
                    {on ? <AppIcon icon={Check} size={18} color={c.accent} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XS,
    minHeight: Height.PRESSABLE_S,
    paddingHorizontal: Spacing.S,
    borderRadius: BorderRadius.M,
    borderWidth: 1,
  },
  triggerText: {
    flexShrink: 1,
    fontFamily: font.medium,
    fontSize: FontSize.S,
    fontWeight: FontWeight.MEDIUM,
  },
  root: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.L,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderRadius: BorderRadius.L,
    borderWidth: 1,
    paddingTop: Spacing.M,
    paddingHorizontal: Spacing.M,
    paddingBottom: Spacing.XS,
  },
  title: {
    fontFamily: font.medium,
    fontSize: FontSize.XS,
    fontWeight: FontWeight.MEDIUM,
    marginBottom: Spacing.XS,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: Height.PRESSABLE_S + 4,
  },
  optionText: {
    fontSize: FontSize.S,
  },
});
