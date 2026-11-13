import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: 'connexion',
};

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="connexion" />
      <Stack.Screen name="inscription" />
      <Stack.Screen name="mot-de-passe-oublie" />
    </Stack>
  );
}
