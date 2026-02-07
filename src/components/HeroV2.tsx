import { exampleCollection } from '../data/examples';

// Determine tier based on series/model
function getTier(watch: { model_number: string; series: string }): 'standard' | 'premium' | 'rare' {
  const premiumSeries = ['MR-G', 'MT-G', 'Full Metal'];
  const rareSeries = ['Frogman', 'Collaboration'];

  if (premiumSeries.some(s => watch.series.includes(s) || watch.model_number.includes('MRG') || watch.model_number.includes('MTG'))) {
    return 'premium';
  }
  if (rareSeries.some(s => watch.series.includes(s)) || watch.model_number.includes('Collab')) {
    return 'rare';
  }
  return 'standard';
}

function ModelChip({ model, tier }: { model: string; tier: 'standard' | 'premium' | 'rare' }) {
  const styles = {
    standard: 'bg-resin-surface text-primary',
    premium: 'bg-[rgba(196,52,46,0.15)] text-brick border-l-2 border-brick',
    rare: 'bg-[rgba(212,165,52,0.15)] text-gold border-l-2 border-gold',
  };

  return (
    <div className={`px-2 py-1.5 rounded text-center font-mono text-[9px] font-semibold truncate ${styles[tier]}`}>
      {model}
    </div>
  );
}

function StatCell({ value, label, accent }: { value: number; label: string; accent?: 'brick' | 'gold' }) {
  const color = accent === 'brick' ? 'text-brick' : accent === 'gold' ? 'text-gold' : 'text-primary';
  return (
    <div className="flex-1 text-center py-2 border-r border-[var(--color-border)] last:border-r-0">
      <div className={`font-display text-lg ${color}`}>{value}</div>
      <div className="font-mono text-[8px] text-muted uppercase">{label}</div>
    </div>
  );
}

function WatchSilhouette({ shape, delay }: {
  shape: 'square' | 'round' | 'octagon';
  delay: number;
}) {
  const shapeClasses = {
    square: 'w-7 h-8 rounded-[4px]',
    round: 'w-7 h-7 rounded-full',
    octagon: 'w-7 h-7 rounded-md',
  };

  return (
    <div
      className={`${shapeClasses[shape]} flex flex-col justify-center items-center gap-0.5`}
      style={{
        backgroundColor: 'var(--color-lcd)',
        opacity: 0.35,
        border: '1px solid rgba(196, 52, 46, 0.3)',
        animation: 'subtle-pulse 2.5s ease-in-out infinite',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* LCD segment lines */}
      <div className="w-3/4 h-[1.5px] rounded-full bg-[var(--color-lcd-segment)] opacity-60" />
      <div className="w-1/2 h-[1.5px] rounded-full bg-[var(--color-lcd-segment)] opacity-60" />
    </div>
  );
}

function HeroPhotoPlaceholder() {
  const watchPattern: Array<'square' | 'round' | 'octagon'> = [
    'square', 'octagon', 'square',
    'round', 'square', 'round',
  ];

  return (
    <div className="relative p-3 bg-[var(--color-bg-deep)]">
      {/* Corner L-brackets (matching PhotoFrame) */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-brick opacity-50" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-brick opacity-50" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-brick opacity-50" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-brick opacity-50" />

      {/* Watch silhouette grid */}
      <div className="grid grid-cols-3 gap-1.5 p-2 bg-black/20 rounded-sm border border-[var(--color-border)]">
        {watchPattern.map((shape, i) => (
          <div key={i} className="flex justify-center">
            <WatchSilhouette shape={shape} delay={i * 120} />
          </div>
        ))}
      </div>

      {/* Label */}
      <div className="text-center mt-1.5 font-mono text-[7px] text-muted tracking-widest uppercase">
        Your Collection
      </div>
    </div>
  );
}

function OutputPreview() {
  const watches = exampleCollection.watches.slice(0, 6);

  return (
    <div className="max-w-sm">
      <div className="font-mono text-[10px] text-muted tracking-widest uppercase mb-3">
        Sample Card
      </div>

      <div className="preview-card">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 bg-[var(--color-bg-surface)]">
          <span className="font-display text-sm uppercase tracking-wide text-primary">
            G-Shock Collection
          </span>
          <span className="font-display text-2xl text-brick">
            {exampleCollection.total_watches}
          </span>
        </div>

        {/* Hero Photo Placeholder */}
        <HeroPhotoPlaceholder />

        {/* Chip Grid - 3x2 */}
        <div className="grid grid-cols-3 gap-1.5 p-3 bg-[var(--color-bg-surface)]">
          {watches.map((watch, i) => (
            <ModelChip key={i} model={watch.model_number} tier={getTier(watch)} />
          ))}
        </div>

        {/* Stats Bar */}
        <div className="flex border-t border-[var(--color-border)]">
          <StatCell value={8} label="Pieces" accent="brick" />
          <StatCell value={5} label="Series" />
          <StatCell value={1} label="Collab" accent="gold" />
          <StatCell value={2} label="Premium" />
        </div>

        {/* Mini DNA Bar */}
        <div className="px-4 py-2 border-t border-[var(--color-border)]">
          <div className="flex h-4 rounded overflow-hidden">
            <div className="bg-brick flex-[38] flex items-center justify-center">
              <span className="text-[8px] text-white font-mono">SQUARE</span>
            </div>
            <div className="bg-[#5A564E] flex-[25] flex items-center justify-center">
              <span className="text-[8px] text-white font-mono">TOOL</span>
            </div>
            <div className="bg-[#4A4A5A] flex-[37] flex items-center justify-center">
              <span className="text-[8px] text-white font-mono">OTHER</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-lcd flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function Checklist() {
  return (
    <div className="space-y-2.5 text-sm text-secondary">
      <div className="flex items-center gap-2.5">
        <CheckIcon />
        <span>Every watch identified by model number</span>
      </div>
      <div className="flex items-center gap-2.5">
        <CheckIcon />
        <span>Collection stats: pieces, series, collaborations</span>
      </div>
      <div className="flex items-center gap-2.5">
        <CheckIcon />
        <span>Downloadable card to share anywhere</span>
      </div>
    </div>
  );
}

export function HeroV2() {
  return (
    <>
      {/* Hero Section */}
      <div className="grid-area-hero text-left">
        {/* Logo */}
        <div className="font-logo text-sm tracking-[0.4em] text-secondary mb-8 uppercase">
          SOTC.APP
        </div>

        {/* Headline - Restored */}
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight uppercase leading-[0.92] mb-6">
          <span className="text-secondary block">State of</span>
          <span className="text-brick block">the Collection</span>
        </h1>

        {/* Subheadline - No AI */}
        <p className="text-lg text-secondary max-w-md leading-relaxed">
          Your G-Shock collection, identified and documented.
          <br />
          One photo. One shareable card.
        </p>
      </div>

      {/* Preview Section */}
      <div className="grid-area-preview">
        <OutputPreview />
      </div>

      {/* Checklist Section */}
      <div className="grid-area-checklist">
        <Checklist />
      </div>
    </>
  );
}
