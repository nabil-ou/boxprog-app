import type { SymbolViewProps } from 'expo-symbols';

/** Nom de symbole multi-plateforme compatible avec le typage strict d’expo-symbols. */
export function symbol(ios: string, android: string): SymbolViewProps['name'] {
  return { ios, android, web: android } as unknown as SymbolViewProps['name'];
}
