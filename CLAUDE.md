# SOTC.app - G-Shock Collection Identifier

## Overview
SOTC.app ("State of the Collection") is a web application that uses Claude Vision AI to identify G-Shock watches from uploaded collection photos and generates shareable collection cards.

**Live URL:** https://sotc-app.pages.dev
**Staging URL:** https://staging.sotc-app.pages.dev

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4 |
| AI | Claude Vision API (claude-sonnet-4) |
| Hosting | Cloudflare Pages |
| Functions | Cloudflare Pages Functions |
| Image Export | html2canvas |
| Validation | Zod |

---

## Project Structure

```
sotc-app/
├── functions/api/          # Cloudflare Pages Functions (serverless)
│   ├── analyze.ts          # Main AI analysis endpoint
│   ├── image-proxy.ts      # Proxy for external watch images
│   └── watch-images.ts     # Curated watch image database
├── src/
│   ├── components/         # React components
│   │   ├── Hero.tsx        # Logo, headline, tagline
│   │   ├── UploadZone.tsx  # Drag-drop upload with corner accents
│   │   ├── ProcessingState.tsx  # Scan animation during analysis
│   │   ├── CollectionCard.tsx   # Shareable result card
│   │   ├── StatsBar.tsx    # Stats grid + series breakdown bars
│   │   ├── WatchTile.tsx   # Individual watch with LCD face
│   │   ├── WatchGrid.tsx   # Responsive watch grid
│   │   ├── ExampleCards.tsx # Sample output preview
│   │   ├── ErrorState.tsx  # Error handling UI
│   │   ├── DownloadButton.tsx # PNG export button
│   │   ├── Layout.tsx      # Page wrapper with glow effects
│   │   └── Footer.tsx      # Footer
│   ├── services/
│   │   └── api.ts          # API client for /api/analyze
│   ├── utils/
│   │   ├── imageProcessing.ts  # Resize/compress before upload
│   │   └── collectorDNA.ts     # Derive collector archetypes
│   ├── types/
│   │   └── collection.ts   # TypeScript types + Zod schemas
│   ├── data/
│   │   └── examples.ts     # Example collection data
│   ├── App.tsx             # Main app with state machine
│   ├── main.tsx            # React entry point
│   └── index.css           # Theme tokens, utilities, animations
├── index.html
├── wrangler.toml           # Cloudflare Pages config
├── package.json
└── tsconfig.json
```

---

## Design System: DW-5000C Heritage Palette

Inspired by the original 1983 G-Shock. All colors derived from the watch itself.

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-resin-deep` | #0B0B0D | Primary background |
| `--color-resin-dark` | #111114 | Secondary background |
| `--color-resin-mid` | #1A1A1E | Card background |
| `--color-resin-light` | #222228 | Elevated surfaces |
| `--color-resin-surface` | #2A2A32 | Surface elements |
| `--color-brick` | #C4342E | Primary accent (bezel red) |
| `--color-gold` | #D4A534 | Secondary accent (shield gold) |
| `--color-lcd` | #B8C4A0 | LCD display green |
| `--color-lcd-segment` | #3A3E32 | LCD text color |

### Typography

| Font | Usage |
|------|-------|
| Anton | Display headlines (`.font-display`) |
| Chakra Petch | Logo, LCD face text (`.font-logo`) |
| Fira Code | Monospace, stats, tags (`.font-mono`) |
| Plus Jakarta Sans | Body text (`.font-body`) |

### Key UI Elements

- **Corner accents:** Brick red L-shapes on upload box (4 corners)
- **LCD faces:** Watch tiles show time display with shape variants:
  - `square-face`: 5600/5000 series
  - `octagon-face`: CasiOak/2100 series
  - `round-face`: Analog, Frogman, MT-G
- **Bezel accent:** Top gradient line on cards
- **DNA bar:** Collector archetype visualization
- **Series bars:** Horizontal progress bars for series breakdown

---

## Commands

```bash
# Development
npm run dev              # Start Vite dev server (hot reload)
npm run build            # TypeScript check + production build
npm run preview          # Preview production build locally

# Cloudflare Pages
npm run pages:dev        # Local dev with Wrangler (includes functions)
npm run pages:deploy     # Build and deploy to production

# Deploy to staging
npx wrangler pages deploy dist --branch=staging

# Lint
npm run lint
```

---

## Environment Variables

Set in Cloudflare Pages dashboard (Settings > Environment variables):

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Claude API key for vision analysis |

---

## API Endpoints

### POST /api/analyze
Analyzes uploaded collection image using Claude Vision.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_watches": 8,
    "watches": [
      {
        "model_number": "GW-5000U-1",
        "series": "Square/5600",
        "display_type": "Digital",
        "colorway": "Black",
        "notable_features": ["Solar", "MB6"],
        "confidence": "high",
        "position": "top left",
        "image_url": "https://..."
      }
    ],
    "series_breakdown": { "Square/5600": 3, "CasiOak/2100": 2 },
    "collection_highlights": ["Notable observation..."]
  }
}
```

**Rate limit:** 5 requests/hour per IP

---

## Collector DNA System

The `collectorDNA.ts` utility analyzes watch data to derive collector archetypes:

| Archetype | Matching Series/Models |
|-----------|----------------------|
| Square Purist | 5600, 5000, GMW-B5000, Full Metal |
| Tool Watch | Frogman, Rangeman, Mudmaster, Master of G |
| CasiOak Fan | GA-2100, GM-2100, GM-B2100 |
| Premium | MT-G, MR-G |
| Ana-Digi | GA-110, GA-700, GA-900 |
| Classic Digital | 6900, DW-6900 |

DNA bar displays top 4 archetypes with proportional segments.

---

## App States

```
idle → uploading → processing → result
                 ↘ error
```

- **idle:** Upload zone + example cards visible
- **uploading:** Preview shown, preparing image
- **processing:** Scan animation overlay, calling API
- **result:** Collection card with download option
- **error:** Error message with retry/reset options

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `src/index.css` | All theme tokens, colors, fonts, animations, utility classes |
| `src/utils/collectorDNA.ts` | Archetype derivation logic |
| `functions/api/analyze.ts` | Claude Vision integration |
| `src/components/CollectionCard.tsx` | Main shareable output |
| `src/components/WatchTile.tsx` | LCD face rendering logic |

---

## Deployment

**Production:** Merges to `main` or manual deploy via `npm run pages:deploy`
**Staging:** `npx wrangler pages deploy dist --branch=staging`

Cloudflare Pages auto-builds on git push if connected to repo.

---

## Common Tasks

### Add a new color token
1. Add to `@theme` block in `src/index.css`
2. Add utility class if needed (e.g., `.text-newcolor`, `.bg-newcolor`)

### Add a new collector archetype
1. Edit `ARCHETYPE_MAPPING` in `src/utils/collectorDNA.ts`
2. Add keywords that match series/model numbers

### Modify LCD face shapes
Edit `getFaceShape()` in `src/components/WatchTile.tsx`

### Update analysis prompt
Edit `ANALYSIS_PROMPT` in `functions/api/analyze.ts`
