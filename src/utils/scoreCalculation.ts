import type { CollectionAnalysis } from '../types/collection';
import { addTiersToWatches, countByTier } from './watchTiers';

/**
 * Calculate a collection score from 0-100 based on various factors
 *
 * Scoring breakdown:
 * - Piece count: 0-25 points (diminishing returns past 15)
 * - Series diversity: 0-25 points
 * - Rarity ratio: 0-25 points
 * - Feature coverage: 0-15 points
 * - Premium presence: 0-10 points
 */
export function calculateScore(analysis: CollectionAnalysis): number {
  const watchesWithTiers = addTiersToWatches(analysis.watches);
  const tierCounts = countByTier(watchesWithTiers);
  const totalWatches = analysis.total_watches;

  if (totalWatches === 0) return 0;

  // 1. Piece count score (0-25 points)
  // Diminishing returns: first 15 watches give more points
  const pieceScore = Math.min(25, Math.floor(
    totalWatches <= 15
      ? (totalWatches / 15) * 25
      : 25 + Math.log(totalWatches - 14) * 0 // Cap at 25
  ));

  // 2. Series diversity score (0-25 points)
  // More unique series = higher score
  const seriesCount = Object.keys(analysis.series_breakdown).length;
  const diversityRatio = seriesCount / Math.max(totalWatches, 1);
  const diversityScore = Math.min(25, Math.floor(
    // Reward having many series, but also reward depth
    (seriesCount * 3) + (diversityRatio * 10)
  ));

  // 3. Rarity ratio score (0-25 points)
  // Percentage of rare + premium watches
  const rareCount = tierCounts.rare + tierCounts.premium;
  const rarityRatio = rareCount / totalWatches;
  const rarityScore = Math.min(25, Math.floor(rarityRatio * 50));

  // 4. Feature coverage score (0-15 points)
  // Unique features across the collection
  const allFeatures = new Set<string>();
  for (const watch of analysis.watches) {
    for (const feature of watch.notable_features) {
      allFeatures.add(feature.toLowerCase());
    }
  }
  const featureScore = Math.min(15, Math.floor(allFeatures.size * 1.5));

  // 5. Premium presence score (0-10 points)
  // Bonus for having premium pieces
  const premiumScore = Math.min(10, tierCounts.premium * 3);

  const totalScore = pieceScore + diversityScore + rarityScore + featureScore + premiumScore;

  return Math.min(100, Math.max(0, totalScore));
}
