import type { CollectionAnalysis } from '../types/collection';

interface StatsBarProps {
  analysis: CollectionAnalysis;
}

export function StatsBar({ analysis }: StatsBarProps) {
  const seriesCount = Object.keys(analysis.series_breakdown).length;
  const topSeries = Object.entries(analysis.series_breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="rounded-lg bg-card p-4">
      {/* Main stats row */}
      <div className="flex flex-wrap items-center gap-6 border-b border-steel-dark/30 pb-4">
        {/* Total count */}
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold text-accent-orange">
            {analysis.total_watches}
          </span>
          <span className="text-sm text-steel">
            {analysis.total_watches === 1 ? 'watch' : 'watches'}
          </span>
        </div>

        {/* Series count */}
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold text-white">
            {seriesCount}
          </span>
          <span className="text-sm text-steel">
            {seriesCount === 1 ? 'series' : 'series'}
          </span>
        </div>

        {/* Confidence breakdown */}
        <div className="ml-auto flex items-center gap-3">
          <ConfidenceIndicator
            count={analysis.watches.filter(w => w.confidence === 'high').length}
            total={analysis.total_watches}
            level="high"
          />
          <ConfidenceIndicator
            count={analysis.watches.filter(w => w.confidence === 'medium').length}
            total={analysis.total_watches}
            level="medium"
          />
          <ConfidenceIndicator
            count={analysis.watches.filter(w => w.confidence === 'low').length}
            total={analysis.total_watches}
            level="low"
          />
        </div>
      </div>

      {/* Series breakdown */}
      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-steel">
          Series Breakdown
        </div>
        <div className="flex flex-wrap gap-2">
          {topSeries.map(([series, count]) => (
            <div
              key={series}
              className="flex items-center gap-2 rounded bg-secondary px-3 py-1.5"
            >
              <span className="font-mono text-sm text-white">{count}</span>
              <span className="text-xs text-steel">{series}</span>
            </div>
          ))}
          {Object.keys(analysis.series_breakdown).length > 3 && (
            <div className="flex items-center px-2 text-xs text-steel-dark">
              +{Object.keys(analysis.series_breakdown).length - 3} more
            </div>
          )}
        </div>
      </div>

      {/* Collection highlights */}
      {analysis.collection_highlights.length > 0 && (
        <div className="mt-4 border-t border-steel-dark/30 pt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-steel">
            Highlights
          </div>
          <ul className="space-y-1">
            {analysis.collection_highlights.map((highlight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-steel-light">
                <span className="mt-1 text-accent-teal">•</span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface ConfidenceIndicatorProps {
  count: number;
  total: number;
  level: 'high' | 'medium' | 'low';
}

function ConfidenceIndicator({ count, level }: ConfidenceIndicatorProps) {
  if (count === 0) return null;

  const colors = {
    high: 'bg-confidence-high',
    medium: 'bg-confidence-medium',
    low: 'bg-confidence-low',
  };

  const labels = {
    high: 'confirmed',
    medium: 'likely',
    low: 'uncertain',
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-2 w-2 rounded-full ${colors[level]}`} />
      <span className="text-xs text-steel">
        {count} {labels[level]}
      </span>
    </div>
  );
}
