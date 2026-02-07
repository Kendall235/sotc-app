import type { Watch } from '../types/collection';

export type ArchetypeColor = 'brick' | 'warm-brown' | 'olive' | 'blue-gray';

export interface Archetype {
  name: string;
  percentage: number;
  color: ArchetypeColor;
}

// Map series to collector archetypes
const ARCHETYPE_MAPPING: Record<string, string[]> = {
  'Square Purist': [
    'Square', '5600', '5000', 'DW-5000', 'DW-5600', 'GW-5000', 'GW-M5610',
    'GMW-B5000', 'Full Metal', 'DW-5035', 'DW-5025'
  ],
  'Tool Watch': [
    'Frogman', 'Rangeman', 'Mudmaster', 'Gravitymaster', 'Gulfmaster',
    'Master of G', 'GWF', 'GW-9400', 'GG-', 'GPR-', 'GWG-'
  ],
  'CasiOak Fan': [
    'CasiOak', '2100', 'GA-2100', 'GM-2100', 'GM-B2100', 'GA-B2100',
    'GMA-S2100', 'GAE-2100'
  ],
  'Premium': [
    'MT-G', 'MR-G', 'MTG-', 'MRG-', 'MTG-B', 'MRG-B'
  ],
  'Ana-Digi': [
    'GA-110', 'GA-700', 'GA-900', 'GA-100', 'GA-400', 'GD-', 'GA-'
  ],
  'Classic Digital': [
    '6900', 'DW-6900', 'GD-350', 'GD-X6900', 'GDX-6900'
  ],
  'Limited Edition': [
    'Collaboration', 'Limited', 'Anniversary', 'Special', 'Collab',
    'NASA', 'BAPE', 'KITH', 'Bamford', 'One Piece', 'Dragon Ball'
  ],
};

// Get the archetype for a single watch based on its series/model
function getWatchArchetype(watch: Watch): string | null {
  const seriesLower = watch.series.toLowerCase();
  const modelLower = watch.model_number.toLowerCase();

  for (const [archetype, keywords] of Object.entries(ARCHETYPE_MAPPING)) {
    for (const keyword of keywords) {
      if (
        seriesLower.includes(keyword.toLowerCase()) ||
        modelLower.includes(keyword.toLowerCase())
      ) {
        return archetype;
      }
    }
  }

  // Default archetype for unmatched watches
  return 'Collector';
}

export function deriveCollectorDNA(watches: Watch[]): Archetype[] {
  if (watches.length === 0) {
    return [];
  }

  // Count watches per archetype
  const archetypeCounts: Record<string, number> = {};

  for (const watch of watches) {
    const archetype = getWatchArchetype(watch);
    if (archetype) {
      archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;
    }
  }

  // Sort by count descending
  const sortedArchetypes = Object.entries(archetypeCounts)
    .sort(([, a], [, b]) => b - a);

  // Calculate total for percentages
  const total = watches.length;

  // Assign colors based on archetype category (semantic)
  const categoryColors: Record<string, ArchetypeColor> = {
    'Square Purist': 'brick',      // Red - iconic G-Shock
    'Limited Edition': 'warm-brown', // Gold - collabs/rare
    'Tool Watch': 'olive',          // Military green
    'CasiOak Fan': 'blue-gray',     // Modern slate
    'Premium': 'warm-brown',        // Gold - premium
    'Ana-Digi': 'olive',            // Green-gray
    'Classic Digital': 'blue-gray', // Classic slate
    'Collector': 'olive',           // Default
  };

  // Return top 4 archetypes with percentages
  return sortedArchetypes.slice(0, 4).map(([name, count]) => ({
    name: shortenArchetypeName(name),
    percentage: Math.round((count / total) * 100),
    color: categoryColors[name] || 'olive',
  }));
}

// Shorten archetype names for display in DNA bar
function shortenArchetypeName(name: string): string {
  const shortNames: Record<string, string> = {
    'Square Purist': 'SQUARE',
    'Tool Watch': 'TOOL',
    'CasiOak Fan': 'CASIOAK',
    'Premium': 'PREMIUM',
    'Ana-Digi': 'ANA-DIGI',
    'Classic Digital': 'CLASSIC',
    'Limited Edition': 'LIMITED',
    'Collector': 'OTHER',
  };

  return shortNames[name] || name.toUpperCase();
}

// Calculate flex values for DNA bar segments based on percentages
export function getDNAFlexValues(archetypes: Archetype[]): number[] {
  if (archetypes.length === 0) return [];

  // Ensure minimum visibility for small segments
  return archetypes.map((a) => Math.max(a.percentage / 10, 1));
}
