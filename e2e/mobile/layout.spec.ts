import { test, expect } from '@playwright/test';
import { mockAnalyzeEndpoint, uploadTestImage, waitForCollectionCard } from '../utils/test-helpers';

test.describe('Mobile Layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnalyzeEndpoint(page);
    await page.goto('/');
  });

  test('chips do not overflow container on 375px viewport', async ({ page }) => {
    // Set viewport to iPhone SE width
    await page.setViewportSize({ width: 375, height: 667 });

    await uploadTestImage(page);
    await waitForCollectionCard(page);

    // Get the collection card
    const card = page.locator('.collection-card');
    await expect(card).toBeVisible();

    // Get card bounding box
    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();

    // Find all chip text elements
    const chipTexts = page.locator('.editable-chip-text');
    const count = await chipTexts.count();

    for (let i = 0; i < count; i++) {
      const chip = chipTexts.nth(i);
      const chipBox = await chip.boundingBox();

      if (chipBox && cardBox) {
        // Chip should be within card boundaries
        expect(chipBox.x).toBeGreaterThanOrEqual(cardBox.x - 1); // Allow 1px tolerance
        expect(chipBox.x + chipBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1);
      }
    }
  });

  test('chip font size is at least 7px', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await uploadTestImage(page);
    await waitForCollectionCard(page);

    // Get font sizes of all chip texts
    const chipTexts = page.locator('.editable-chip-text');
    const count = await chipTexts.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const chip = chipTexts.nth(i);
      const fontSize = await chip.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).fontSize);
      });

      expect(fontSize).toBeGreaterThanOrEqual(7);
    }
  });

  test('DNA bar segments fit within card width', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await uploadTestImage(page);
    await waitForCollectionCard(page);

    // Get the collection card width
    const card = page.locator('.collection-card');
    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();

    // Check if DNA bar exists (may not always be present)
    const dnaBar = page.locator('.collection-card').locator('div').filter({ hasText: 'Collector DNA' }).first();
    const dnaBarVisible = await dnaBar.isVisible().catch(() => false);

    if (dnaBarVisible && cardBox) {
      // Get the DNA bar container (the flex container with segments)
      const segments = page.locator('.collection-card div[style*="display: flex"]').last();
      const segmentsBox = await segments.boundingBox().catch(() => null);

      if (segmentsBox) {
        // Total segments width should not exceed card width
        expect(segmentsBox.width).toBeLessThanOrEqual(cardBox.width);
      }
    }
  });

  test('edit input fits on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await uploadTestImage(page);
    await waitForCollectionCard(page);

    // Get the card container
    const card = page.locator('.collection-card');
    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();

    // Click on a chip to enter edit mode
    const chipText = page.locator('.editable-chip-text').first();
    await chipText.click();

    // Wait for input to appear
    await page.waitForTimeout(100);

    // Find the input element
    const input = page.locator('.collection-card input[type="text"]');
    const inputVisible = await input.isVisible().catch(() => false);

    if (inputVisible && cardBox) {
      const inputBox = await input.boundingBox();
      if (inputBox) {
        // Input should not overflow the card
        expect(inputBox.x + inputBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 10);
      }
    }
  });

  test('card respects max-width on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await uploadTestImage(page);
    await waitForCollectionCard(page);

    const card = page.locator('.collection-card');
    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();

    if (cardBox) {
      // Card should not exceed viewport width
      expect(cardBox.width).toBeLessThanOrEqual(375);
    }
  });

  test('grid layout adapts to narrow viewport', async ({ page }) => {
    // Set very narrow viewport
    await page.setViewportSize({ width: 320, height: 568 });

    await uploadTestImage(page);
    await waitForCollectionCard(page);

    const card = page.locator('.collection-card');
    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();

    // Verify card is constrained to viewport
    if (cardBox) {
      expect(cardBox.width).toBeLessThanOrEqual(320);
    }

    // Chips should still be visible
    const chipTexts = page.locator('.editable-chip-text');
    const count = await chipTexts.count();
    expect(count).toBeGreaterThan(0);
  });
});
