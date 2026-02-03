export function ProcessingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Scanning animation container */}
      <div className="relative mb-8">
        {/* Outer ring */}
        <div className="h-24 w-24 rounded-full border-2 border-steel-dark" />

        {/* Scanning line */}
        <div className="absolute inset-0 overflow-hidden rounded-full">
          <div className="animate-scan h-full w-full bg-gradient-to-b from-transparent via-accent-orange/50 to-transparent" />
        </div>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-10 w-10 text-accent-orange animate-subtle-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
      </div>

      {/* Progress text */}
      <div className="text-center">
        <p className="font-display text-xl text-white">
          Analyzing your collection...
        </p>
        <p className="mt-2 text-sm text-steel">
          Identifying G-Shock models and series
        </p>
      </div>

      {/* Progress bar */}
      <div className="mt-6 h-1 w-64 overflow-hidden rounded-full bg-secondary">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-accent-orange" />
      </div>
    </div>
  );
}
