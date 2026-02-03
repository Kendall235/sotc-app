import type { Watch } from '../types/collection';

interface WatchTileProps {
  watch: Watch;
  index: number;
}

const displayTypeBadgeClass: Record<Watch['display_type'], string> = {
  Digital: 'badge-digital',
  Analog: 'badge-analog',
  'Ana-Digi': 'badge-ana-digi',
};

const confidenceColors: Record<Watch['confidence'], string> = {
  high: 'bg-confidence-high',
  medium: 'bg-confidence-medium',
  low: 'bg-confidence-low',
};

export function WatchTile({ watch, index }: WatchTileProps) {
  return (
    <div className="group relative rounded-lg bg-elevated p-4 transition-all hover:bg-card card-glow">
      {/* Confidence indicator */}
      <div
        className={`absolute right-3 top-3 h-2 w-2 rounded-full ${confidenceColors[watch.confidence]}`}
        title={`${watch.confidence} confidence`}
      />

      {/* Index number */}
      <div className="absolute left-3 top-3 font-mono text-xs text-steel-dark">
        #{index + 1}
      </div>

      {/* Model number */}
      <div className="mt-4 font-mono text-sm font-semibold text-white">
        {watch.model_number}
      </div>

      {/* Series badge */}
      <div className="mt-2 inline-flex items-center gap-1.5">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${displayTypeBadgeClass[watch.display_type]}`}>
          {watch.display_type}
        </span>
        <span className="text-xs text-steel">
          {watch.series}
        </span>
      </div>

      {/* Colorway */}
      <div className="mt-2 text-xs text-steel-light">
        {watch.colorway}
      </div>

      {/* Notable features */}
      {watch.notable_features.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {watch.notable_features.slice(0, 3).map((feature, i) => (
            <span
              key={i}
              className="rounded bg-secondary px-1.5 py-0.5 text-xs text-accent-teal"
            >
              {feature}
            </span>
          ))}
          {watch.notable_features.length > 3 && (
            <span className="text-xs text-steel-dark">
              +{watch.notable_features.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Position hint on hover */}
      <div className="absolute bottom-2 left-3 right-3 hidden text-xs text-steel-dark group-hover:block">
        {watch.position}
      </div>
    </div>
  );
}
