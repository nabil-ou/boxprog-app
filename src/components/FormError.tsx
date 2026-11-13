import { StyleSheet, Text } from 'react-native';

import { useBrand } from '@/providers/BoxProvider';

export function FormError({ message }: { message: string | null }) {
  const c = useBrand();
  if (!message) return null;
  return (
    <Text accessibilityRole="alert" style={[styles.text, { color: c.danger }]}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
});
