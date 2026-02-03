import { forwardRef, useState, useMemo } from 'react';
import type { CollectionAnalysis } from '../types/collection';
import { PhotoHero } from './PhotoHero';
import { EditableTitle } from './EditableTitle';
import { ModelChipsList } from './ModelChipsList';
import { StatsRow } from './StatsRow';
import { deriveCollectorDNA, getDNAFlexValues } from '../utils/collectorDNA';
import { addTiersToWatches, countByTier } from '../utils/watchTiers';
import { calculateScore } from '../utils/scoreCalculation';

interface CollectionCardProps {
  analysis: CollectionAnalysis;
  photoUrl: string | null;
}

export const CollectionCard = forwardRef<HTMLDivElement, CollectionCardProps>(
  function CollectionCard({ analysis, photoUrl }, ref) {
    const [cardTitle, setCardTitle] = useState('G-SHOCK COLLECTION');

    // Memoize computed values to prevent recomputation on every render
    const watchesWithTiers = useMemo(
      () => addTiersToWatches(analysis.watches),
      [analysis.watches]
    );

    const tierCounts = useMemo(
      () => countByTier(watchesWithTiers),
      [watchesWithTiers]
    );

    const dna = useMemo(
      () => deriveCollectorDNA(analysis.watches),
      [analysis.watches]
    );

    const flexValues = useMemo(
      () => getDNAFlexValues(dna),
      [dna]
    );

    const score = useMemo(
      () => calculateScore(analysis),
      [analysis]
    );

    const seriesCount = Object.keys(analysis.series_breakdown).length;
    const rareCount = tierCounts.rare + tierCounts.premium;

    return (
      <div
        ref={ref}
        className="overflow-hidden rounded-2xl bg-resin-dark border border-[var(--color-border)]"
        style={{ width: '480px', maxWidth: '100%' }}
      >
        {/* Header */}
        <div className="px-7 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <EditableTitle value={cardTitle} onChange={setCardTitle} />
              <p className="mt-1 font-mono text-[11px] text-secondary tracking-wider uppercase">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                }).toUpperCase()} · SOTC
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-display text-5xl text-brick leading-none">
                {analysis.total_watches}
              </div>
              <div className="font-mono text-[11px] text-secondary tracking-wider uppercase">
                pieces
              </div>
            </div>
          </div>
        </div>

        {/* Photo Hero */}
        <PhotoHero imageUrl={photoUrl} />

        {/* Model Chips */}
        <div className="px-7 pt-5 pb-4">
          <ModelChipsList watches={watchesWithTiers} />
        </div>

        {/* Stats Row */}
        <div className="px-7 pb-4">
          <StatsRow
            pieces={analysis.total_watches}
            series={seriesCount}
            rare={rareCount}
            score={score}
          />
        </div>

        {/* Collector DNA bar */}
        {dna.length > 0 && (
          <div className="px-7 pb-5">
            <div className="font-mono text-[11px] text-secondary tracking-widest uppercase mb-2.5">
              Collector DNA
            </div>
            <div className="dna-bar">
              {dna.map((archetype, index) => (
                <div
                  key={archetype.name}
                  className={`dna-segment ${archetype.color}`}
                  style={{ flex: flexValues[index] }}
                >
                  {archetype.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer watermark */}
        <div className="border-t border-[var(--color-border)] px-7 py-3.5">
          <div className="flex items-center justify-between">
            <span className="font-logo text-[13px] font-semibold tracking-widest">
              <span className="text-brick">sotc</span>
              <span className="text-secondary">.app</span>
            </span>
            <span className="font-mono text-[11px] text-secondary tracking-wider">
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              }).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    );
  }
);
