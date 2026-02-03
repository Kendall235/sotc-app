export function Hero() {
  return (
    <header className="mb-12 text-center">
      {/* Logo */}
      <div className="mb-5 inline-flex items-center gap-0">
        <span className="font-logo text-lg font-bold tracking-[0.5em] text-brick uppercase">
          SOTC
        </span>
        <span className="font-logo text-lg font-bold text-muted mx-0.5">.</span>
        <span className="font-logo text-lg font-bold tracking-[0.5em] text-muted uppercase">
          APP
        </span>
      </div>

      {/* Shield icon - nod to SHOCK RESIST */}
      <div className="mx-auto mb-6 h-9 w-9">
        <svg viewBox="0 0 36 36" fill="none" className="h-full w-full">
          <path
            d="M18 3L4 10v8c0 9 6 14 14 17 8-3 14-8 14-17v-8L18 3z"
            stroke="var(--color-gold)"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M18 10L10 14v5c0 5 3.5 8 8 10 4.5-2 8-5 8-10v-5L18 10z"
            stroke="var(--color-brick)"
            strokeWidth="1"
            fill="none"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Main headline */}
      <h1 className="font-display text-5xl font-normal tracking-tight uppercase sm:text-6xl lg:text-7xl leading-[0.92]">
        <span className="text-secondary block">State of</span>
        <span className="text-brick block">the Collection</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-5 text-base text-secondary max-w-md mx-auto leading-relaxed">
        Drop your G-Shock collection photo. AI identifies every piece.
        <br />
        Get a shareable SOTC card in seconds.
      </p>
    </header>
  );
}
