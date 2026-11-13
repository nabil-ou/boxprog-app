import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { symbol } from '@/lib/symbols';

export default function TimerScreen() {
  return (
    <Screen>
      <EmptyState
        icon={symbol('stopwatch.fill', 'timer')}
        title="Ton chrono"
        body="AMRAP, EMOM, For Time, Tabata ou intervalles sur mesure : tu pourras régler chaque phase, chaque son et chaque compte à rebours."
      />
    </Screen>
  );
}
