import { forwardRef } from 'react';
import type { CollectionAnalysis } from '../types/collection';
import { WatchGrid } from './WatchGrid';
import { StatsBar } from './StatsBar';
import { deriveCollectorDNA, getDNAFlexValues } from '../utils/collectorDNA';

interface CollectionCardProps {
  analysis: CollectionAnalysis;
  imageUrl: string | null;
}

export const CollectionCard = forwardRef<HTMLDivElement, CollectionCardProps>(
  function CollectionCard({ analysis, imageUrl }, ref) {
    const dna = deriveCollectorDNA(analysis.watches);
    const flexValues = getDNAFlexValues(dna);

    return (
      <div
        ref={ref}
        className="overflow-hidden rounded-2xl bg-resin-dark border border-[var(--color-border)]"
      >
        {/* Brick red top bezel accent */}
        <div className="bezel-top" />

        {/* Header */}
        <div className="px-7 pt-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-[26px] uppercase tracking-wide text-primary leading-none">
                G-Shock Collection
              </h2>
              <p className="mt-1 font-mono text-[11px] text-secondary tracking-wider uppercase">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                }).toUpperCase()} · SOTC
              </p>
            </div>
            <div className="text-right">
              <div className="font-display text-5xl text-brick leading-none">
                {analysis.total_watches}
              </div>
              <div className="font-mono text-[11px] text-secondary tracking-wider uppercase">
                pieces
              </div>
            </div>
          </div>
        </div>

        {/* Original image thumbnail (optional) */}
        {imageUrl && (
          <div className="border-b border-[var(--color-border)] p-4 mx-7 mt-4">
            <img
              src={imageUrl}
              alt="Original collection"
              className="h-32 w-full rounded-lg object-cover opacity-60"
            />
          </div>
        )}

        {/* Watch grid */}
        <div className="px-7 pt-5 pb-4">
          <WatchGrid watches={analysis.watches} />
        </div>

        {/* Stats */}
        <div className="px-7 pb-4">
          <StatsBar analysis={analysis} />
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
