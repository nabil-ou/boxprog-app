import { router } from 'expo-router';

import { ModeHome } from '@/components/chrono/ModeHome';
import type { OtherFormatId } from '@/lib/chrono/defaults';
import type { HomeFormat } from '@/lib/chrono/types';
import { useChronoConfig } from '@/providers/ChronoProvider';

export default function ChronoHomeScreen() {
  const { openFormat, openOther, openEmpty } = useChronoConfig();

  const goSetup = () => router.push('/(tabs)/chrono/setup');

  const onSelect = (format: HomeFormat) => {
    openFormat(format);
    goSetup();
  };

  const onOther = (id: OtherFormatId) => {
    openOther(id);
    goSetup();
  };

  const onCreate = () => {
    openEmpty();
    goSetup();
  };

  return <ModeHome onSelect={onSelect} onOther={onOther} onCreate={onCreate} />;
}
