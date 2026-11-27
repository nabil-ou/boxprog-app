import { ChipGroup } from '@/components/Chip';
import { boxLevels, type Level } from '@/lib/types';
import { useActiveBox } from '@/providers/BoxProvider';

export function LevelChips({ value, onChange }: { value: Level; onChange: (l: Level) => void }) {
  const box = useActiveBox();
  return (
    <ChipGroup
      options={boxLevels(box).map((l) => ({ value: l, label: l }))}
      value={value}
      onChange={onChange}
    />
  );
}
