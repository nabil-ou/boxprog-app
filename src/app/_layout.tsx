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
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Image, Text, TextInput, View } from 'react-native';
import 'react-native-reanimated';

import { BRAND_FALLBACK } from '@/config/box';
import { font } from '@/lib/theme';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { BoxProvider, useBox, useBrand } from '@/providers/BoxProvider';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';

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

  return (
    <ThemeProvider>
      {fontsLoaded ? (
        <AuthProvider>
          <BoxProvider>
            <RootStack />
          </BoxProvider>
        </AuthProvider>
      ) : (
        <BootSplash />
      )}
    </ThemeProvider>
  );
}

function BootSplash() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND_FALLBACK.primary }}>
      <Image
        source={require('../../assets/images/splash-icon.png')}
        style={{ width: 180, height: 180 }}
        resizeMode="contain"
      />
    </View>
  );
}

function RootStack() {
  const { access } = useBox();
  const { recovering } = useAuth();
  const { scheme } = useTheme();
  const c = useBrand();
  const booted = useRef(false);
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  const theme = useMemo(
    () => ({
      ...base,
      colors: {
        ...base.colors,
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
    [base, c],
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
        <StatusBar style={c.onPrimary === '#FFFFFF' ? 'light' : 'dark'} />
        <ActivityIndicator color={c.onPrimary} />
      </View>
    );
  }

  const waiting = access === 'pending' || access === 'blocked' || access === 'unavailable' || access === 'error';

  return (
    <NavigationTheme value={theme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
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
    </NavigationTheme>
  );
}
