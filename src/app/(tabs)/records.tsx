import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { symbol } from '@/lib/symbols';

export default function RecordsScreen() {
  return (
    <Screen>
      <EmptyState
        icon={symbol('trophy.fill', 'emoji_events')}
        title="Tes records"
        body="Tous tes PR au même endroit : charges, benchmarks et temps, avec leur historique."
      />
    </Screen>
  );
}
