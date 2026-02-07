import type { Watch } from '../types/collection';

export type WatchTier = 'standard' | 'rare' | 'premium';

export type WatchWithTier = Watch & { tier: WatchTier };

// Premium patterns: Full Metal, MR-G, MT-G, Frogman
const PREMIUM_PATTERNS = [
  /gmw-b5000/i,
  /mrg-/i,
  /mr-g/i,
  /mtg-/i,
  /mt-g/i,
  /gwf-/i,          // Frogman
  /frogman/i,
  /full\s*metal/i,
];

// Rare patterns: Specific collaboration names only
// Avoid generic patterns that cause false positives (e.g., GX-56BB as rare)
const RARE_PATTERNS = [
  /nasa/i,          // NASA collaboration
  /bape/i,          // BAPE collaboration
  /kith/i,          // KITH collaboration
  /bamford/i,       // Bamford collaboration
  /porter/i,        // Porter collaboration
  /stussy/i,        // Stussy collaboration
  /supreme/i,       // Supreme collaboration
  /one\s*piece/i,   // One Piece collaboration
  /dragon\s*ball/i, // Dragon Ball collaboration
  /transformers/i,  // Transformers collaboration
  /mastermind/i,    // Mastermind Japan
  /fragment/i,      // Fragment Design
  /john\s*mayer/i,  // John Mayer collaboration
  /hodinkee/i,      // Hodinkee collaboration
];

/**
 * Classify a watch into a tier based on model number, series, and features
 */
export function classifyTier(watch: Watch): WatchTier {
  const modelLower = watch.model_number.toLowerCase();
  const seriesLower = watch.series.toLowerCase();
  const featuresLower = watch.notable_features.join(' ').toLowerCase();
  const searchText = `${modelLower} ${seriesLower} ${featuresLower}`;

  // Check premium patterns first
  for (const pattern of PREMIUM_PATTERNS) {
    if (pattern.test(searchText)) {
      return 'premium';
    }
  }

  // Then check rare patterns
  for (const pattern of RARE_PATTERNS) {
    if (pattern.test(searchText)) {
      return 'rare';
    }
  }

  return 'standard';
}

/**
 * Add tier classification to an array of watches
 */
export function addTiersToWatches(watches: Watch[]): WatchWithTier[] {
  return watches.map(watch => ({
    ...watch,
    tier: classifyTier(watch),
  }));
}

/**
 * Count watches by tier
 */
export function countByTier(watches: WatchWithTier[]): Record<WatchTier, number> {
  return watches.reduce(
    (acc, watch) => {
      acc[watch.tier]++;
      return acc;
    },
    { standard: 0, rare: 0, premium: 0 }
  );
}

export type WatchShape = 'square' | 'round';

// Round patterns - models with round/octagon faces
const ROUND_PATTERNS = [
  /ga-2100/i,    // CasiOak (octagon)
  /gm-2100/i,    // CasiOak metal
  /gm-b2100/i,   // CasiOak metal Bluetooth
  /gst-/i,       // G-STEEL
  /mtg-/i,       // MT-G
  /mrg-/i,       // MR-G
  /awg-/i,       // Ana-Digi wave
  /gsw-/i,       // G-SQUAD
  /ga-/i,        // Ana-Digi (various round)
  /gba-/i,       // G-SQUAD analog
  /gbd-/i,       // G-SQUAD digital (some round)
  /gwf-/i,       // Frogman (round)
  /gw-9400/i,    // Rangeman (round)
];

/**
 * Classify watch shape for icon display
 * Most G-Shocks are square by default, only specific models are round
 */
export function classifyShape(model: string): WatchShape {
  const modelLower = model.toLowerCase();

  for (const pattern of ROUND_PATTERNS) {
    if (pattern.test(modelLower)) {
      return 'round';
    }
  }

  return 'square';
}
