import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BorderRadius, FontSize, Height, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

const DIGIT = 'BarlowCondensed_700Bold';

export function Stepper({
  value,
  onMinus,
  onPlus,
  colors,
}: {
  value: string;
  onMinus: () => void;
  onPlus: () => void;
  colors?: { bg: string; border: string; text: string };
}) {
  const c = useBrand();
  const bg = colors?.bg ?? c.raised;
  const border = colors?.border ?? c.border;
  const text = colors?.text ?? c.text;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel="Moins"
        onPress={onMinus}
        style={({ pressed }) => [
          styles.btn,
          {
            backgroundColor: bg,
            borderColor: border,
            opacity: pressed ? 0.75 : 1,
          },
        ]}>
        <Text style={[styles.btnTxt, { color: text }]}>−</Text>
      </Pressable>
      <Text style={[styles.out, { color: text }]}>{value}</Text>
      <Pressable
        accessibilityLabel="Plus"
        onPress={onPlus}
        style={({ pressed }) => [
          styles.btn,
          {
            backgroundColor: bg,
            borderColor: border,
            opacity: pressed ? 0.75 : 1,
          },
        ]}>
        <Text style={[styles.btnTxt, { color: text }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    width: Height.PRESSABLE_XS + 8,
    height: Height.PRESSABLE_XS + 8,
    borderRadius: BorderRadius.S,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    fontFamily: font.semibold,
    fontSize: FontSize.L,
    lineHeight: 24,
  },
  out: {
    minWidth: 72,
    textAlign: 'center',
    fontFamily: DIGIT,
    fontSize: 28,
    fontVariant: ['tabular-nums'],
  },
});
