import { router } from 'expo-router';

import { ModeHome } from '@/components/chrono/ModeHome';
import type { HomeFormat } from '@/lib/chrono/types';
import { useChronoConfig } from '@/providers/ChronoProvider';

export default function ChronoHomeScreen() {
  const { cfg, openFormat, openEmpty, openFavorite, deleteFavorite } = useChronoConfig();

  const goSetup = () => router.push('/(tabs)/chrono/setup');

  const onSelect = (format: HomeFormat) => {
    openFormat(format);
    goSetup();
  };

  const onCreate = () => {
    openEmpty();
    goSetup();
  };

  const onOpenFavorite = (id: string) => {
    openFavorite(id);
    goSetup();
  };

  return (
    <ModeHome
      onSelect={onSelect}
      onCreate={onCreate}
      onBack={() => router.back()}
      favorites={cfg.favs}
      onOpenFavorite={onOpenFavorite}
      onDeleteFavorite={deleteFavorite}
    />
  );
}
