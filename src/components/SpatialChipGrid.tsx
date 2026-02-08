import { useMemo } from 'react';
import { EditableChip } from './EditableChip';
import type { WatchWithTier } from '../utils/watchTiers';

interface SpatialChipGridProps {
  watches: WatchWithTier[];
  gridRows: number;
  gridCols: number;
  editedModels: Map<number, string>;
  onModelEdit: (index: number, newValue: string) => void;
  cardWidth?: number;
}

const MAX_CHIPS = 18;

function parsePosition(position: string): { row: number; col: number } {
  const structuredMatch = position.match(/row-(\d+)-pos-(\d+)/i);
  if (structuredMatch) {
    return {
      row: parseInt(structuredMatch[1], 10),
      col: parseInt(structuredMatch[2], 10),
    };
  }

  const pos = position.toLowerCase();
  let row = 1;
  let col = 1;

  if (pos.includes('top')) row = 1;
  else if (pos.includes('middle') || pos.includes('center')) row = 2;
  else if (pos.includes('bottom')) row = 3;

  if (pos.includes('left')) col = 1;
  else if (pos.includes('center') || pos.includes('middle')) col = 2;
  else if (pos.includes('right')) col = 3;

  const rowMatch = pos.match(/row\s*(\d+)/i);
  const colMatch = pos.match(/(\d+)(?:st|nd|rd|th)?\s*(?:from\s*left|position|pos)/i);
  if (rowMatch) row = parseInt(rowMatch[1], 10);
  if (colMatch) col = parseInt(colMatch[1], 10);

  return { row, col };
}

export function SpatialChipGrid({
  watches,
  editedModels,
  onModelEdit,
  cardWidth = 600,
}: SpatialChipGridProps) {
  // Parse positions for all watches
  const watchesWithPositions = useMemo(() => {
    return watches.map((watch, index) => {
      const { row, col } = parsePosition(watch.position);
      return {
        ...watch,
        originalIndex: index,
        parsedRow: row,
        parsedCol: col,
      };
    });
  }, [watches]);

  // Calculate actual grid dimensions from MAX parsed positions
  const actualGridDimensions = useMemo(() => {
    let maxRow = 1;
    let maxCol = 1;

    watchesWithPositions.forEach((watch) => {
      if (watch.parsedRow > maxRow) maxRow = watch.parsedRow;
      if (watch.parsedCol > maxCol) maxCol = watch.parsedCol;
    });

    return { rows: maxRow, cols: maxCol };
  }, [watchesWithPositions]);

  // Sort by row then column, respecting MAX_CHIPS limit
  const displayWatches = useMemo(() => {
    const sorted = [...watchesWithPositions].sort((a, b) => {
      if (a.parsedRow !== b.parsedRow) return a.parsedRow - b.parsedRow;
      return a.parsedCol - b.parsedCol;
    });
    return sorted.slice(0, MAX_CHIPS);
  }, [watchesWithPositions]);

  // Calculate optimal font size based on grid dimensions and longest model name
  const optimalFontSize = useMemo(() => {
    const CARD_PADDING = 16 * 2; // left + right
    const GAP = 8;
    const CHIP_PADDING = 19; // 6 + 10 + 3px border
    const CHAR_WIDTH_RATIO = 0.65; // Roboto Mono character width ratio
    const MIN_FONT_SIZE = 7;
    const MAX_FONT_SIZE = 11;

    const cols = actualGridDimensions.cols;
    const gridWidth = cardWidth - CARD_PADDING;
    const totalGaps = (cols - 1) * GAP;
    const colWidth = (gridWidth - totalGaps) / cols;
    const textWidth = colWidth - CHIP_PADDING;

    // Find longest model name
    const longestName = displayWatches.reduce(
      (max, w) => Math.max(max, w.model_number.length),
      0
    );

    // Calculate font size that fits longest name
    // textWidth = longestName * CHAR_WIDTH_RATIO * fontSize
    // fontSize = textWidth / (longestName * CHAR_WIDTH_RATIO)
    const calculatedSize = Math.floor(textWidth / (longestName * CHAR_WIDTH_RATIO));

    return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, calculatedSize));
  }, [actualGridDimensions.cols, displayWatches, cardWidth]);

  const extraCount = watchesWithPositions.length - MAX_CHIPS;
  const isLargeCollection = watches.length > 12;

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
          gridTemplateColumns: `repeat(${actualGridDimensions.cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${actualGridDimensions.rows}, auto)`,
          gap: '8px',
        }}
      >
        {displayWatches.map((watch) => {
          const displayValue = editedModels.get(watch.originalIndex) ?? watch.model_number;

          return (
            <div
              key={`${watch.model_number}-${watch.originalIndex}`}
              style={{
                gridColumn: watch.parsedCol,
                gridRow: watch.parsedRow,
                minWidth: 0,
              }}
            >
              <EditableChip
                value={displayValue}
                originalValue={watch.model_number}
                tier={watch.tier}
                fontSize={optimalFontSize}
                onChange={(newValue) => onModelEdit(watch.originalIndex, newValue)}
              />
            </div>
          );
        })}
      </div>

      {extraCount > 0 && (
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
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
