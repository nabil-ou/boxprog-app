import {
  BarlowCondensed_500Medium,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  useFonts,
} from '@expo-google-fonts/dm-sans';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import 'react-native-reanimated';

import { font } from '@/lib/theme';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { BoxProvider, useBox, useBrand } from '@/providers/BoxProvider';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const textDefaults = {
  fontFamily: font.regular,
  fontWeight: '400' as const,
};
const inputDefaults = {
  fontFamily: font.regular,
  fontWeight: '400' as const,
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    BarlowCondensed_500Medium,
    BarlowCondensed_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    const T = Text as typeof Text & { defaultProps?: { style?: unknown } };
    const I = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };
    T.defaultProps = { ...(T.defaultProps || {}), style: [T.defaultProps?.style, textDefaults] };
    I.defaultProps = { ...(I.defaultProps || {}), style: [I.defaultProps?.style, inputDefaults] };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F6' }}>
        <ActivityIndicator color="#171717" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <BoxProvider>
        <RootStack />
      </BoxProvider>
    </AuthProvider>
  );
}

function RootStack() {
  const { access } = useBox();
  const { recovering } = useAuth();
  const c = useBrand();
  const booted = useRef(false);

  const theme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: c.ink,
        background: c.background,
        card: c.surface,
        text: c.text,
        border: c.border,
      },
      fonts: {
        ...DefaultTheme.fonts,
        regular: { fontFamily: font.regular, fontWeight: '400' as const },
        medium: { fontFamily: font.medium, fontWeight: '500' as const },
        bold: { fontFamily: font.semibold, fontWeight: '600' as const },
        heavy: { fontFamily: font.semibold, fontWeight: '600' as const },
      },
    }),
    [c],
  );

  useEffect(() => {
    if (access !== 'loading' && !booted.current) {
      booted.current = true;
      SplashScreen.hideAsync();
    }
  }, [access]);

  if (access === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primary }}>
        <ActivityIndicator color={c.onPrimary} />
      </View>
    );
  }

  const waiting = access === 'pending' || access === 'blocked' || access === 'unavailable' || access === 'error';

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={recovering}>
          <Stack.Screen name="nouveau-mot-de-passe" />
        </Stack.Protected>
        <Stack.Protected guard={!recovering && access === 'signedOut'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={!recovering && access === 'join'}>
          <Stack.Screen name="rejoindre" />
        </Stack.Protected>
        <Stack.Protected guard={!recovering && waiting}>
          <Stack.Screen name="en-attente" />
        </Stack.Protected>
        <Stack.Protected guard={!recovering && access === 'active'}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="profil"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Mon profil',
              headerStyle: { backgroundColor: c.surface },
              headerTintColor: c.text,
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="scores/[blockId]"
            options={{
              headerShown: true,
              title: 'Scores',
              headerStyle: { backgroundColor: c.surface },
              headerTintColor: c.text,
              headerShadowVisible: false,
              headerBackTitle: 'Retour',
            }}
          />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
