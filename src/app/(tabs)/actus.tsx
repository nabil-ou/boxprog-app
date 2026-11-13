import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { symbol } from '@/lib/symbols';
import { useActiveBox } from '@/providers/BoxProvider';

export default function NewsScreen() {
  const box = useActiveBox();
  return (
    <Screen>
      <EmptyState
        icon={symbol('megaphone.fill', 'campaign')}
        title="Les actus de la box"
        body={`Les annonces de ${box.name} arriveront ici, sous forme de fil d’actualité : événements, horaires, nouveautés.`}
      />
    </Screen>
  );
}
