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

// Rare patterns: Limited editions, collaborations, special editions
const RARE_PATTERNS = [
  /nasa/i,
  /bape/i,
  /kith/i,
  /bamford/i,
  /limited/i,
  /collab/i,
  /anniversary/i,
  /special/i,
  /x\s+\w+/i,       // Collaborations like "x BAPE"
  /35th/i,
  /40th/i,
  /one\s*piece/i,
  /dragon\s*ball/i,
  /transformers/i,
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
