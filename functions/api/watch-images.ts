// Curated database of G-Shock watch images
// NOTE: Add verified working image URLs here as they are confirmed
// For now, returns null to show placeholder gracefully

export const WATCH_IMAGES: Record<string, string> = {
  // Add verified URLs here as they are confirmed working
  // Example format:
  // 'DW-5600E-1V': 'https://verified-working-url.com/image.jpg',
};

// Normalize model number for matching (removes common suffix variations)
function normalizeModel(model: string): string {
  return model
    .toUpperCase()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/[-_]/g, '-'); // Normalize separators
}

// Extract base model (e.g., "GA-2100" from "GA-2100-1A1")
function getBaseModel(model: string): string {
  const normalized = normalizeModel(model);
  // Match pattern like GA-2100, DW-5600, GW-M5610, etc.
  const match = normalized.match(/^([A-Z]{2,4}-?[A-Z]?\d{3,5})/);
  return match ? match[1] : normalized;
}

/**
 * Look up a watch image URL by model number.
 * Tries exact match first, then falls back to fuzzy matching.
 *
 * @param modelNumber - The G-Shock model number to look up
 * @returns The image URL if found, or null if not in database
 */
export function getWatchImage(modelNumber: string): string | null {
  const normalized = normalizeModel(modelNumber);

  // Try exact match first
  if (WATCH_IMAGES[normalized]) {
    return WATCH_IMAGES[normalized];
  }

  // Try exact match with original casing (in case already correct)
  if (WATCH_IMAGES[modelNumber]) {
    return WATCH_IMAGES[modelNumber];
  }

  // Try matching against normalized keys
  for (const [key, url] of Object.entries(WATCH_IMAGES)) {
    if (normalizeModel(key) === normalized) {
      return url;
    }
  }

  // Try base model matching (for color variants)
  const baseModel = getBaseModel(modelNumber);
  for (const [key, url] of Object.entries(WATCH_IMAGES)) {
    if (getBaseModel(key) === baseModel) {
      return url;
    }
  }

  return null;
}

/**
 * Inject image URLs into an array of watch objects.
 * Modifies watches in place, adding image_url from the database.
 *
 * @param watches - Array of watch objects with model_number property
 */
export function injectWatchImages<T extends { model_number: string; image_url?: string | null }>(
  watches: T[]
): void {
  for (const watch of watches) {
    const imageUrl = getWatchImage(watch.model_number);
    if (imageUrl) {
      watch.image_url = imageUrl;
    } else if (watch.image_url === undefined) {
      watch.image_url = null;
    }
  }
}
