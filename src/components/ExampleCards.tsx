import { exampleCollection } from '../data/examples';

// Generate pseudo-random time based on model
function generateLCDTime(modelNumber: string): string {
  const hash = modelNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hours = (hash % 12) + 1;
  const minutes = ((hash * 7) % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function ExampleCards() {
  const topWatches = exampleCollection.watches.slice(0, 4);

  return (
    <div className="mt-16">
      <h2 className="mb-6 text-center font-mono text-xs text-secondary tracking-widest uppercase">
        Example Output
      </h2>

      {/* Mini preview card */}
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl bg-resin-dark border border-[var(--color-border)] card-glow">
        {/* Bezel accent */}
        <div className="bezel-top" />

        {/* Header */}
        <div className="px-5 pt-4 pb-0">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg uppercase tracking-wide text-primary">
              G-Shock Collection
            </span>
            <span className="font-display text-3xl text-brick">
              {exampleCollection.total_watches}
            </span>
          </div>
        </div>

        {/* Watch previews with LCD faces */}
        <div className="grid grid-cols-2 gap-1 p-4">
          {topWatches.map((watch, index) => (
            <div
              key={index}
              className="rounded-lg bg-resin-mid p-3 text-center"
            >
              {/* LCD face */}
              <div className="flex justify-center mb-1.5">
                <div className="lcd-face square-face">
                  <span className="lcd-face-text text-[9px]">{generateLCDTime(watch.model_number)}</span>
                </div>
              </div>
              <div className="font-mono text-[10px] font-semibold text-primary">
                {watch.model_number}
              </div>
              <div className="mt-0.5 text-[9px] text-secondary uppercase tracking-wide">
                {watch.series}
              </div>
            </div>
          ))}
        </div>

        {/* Series breakdown preview with bars */}
        <div className="border-t border-[var(--color-border)] px-5 py-3">
          <div className="font-mono text-[10px] text-secondary tracking-wider uppercase mb-2">
            Series
          </div>
          <div className="space-y-1.5">
            {Object.entries(exampleCollection.series_breakdown).slice(0, 2).map(([series, count]) => (
              <div key={series} className="flex items-center gap-2">
                <span className="font-mono text-xs text-primary w-20 truncate">{series}</span>
                <div className="series-bar h-1">
                  <div
                    className="series-bar-fill brick"
                    style={{ width: `${(count / exampleCollection.total_watches) * 100}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-gold">{count}</span>
              </div>
            ))}
          </div>
          {Object.keys(exampleCollection.series_breakdown).length > 2 && (
            <span className="text-[10px] text-muted font-mono">
              +{Object.keys(exampleCollection.series_breakdown).length - 2} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-border)] px-5 py-2.5 text-center">
          <span className="text-xs text-muted">
            Upload your collection to generate your own card
          </span>
        </div>
      </div>
    </div>
  );
}
