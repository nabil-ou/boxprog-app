import 'expo-sqlite/localStorage/install';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import type { Scheme } from '@/lib/theme';

export type ThemePreference = 'light' | 'dark' | 'system';

const KEY = 'boxprog-theme';

function loadPreference(): ThemePreference {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch {
    /* stockage indisponible */
  }
  return 'system';
}

function savePreference(value: ThemePreference) {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* quota ou stockage désactivé */
  }
}

interface ThemeState {
  preference: ThemePreference;
  scheme: Scheme;
  setPreference: (value: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPref] = useState<ThemePreference>(loadPreference);
  const scheme: Scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeState>(
    () => ({
      preference,
      scheme,
      setPreference: (next) => {
        setPref(next);
        savePreference(next);
      },
    }),
    [preference, scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme hors ThemeProvider');
  return ctx;
}
