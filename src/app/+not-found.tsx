import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { useBrand } from '@/providers/BoxProvider';

export default function NotFoundScreen() {
  const c = useBrand();
  return (
    <>
      <Stack.Screen options={{ title: 'Introuvable', headerShown: true }} />
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Text style={[styles.title, { color: c.text }]}>Cet écran n’existe pas.</Text>
        <Link href="/" style={[styles.link, { color: c.ink }]}>
          Retour à l’accueil
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    fontSize: 16,
  },
});
