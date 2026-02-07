import { useMemo } from 'react';
import { EditableChip } from './EditableChip';
import type { WatchWithTier } from '../utils/watchTiers';
import { getMaxCharsForGrid } from '../utils/abbreviateModel';

interface SpatialChipGridProps {
  watches: WatchWithTier[];
  gridRows: number;
  gridCols: number;
  editedModels: Map<number, string>;
  onModelEdit: (index: number, newValue: string) => void;
}

// Extended watch type with position info
type WatchWithPosition = WatchWithTier & {
  originalIndex: number;
  parsedRow: number;
  parsedCol: number;
};

// Maximum number of chips to display
const MAX_CHIPS = 18;

/**
 * Parse position string to extract row and column
 * Reused from PhotoOverlay.tsx
 */
function parsePosition(position: string): { row: number; col: number } {
  // Try new structured format first: "row-N-pos-M"
  const structuredMatch = position.match(/row-(\d+)-pos-(\d+)/i);
  if (structuredMatch) {
    return {
      row: parseInt(structuredMatch[1], 10),
      col: parseInt(structuredMatch[2], 10),
    };
  }

  // Fallback to legacy parsing
  const pos = position.toLowerCase();
  let row = 1;
  let col = 1;

  if (pos.includes('top')) row = 1;
  else if (pos.includes('middle') || pos.includes('center')) row = 2;
  else if (pos.includes('bottom')) row = 3;

  if (pos.includes('left')) col = 1;
  else if (pos.includes('center') || pos.includes('middle')) col = 2;
  else if (pos.includes('right')) col = 3;

  // Try to extract numbers from position string
  const rowMatch = pos.match(/row\s*(\d+)/i);
  const colMatch = pos.match(/(\d+)(?:st|nd|rd|th)?\s*(?:from\s*left|position|pos)/i);
  if (rowMatch) row = parseInt(rowMatch[1], 10);
  if (colMatch) col = parseInt(colMatch[1], 10);

  return { row, col };
}

/**
 * SpatialChipGrid - CSS Grid of editable chips matching photo layout
 * Chips appear BELOW the hero photo, arranged in a grid that mirrors
 * the watch positions in the photo.
 */
export function SpatialChipGrid({
  watches,
  gridRows,
  gridCols,
  editedModels,
  onModelEdit,
}: SpatialChipGridProps) {
  // Parse positions and prepare grid data
  const gridData = useMemo(() => {
    // Create a 2D array to hold watches by position
    const grid: WatchWithPosition[][] = Array.from(
      { length: gridRows },
      () => []
    );

    watches.forEach((watch, index) => {
      const { row, col } = parsePosition(watch.position);
      // Ensure row is within bounds
      const safeRow = Math.min(Math.max(row - 1, 0), gridRows - 1);
      grid[safeRow].push({
        ...watch,
        originalIndex: index,
        parsedRow: row,
        parsedCol: col,
      });
    });

    // Sort each row by column position
    grid.forEach((row) => {
      row.sort((a, b) => a.parsedCol - b.parsedCol);
    });

    return grid;
  }, [watches, gridRows]);

  // Flatten for display, respecting MAX_CHIPS limit
  const flatWatches = useMemo(() => {
    const flat: (WatchWithPosition & { row: number; col: number })[] = [];

    gridData.forEach((row, rowIndex) => {
      row.forEach((watch, colIndex) => {
        flat.push({
          ...watch,
          row: rowIndex + 1,
          col: colIndex + 1,
        });
      });
    });

    return flat;
  }, [gridData]);

  const displayWatches = flatWatches.slice(0, MAX_CHIPS);
  const extraCount = flatWatches.length - MAX_CHIPS;

  // Determine if we need smaller chips for large collections
  const isLargeCollection = watches.length > 12;

  // Calculate max chars based on grid columns for smart abbreviation
  const maxChars = getMaxCharsForGrid(gridCols);

  if (watches.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: 'var(--color-bg-surface)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gap: '8px',
        }}
      >
        {displayWatches.map((watch) => {
          const displayValue = editedModels.get(watch.originalIndex) ?? watch.model_number;

          return (
            <div
              key={`${watch.model_number}-${watch.originalIndex}`}
              style={{
                gridColumn: watch.col,
                gridRow: watch.row,
                minWidth: 0, // Allow shrinking in grid
                overflow: 'hidden',
              }}
            >
              <EditableChip
                value={displayValue}
                originalValue={watch.model_number}
                tier={watch.tier}
                onChange={(newValue) => onModelEdit(watch.originalIndex, newValue)}
                maxChars={maxChars}
              />
            </div>
          );
        })}
      </div>

      {/* "+N more" indicator for large collections */}
      {extraCount > 0 && (
        <div
          style={{
            marginTop: '12px',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-roboto-mono)',
              fontSize: isLargeCollection ? '9px' : '10px',
              color: 'var(--color-text-muted)',
              letterSpacing: '0.05em',
            }}
          >
            +{extraCount} more
          </span>
        </div>
      )}
    </div>
  );
}
