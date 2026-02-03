export function ProcessingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Scanning animation container */}
      <div className="relative mb-8 w-full max-w-md">
        {/* Fake image placeholder area */}
        <div className="aspect-[4/3] bg-resin-dark rounded-2xl border border-[var(--color-border)] relative overflow-hidden">
          {/* Fake watch grid shapes */}
          <div className="grid grid-cols-4 gap-4 p-9 w-full opacity-25">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square border-2 border-tertiary bg-resin-mid ${
                  i % 2 === 0 ? 'rounded-lg' : 'rounded-full'
                }`}
              />
            ))}
          </div>

          {/* Brick red scan line */}
          <div className="scan-line" />
        </div>
      </div>

      {/* Status section */}
      <div className="text-center">
        <p className="font-mono text-sm text-brick mb-3.5 tracking-wide">
          Identifying your collection<span className="animate-blink">_</span>
        </p>

        {/* Progress bar */}
        <div className="h-[3px] w-64 bg-resin-mid rounded overflow-hidden mx-auto">
          <div className="h-full bg-brick animate-progress-sweep rounded" />
        </div>

        {/* Scanning counts */}
        <div className="mt-4 flex justify-center gap-5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-dot-beat" />
            <span className="font-mono text-xs text-secondary">Scanning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-brick animate-dot-beat" style={{ animationDelay: '0.3s' }} />
            <span className="font-mono text-xs text-secondary">Analyzing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
