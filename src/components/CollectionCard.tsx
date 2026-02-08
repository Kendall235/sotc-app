import { forwardRef, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { CollectionAnalysis } from '../types/collection';
import { PhotoFrame } from './PhotoFrame';
import { SpatialChipGrid } from './SpatialChipGrid';
import { EditableTitle } from './EditableTitle';
import { StatsBar } from './StatsBar';
import { DNABar } from './DNABar';
import { deriveCollectorDNA } from '../utils/collectorDNA';
import { addTiersToWatches, countByTier } from '../utils/watchTiers';

interface CollectionCardProps {
  analysis: CollectionAnalysis;
  photoUrl: string | null;
  cardId?: string;
}

export const CollectionCard = forwardRef<HTMLDivElement, CollectionCardProps>(
  function CollectionCard({ analysis, photoUrl, cardId }, ref) {
    const [cardTitle, setCardTitle] = useState('G-SHOCK COLLECTION');
    const [editedModels, setEditedModels] = useState<Map<number, string>>(new Map());
    const [cardWidth, setCardWidth] = useState(600);
    const cardContainerRef = useRef<HTMLDivElement | null>(null);

    // Measure actual card width with ResizeObserver
    useEffect(() => {
      const element = cardContainerRef.current;
      if (!element) return;

      const observer = new ResizeObserver(([entry]) => {
        setCardWidth(entry.contentRect.width);
      });
      observer.observe(element);
      return () => observer.disconnect();
    }, []);

    // Handler for model edits
    const handleModelEdit = useCallback((index: number, newValue: string) => {
      setEditedModels((prev) => new Map(prev).set(index, newValue));
    }, []);

    // Memoize computed values
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

    // Count unique series
    const seriesCount = Object.keys(analysis.series_breakdown).length;

    // Count collaborations (rare tier is used for collabs)
    const collabCount = tierCounts.rare;

    // Count premium pieces
    const premiumCount = tierCounts.premium;

    const date = new Date()
      .toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
      .toUpperCase();

    // Merge refs for both forwarded ref and local measurement ref
    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        cardContainerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    return (
      <div
        ref={setRefs}
        className="collection-card overflow-hidden"
        style={{
          width: '600px',
          maxWidth: '100%',
          backgroundColor: 'var(--color-bg-card)',
          borderRadius: '4px',
          borderTop: '3px solid var(--color-gshock-red)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 pt-4 pb-3 flex justify-between items-start"
          style={{ backgroundColor: 'var(--color-bg-surface)' }}
        >
          <div className="flex-1 min-w-0 pr-4">
            <EditableTitle value={cardTitle} onChange={setCardTitle} />
            <p className="font-roboto-mono text-[10px] text-muted tracking-wider uppercase mt-1">
              {cardId ? (
                <>
                  <span style={{ color: 'var(--color-gshock-red)' }}>sotc</span>
                  <span>.app/{cardId}</span>
                  <span> · {date}</span>
                </>
              ) : (
                <>{date} · SOTC</>
              )}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <div
              className="font-oswald text-[42px] font-semibold leading-none"
              style={{ color: 'var(--color-gshock-red)' }}
            >
              {analysis.total_watches}
            </div>
            <div className="font-roboto-mono text-[10px] text-muted tracking-wider uppercase">
              pieces
            </div>
          </div>
        </div>

        {/* Hero Photo Frame - clean, no overlays */}
        <PhotoFrame imageUrl={photoUrl} />

        {/* Spatial Chip Grid - model numbers below photo */}
        <SpatialChipGrid
          watches={watchesWithTiers}
          gridRows={analysis.grid_rows}
          gridCols={analysis.grid_cols}
          editedModels={editedModels}
          onModelEdit={handleModelEdit}
          cardWidth={cardWidth}
        />

        {/* Stats Bar */}
        <StatsBar
          pieces={analysis.total_watches}
          series={seriesCount}
          collab={collabCount}
          premium={premiumCount}
        />

        {/* DNA Bar */}
        {dna.length > 0 && (
          <div className="px-5 pt-3 pb-4">
            <p className="font-roboto-mono text-[9px] text-muted tracking-wider uppercase mb-2">
              Collector DNA
            </p>
            <DNABar archetypes={dna} cardWidth={cardWidth} />
          </div>
        )}

        {/* Footer */}
        <div
          className="px-5 py-3"
          style={{
            backgroundColor: 'var(--color-bg-surface)',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-oswald text-[12px] font-medium tracking-widest uppercase">
              <span style={{ color: 'var(--color-gshock-red)' }}>sotc</span>
              <span className="text-secondary">.app</span>
              {cardId && <span className="text-muted">/{cardId}</span>}
            </span>
            <span className="font-roboto-mono text-[10px] text-muted tracking-wider">
              {date}
            </span>
          </div>
        </div>
      </div>
    );
  }
);
