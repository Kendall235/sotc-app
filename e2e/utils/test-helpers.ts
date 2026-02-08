import { Page, Route } from '@playwright/test';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mockAnalysis = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/mock-analysis.json'), 'utf-8')
);

/**
 * Mock the /api/analyze endpoint with test data
 */
export async function mockAnalyzeEndpoint(page: Page): Promise<void> {
  await page.route('**/api/analyze', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockAnalysis),
    });
  });
}

/**
 * Upload a test image to trigger analysis
 * Uses a simple 1x1 pixel PNG
 */
export async function uploadTestImage(page: Page): Promise<void> {
  // Create a minimal valid PNG (1x1 pixel, black)
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(pngBase64, 'base64');

  // The file input is hidden (class="hidden"), so we need to use force
  // or set input files on the hidden element directly
  const fileInput = page.locator('input[type="file"][accept="image/*"]');

  // Wait for the input to exist in DOM (even if hidden)
  await fileInput.waitFor({ state: 'attached', timeout: 5000 });

  // Set files directly - Playwright can do this on hidden inputs
  await fileInput.setInputFiles({
    name: 'test-collection.png',
    mimeType: 'image/png',
    buffer,
  });
}

/**
 * Wait for the collection card to be rendered
 */
export async function waitForCollectionCard(page: Page): Promise<void> {
  await page.waitForSelector('.collection-card', { timeout: 10000 });
}

/**
 * Get all chip elements from the card
 */
export async function getChipElements(page: Page) {
  return page.locator('.collection-card [class*="editable-chip"]').all();
}

/**
 * Get computed styles for an element
 */
export async function getComputedStyle(
  page: Page,
  selector: string,
  property: string
): Promise<string> {
  return page.evaluate(
    ({ sel, prop }) => {
      const el = document.querySelector(sel);
      if (!el) return '';
      return window.getComputedStyle(el).getPropertyValue(prop);
    },
    { sel: selector, prop: property }
  );
}

/**
 * Check if element overflows its container
 */
export async function isOverflowing(page: Page, selector: string): Promise<boolean> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
  }, selector);
}
