import type { Watch } from '../types/collection';

interface WatchTileProps {
  watch: Watch;
  index: number;
}

// Generate a pseudo-random time display based on model number
function generateLCDTime(modelNumber: string): string {
  const hash = modelNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hours = (hash % 12) + 1;
  const minutes = ((hash * 7) % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Determine face shape based on display type and series
function getFaceShape(watch: Watch): 'square-face' | 'round-face' | 'octagon-face' {
  const seriesLower = watch.series.toLowerCase();
  const modelLower = watch.model_number.toLowerCase();

  // Square faces for 5600/5000 series
  if (
    seriesLower.includes('square') ||
    seriesLower.includes('5600') ||
    seriesLower.includes('5000') ||
    modelLower.includes('dw-5') ||
    modelLower.includes('gw-5') ||
    modelLower.includes('gw-m5') ||
    modelLower.includes('gmw-b5')
  ) {
    return 'square-face';
  }

  // Octagon for CasiOak/2100 series
  if (
    seriesLower.includes('casioak') ||
    seriesLower.includes('2100') ||
    modelLower.includes('ga-2100') ||
    modelLower.includes('gm-2100') ||
    modelLower.includes('gm-b2100')
  ) {
    return 'octagon-face';
  }

  // Round for analog/premium/tool watches
  if (
    watch.display_type === 'Analog' ||
    seriesLower.includes('frogman') ||
    seriesLower.includes('mt-g') ||
    seriesLower.includes('mr-g') ||
    seriesLower.includes('rangeman') ||
    seriesLower.includes('mudmaster')
  ) {
    return 'round-face';
  }

  // Default based on display type
  return watch.display_type === 'Digital' ? 'square-face' : 'round-face';
}

// Check if watch is notable/rare
function isNotable(watch: Watch): boolean {
  const notableKeywords = ['limited', 'collab', 'anniversary', 'special', 'mr-g', 'frogman', 'gmw-b5000'];
  const modelLower = watch.model_number.toLowerCase();
  const seriesLower = watch.series.toLowerCase();
  const featuresLower = watch.notable_features.join(' ').toLowerCase();

  return notableKeywords.some(
    keyword =>
      modelLower.includes(keyword) ||
      seriesLower.includes(keyword) ||
      featuresLower.includes(keyword)
  );
}

export function WatchTile({ watch }: WatchTileProps) {
  const faceShape = getFaceShape(watch);
  const lcdTime = generateLCDTime(watch.model_number);
  const notable = isNotable(watch);

  return (
    <div className="group relative rounded-xl bg-resin-mid p-3 transition-all duration-200 hover:bg-resin-light hover:scale-[1.03] hover:z-10 border border-transparent hover:border-[var(--color-brick-border)] cursor-pointer">
      {/* Notable badge - gold star */}
      {notable && <span className="rare-badge">★</span>}

      {/* LCD-style watch face */}
      <div className="flex justify-center mb-1.5">
        <div className={`lcd-face ${faceShape}`}>
          <span className="lcd-face-text text-[9px]">{lcdTime}</span>
        </div>
      </div>

      {/* Model number */}
      <div className="font-mono text-[10px] font-semibold text-primary text-center leading-tight tracking-wide">
        {watch.model_number}
      </div>

      {/* Series tag */}
      <div className="font-body text-[9px] text-secondary text-center uppercase tracking-wider mt-0.5">
        {watch.series}
      </div>

      {/* Position hint on hover */}
      <div className="absolute bottom-1.5 left-2 right-2 hidden text-[8px] text-muted group-hover:block text-center truncate">
        {watch.position}
      </div>
    </div>
  );
}
