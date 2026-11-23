import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Spacing, font } from '@/lib/theme';
import { useBrand } from '@/providers/BoxProvider';

export type CommunityTab = 'ranking' | 'discussion';

const TABS: { value: CommunityTab; label: string }[] = [
  { value: 'ranking', label: 'Classement' },
  { value: 'discussion', label: 'Discussion' },
];

export function CommunityTabs({ value, onChange }: { value: CommunityTab; onChange: (tab: CommunityTab) => void }) {
  const c = useBrand();
  return (
    <View style={[styles.row, { backgroundColor: c.background }]} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const on = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(tab.value)}
            style={styles.tab}>
            <Text
              style={[
                styles.label,
                { color: on ? c.text : c.muted, fontFamily: on ? font.semibold : font.medium },
              ]}>
              {tab.label}
            </Text>
            <View style={[styles.underline, { backgroundColor: on ? c.accent : 'transparent' }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.L,
    paddingTop: Spacing.S,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.XS,
  },
  label: {
    fontSize: FontSize.M + 2,
    fontWeight: FontWeight.SEMI_BOLD,
  },
  underline: {
    alignSelf: 'stretch',
    marginHorizontal: Spacing.L,
    height: 3,
    borderRadius: 2,
  },
});
