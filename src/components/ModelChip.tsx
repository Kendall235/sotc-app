import type { WatchTier } from '../utils/watchTiers';

interface ModelChipProps {
  model: string;
  tier: WatchTier;
}

// TODO: Future - clickable chips for detail view
export function ModelChip({ model, tier }: ModelChipProps) {
  const chipClass = {
    standard: 'chip-standard',
    rare: 'chip-rare',
    premium: 'chip-premium',
  }[tier];

  return (
    <span
      className={`inline-block font-mono text-[10px] px-2.5 py-1 rounded ${chipClass}`}
    >
      {model}
    </span>
  );
}
