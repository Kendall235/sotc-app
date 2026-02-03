import type { CollectionAnalysis } from '../types/collection';

interface StatsBarProps {
  analysis: CollectionAnalysis;
}

export function StatsBar({ analysis }: StatsBarProps) {
  const seriesCount = Object.keys(analysis.series_breakdown).length;
  const topSeries = Object.entries(analysis.series_breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  // Calculate max count for progress bar scaling
  const maxCount = Math.max(...Object.values(analysis.series_breakdown), 5);

  return (
    <div className="rounded-xl bg-resin-mid p-4">
      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-[3px] mb-4">
        <div className="bg-resin-dark rounded-l-lg py-3.5 px-2 text-center">
          <div className="font-display text-[26px] text-brick leading-none mb-1">
            {analysis.total_watches}
          </div>
          <div className="font-mono text-[11px] text-secondary tracking-wider uppercase">
            Pieces
          </div>
        </div>
        <div className="bg-resin-dark py-3.5 px-2 text-center">
          <div className="font-display text-[26px] text-primary leading-none mb-1">
            {seriesCount}
          </div>
          <div className="font-mono text-[11px] text-secondary tracking-wider uppercase">
            Series
          </div>
        </div>
        <div className="bg-resin-dark py-3.5 px-2 text-center">
          <div className="font-display text-[26px] text-gold leading-none mb-1">
            {analysis.watches.filter(w => w.confidence === 'high').length}
          </div>
          <div className="font-mono text-[11px] text-secondary tracking-wider uppercase">
            Confirmed
          </div>
        </div>
        <div className="bg-resin-dark rounded-r-lg py-3.5 px-2 text-center">
          <div className="font-display text-[26px] text-primary leading-none mb-1">
            {analysis.watches.filter(w => w.display_type === 'Digital').length}
          </div>
          <div className="font-mono text-[11px] text-secondary tracking-wider uppercase">
            Digital
          </div>
        </div>
      </div>

      {/* Series breakdown with progress bars */}
      <div>
        <div className="font-mono text-[11px] text-secondary tracking-widest uppercase mb-3">
          Series Breakdown
        </div>
        <div className="space-y-2">
          {topSeries.map(([series, count], index) => (
            <div key={series} className="flex items-center gap-2.5">
              <span className="font-mono text-xs text-primary w-28 flex-shrink-0 truncate">
                {series}
              </span>
              <div className="series-bar">
                <div
                  className={`series-bar-fill ${index < 2 ? 'brick' : 'gold'}`}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="font-mono text-xs text-secondary w-8 text-right flex-shrink-0">
                {count}
              </span>
            </div>
          ))}
          {Object.keys(analysis.series_breakdown).length > 4 && (
            <div className="text-xs text-muted mt-1 font-mono">
              +{Object.keys(analysis.series_breakdown).length - 4} more series
            </div>
          )}
        </div>
      </div>

      {/* Collection highlights */}
      {analysis.collection_highlights.length > 0 && (
        <div className="mt-4 border-t border-[var(--color-border)] pt-4">
          <div className="font-mono text-[11px] text-secondary tracking-widest uppercase mb-2">
            Highlights
          </div>
          <ul className="space-y-1">
            {analysis.collection_highlights.map((highlight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-secondary">
                <span className="mt-1 text-gold">•</span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
