import { exampleCollection } from '../data/examples';

export function ExampleCards() {
  const topWatches = exampleCollection.watches.slice(0, 4);

  return (
    <div className="mt-16">
      <h2 className="mb-6 text-center font-display text-xl font-semibold text-steel-light">
        Example Output
      </h2>

      {/* Mini preview card */}
      <div className="mx-auto max-w-md overflow-hidden rounded-xl bg-secondary card-glow">
        {/* Header */}
        <div className="border-b border-steel-dark/30 bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold text-white">
              G-Shock Collection
            </span>
            <span className="font-display text-2xl font-bold text-accent-orange">
              {exampleCollection.total_watches}
            </span>
          </div>
        </div>

        {/* Watch previews */}
        <div className="grid grid-cols-2 gap-2 p-3">
          {topWatches.map((watch, index) => (
            <div
              key={index}
              className="rounded bg-elevated p-2"
            >
              <div className="font-mono text-xs text-white">
                {watch.model_number}
              </div>
              <div className="mt-1 text-xs text-steel">
                {watch.series}
              </div>
            </div>
          ))}
        </div>

        {/* Series breakdown preview */}
        <div className="border-t border-steel-dark/30 p-3">
          <div className="flex flex-wrap gap-2">
            {Object.entries(exampleCollection.series_breakdown).slice(0, 3).map(([series, count]) => (
              <span key={series} className="flex items-center gap-1 text-xs">
                <span className="font-mono text-accent-teal">{count}</span>
                <span className="text-steel">{series}</span>
              </span>
            ))}
            <span className="text-xs text-steel-dark">+{Object.keys(exampleCollection.series_breakdown).length - 3} more</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-steel-dark/30 bg-card px-4 py-2 text-center">
          <span className="text-xs text-steel-dark">
            Upload your collection to generate your own card
          </span>
        </div>
      </div>
    </div>
  );
}
