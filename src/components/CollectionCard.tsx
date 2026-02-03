import { forwardRef } from 'react';
import type { CollectionAnalysis } from '../types/collection';
import { WatchGrid } from './WatchGrid';
import { StatsBar } from './StatsBar';

interface CollectionCardProps {
  analysis: CollectionAnalysis;
  imageUrl: string | null;
}

export const CollectionCard = forwardRef<HTMLDivElement, CollectionCardProps>(
  function CollectionCard({ analysis, imageUrl }, ref) {
    return (
      <div
        ref={ref}
        className="overflow-hidden rounded-xl bg-secondary"
      >
        {/* Header */}
        <div className="border-b border-steel-dark/30 bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">
                G-Shock Collection
              </h2>
              <p className="mt-1 text-sm text-steel">
                State of the Collection
              </p>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-steel-dark">
                {new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Original image thumbnail (optional) */}
        {imageUrl && (
          <div className="border-b border-steel-dark/30 p-4">
            <img
              src={imageUrl}
              alt="Original collection"
              className="h-32 w-full rounded-lg object-cover opacity-60"
            />
          </div>
        )}

        {/* Stats */}
        <div className="p-4">
          <StatsBar analysis={analysis} />
        </div>

        {/* Watch grid */}
        <div className="px-4 pb-4">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-steel">
            Identified Pieces
          </div>
          <WatchGrid watches={analysis.watches} />
        </div>

        {/* Footer watermark */}
        <div className="border-t border-steel-dark/30 bg-card px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-semibold text-accent-orange">
              SOTC.app
            </span>
            <span className="text-xs text-steel-dark">
              Powered by Claude Vision AI
            </span>
          </div>
        </div>
      </div>
    );
  }
);
