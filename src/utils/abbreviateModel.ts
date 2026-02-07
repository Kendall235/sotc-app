/**
 * Smart abbreviation for G-Shock model numbers.
 *
 * G-Shock model numbers follow this pattern:
 * [PREFIX]-[BASE][VARIANT]-[COLOR]
 *
 * Examples:
 *   GMW-B5000D-1     → GMW-B5000D (remove color)
 *   GA-2100-1A1      → GA-2100 (remove color)
 *   DW-5600NASA21-1A → DW-5600NASA21 (remove color)
 *   GW-M5610U-1      → GW-M5610U (remove color)
 *
 * Color suffixes are the least informative part of the model number
 * and can be safely removed to fit narrow chip widths.
 */

/**
 * Abbreviate a G-Shock model number to fit available space.
 * Removes color/variant suffixes while preserving core identity.
 *
 * @param model - Full model number (e.g., "GMW-B5000D-1")
 * @param maxChars - Maximum characters allowed
 * @returns Abbreviated model number that fits within maxChars
 */
export function abbreviateModel(model: string, maxChars: number): string {
  if (model.length <= maxChars) return model;

  // Pattern: Try removing the final -X, -XA, or -XAX color suffix
  // Matches: -1, -1A, -1A1, -9JF, -1DR, etc.
  const colorSuffixPattern = /-\d[A-Z0-9]{0,3}$/;
  let abbreviated = model.replace(colorSuffixPattern, '');

  if (abbreviated.length <= maxChars) return abbreviated;

  // Still too long - remove series prefix for collab models
  // e.g., "DW-5600NASA21" → "5600NASA21"
  const prefixPattern = /^[A-Z]{2,4}-/;
  abbreviated = abbreviated.replace(prefixPattern, '');

  if (abbreviated.length <= maxChars) return abbreviated;

  // Last resort: truncate with ellipsis
  return abbreviated.slice(0, maxChars - 1) + '…';
}

/**
 * Calculate max characters based on grid columns.
 * More columns = narrower chips = fewer characters allowed.
 *
 * At 11px Roboto Mono, each char ≈ 6.6px.
 * Chip padding takes ~26px (10px each side + 6px border area).
 *
 * @param cols - Number of grid columns
 * @returns Maximum characters that fit comfortably
 */
export function getMaxCharsForGrid(cols: number): number {
  // These values are tuned for mobile viewport (~375px)
  // Grid gap is 8px, so available width per column decreases with more cols
  if (cols >= 4) return 10;
  if (cols >= 3) return 14;
  return 18; // 2 columns or fewer
}
