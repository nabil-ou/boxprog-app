import { Search } from 'lucide-react-native';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppIcon } from '@/components/AppIcon';
import { BorderRadius, FontSize, Height, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export function PrSearch({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (v: string) => void;
}) {
  const c = useBrand();

  return (
    <View style={[styles.wrap, { backgroundColor: c.surface, borderColor: c.border }]}>
      <AppIcon icon={Search} size={18} color={c.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Rechercher un mouvement"
        placeholderTextColor={c.muted}
        style={[styles.input, { color: c.text }]}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.XS,
    borderWidth: 1,
    borderRadius: BorderRadius.L,
    paddingHorizontal: Spacing.S,
    minHeight: Height.INPUT_S,
  },
  input: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: FontSize.S,
    paddingVertical: Spacing.XS,
  },
});
