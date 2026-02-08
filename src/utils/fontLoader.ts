/**
 * Explicitly preload fonts used in the collection card export.
 * Uses the Font Loading API to ensure fonts are available for canvas rendering.
 */
const EXPORT_FONTS = [
  { family: 'Oswald', weight: '500' },
  { family: 'Oswald', weight: '600' },
  { family: 'Roboto Mono', weight: '400' },
  { family: 'Roboto Mono', weight: '600' },
  { family: 'Anton', weight: '400' },
  { family: 'Chakra Petch', weight: '400' },
  { family: 'Chakra Petch', weight: '600' },
  { family: 'Fira Code', weight: '400' },
  { family: 'Plus Jakarta Sans', weight: '400' },
  { family: 'Plus Jakarta Sans', weight: '600' },
];

export async function ensureFontsLoaded(): Promise<boolean> {
  await document.fonts.ready;

  // Explicitly load each font variant with test text that includes
  // characters commonly used in watch model numbers
  const testText = 'DW-5600E-1 SOTC 0123456789 GW-M5610U';

  const promises = EXPORT_FONTS.map(({ family, weight }) =>
    document.fonts.load(`${weight} 16px "${family}"`, testText)
  );

  await Promise.all(promises);

  // Verify fonts are actually loaded
  return EXPORT_FONTS.every(({ family }) =>
    document.fonts.check(`16px "${family}"`)
  );
}
