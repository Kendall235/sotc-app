import { useMemo } from 'react';
import type { WatchWithTier } from '../utils/watchTiers';
import { ModelChip } from './ModelChip';

interface ModelChipsListProps {
  watches: WatchWithTier[];
}

// Parse position string to get sort order (top-left → bottom-right)
function parsePosition(position: string): number {
  const pos = position.toLowerCase();
  let row = 0;
  let col = 0;

  // Vertical position
  if (pos.includes('top')) row = 0;
  else if (pos.includes('middle') || pos.includes('center')) row = 1;
  else if (pos.includes('bottom')) row = 2;

  // Horizontal position
  if (pos.includes('left')) col = 0;
  else if (pos.includes('center') || pos.includes('middle')) col = 1;
  else if (pos.includes('right')) col = 2;

  return row * 10 + col;
}

// Derive columns from common watch case layouts
function getColumnsFromCount(count: number): number {
  if (count <= 3) return count;      // 1×3 or less
  if (count === 4) return 2;         // 2×2
  if (count === 5) return 5;         // 1×5 (single row)
  if (count === 6) return 3;         // 2×3
  if (count <= 8) return 4;          // 2×4
  if (count === 9) return 3;         // 3×3
  if (count === 10) return 5;        // 2×5
  if (count === 12) return 4;        // 3×4
  if (count <= 15) return 5;         // 3×5
  if (count <= 18) return 6;         // 3×6 (standard large case)
  if (count <= 24) return 6;         // 4×6
  return 6;                          // 6 columns max for readability
}

export function ModelChipsList({ watches }: ModelChipsListProps) {
  // Sort watches by position (top-left to bottom-right) using useMemo
  const sortedWatches = useMemo(() => {
    return [...watches].sort((a, b) => {
      return parsePosition(a.position) - parsePosition(b.position);
    });
  }, [watches]);

  // Check if we have multiple tiers to show legend
  const hasTiers = useMemo(() => {
    const tiers = new Set(watches.map(w => w.tier));
    return tiers.size > 1;
  }, [watches]);

  const hasRare = watches.some(w => w.tier === 'rare');
  const hasPremium = watches.some(w => w.tier === 'premium');

  const columns = getColumnsFromCount(watches.length);

  return (
    <div>
      {/* Chips grid */}
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {sortedWatches.map((watch, index) => (
          <ModelChip
            key={`${watch.model_number}-${index}`}
            model={watch.model_number}
            tier={watch.tier}
          />
        ))}
      </div>

      {/* Tier legend - only show if multiple tiers present */}
      {hasTiers && (
        <div className="flex items-center gap-4 mt-3 font-mono text-[9px] tracking-wider uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-[#B0ACA6]" />
            <span className="text-secondary">Standard</span>
          </div>
          {hasRare && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-gold" />
              <span className="text-secondary">Rare</span>
            </div>
          )}
          {hasPremium && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-brick" />
              <span className="text-secondary">Premium</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
