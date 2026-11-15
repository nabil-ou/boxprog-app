import { ChipGroup } from '@/components/Chip';
import { LEVELS, type Level } from '@/lib/types';

export function LevelChips({ value, onChange }: { value: Level; onChange: (l: Level) => void }) {
  return (
    <ChipGroup
      options={LEVELS.map((l) => ({ value: l, label: l }))}
      value={value}
      onChange={onChange}
    />
  );
}
