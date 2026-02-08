import { injectWatchImages } from './watch-images';
import { generateCardId } from '../utils/generateId';

interface Env {
  ANTHROPIC_API_KEY: string;
  CARDS: KVNamespace;
}

interface SavedCard {
  id: string;
  created: string;
  analysis: unknown;
  photoBase64: string;
}

// Simple in-memory rate limiting (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

const ANALYSIS_PROMPT = `You are a G-Shock watch identification expert. Analyze this collection photo.

STEP 1 - COUNT ROWS CAREFULLY:
Look at the photo and determine how watches are physically arranged.

CRITICAL ROW RULES:
- A ROW is a horizontal line of watches whose CENTERS are at roughly the same vertical level
- Watches do NOT need to be perfectly aligned - slight vertical offsets (due to different watch sizes, angles, or positioning) still count as the SAME ROW
- If watches overlap vertically in their positions, they are likely in the SAME ROW
- Most collection photos have 1-3 rows. Be conservative - fewer rows is usually correct.
- Ask yourself: "If I drew a horizontal line through this row, would it pass through all these watches?"

STEP 2 - COUNT WATCHES PER ROW:
For each row, count watches from LEFT to RIGHT.

OUTPUT FORMAT:

"row_counts": Array of watch counts per row, top to bottom.
  - 8 watches in 2 rows of 4 = [4, 4]
  - 6 watches in 2 rows of 3 = [3, 3]
  - 9 watches in 3 rows of 3 = [3, 3, 3]

"watches": List ALL watches in reading order (left-to-right, top-to-bottom):
- model_number: Specific model
- series: Product line
- display_type: "Digital", "Analog", or "Ana-Digi"
- colorway: Brief description
- notable_features: Array of features
- confidence: "high", "medium", or "low"

Also include:
- total_watches: Integer (must equal sum of row_counts)
- collection_highlights: 2-3 observations
- series_breakdown: Object with series counts

Return ONLY valid JSON.`;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Get client IP for rate limiting
  const ip = request.headers.get('cf-connecting-ip') ||
             request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             'unknown';

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Rate limit exceeded. Please wait before trying again.',
      type: 'rate_limit',
    }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json() as { image?: string };
    const { image } = body;

    if (!image || typeof image !== 'string') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Image data is required',
        type: 'file_error',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extract base64 data and media type
    const match = image.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!match) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid image format',
        type: 'file_error',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const mediaType = match[1];
    const base64Data = match[2];

    // Call Claude Vision API directly
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: ANALYSIS_PROMPT,
              },
            ],
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error('Anthropic API error:', errorText);
      return new Response(JSON.stringify({
        success: false,
        error: 'AI service error. Please try again.',
        type: 'api_error',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await anthropicResponse.json() as {
      content: Array<{ type: string; text?: string }>;
    };

    // Extract text content
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || !textContent.text) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No analysis returned from AI',
        type: 'parse_error',
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse JSON from response
    let analysisData;
    try {
      // Try to extract JSON from the response (Claude sometimes adds markdown code blocks)
      let jsonString = textContent.text;
      const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1];
      }
      analysisData = JSON.parse(jsonString.trim());
    } catch {
      // Retry once if parsing fails
      const retryResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: mediaType,
                    data: base64Data,
                  },
                },
                {
                  type: 'text',
                  text: ANALYSIS_PROMPT + '\n\nIMPORTANT: Return ONLY raw JSON without any markdown formatting or code blocks.',
                },
              ],
            },
          ],
        }),
      });

      if (!retryResponse.ok) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Analysis failed. Please try again.',
          type: 'parse_error',
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const retryData = await retryResponse.json() as {
        content: Array<{ type: string; text?: string }>;
      };
      const retryTextContent = retryData.content.find((c) => c.type === 'text');

      if (!retryTextContent || !retryTextContent.text) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Analysis failed. Please try again.',
          type: 'parse_error',
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      try {
        analysisData = JSON.parse(retryTextContent.text.trim());
      } catch {
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to parse analysis results. Please try again.',
          type: 'parse_error',
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Debug: log raw AI response structure
    console.log('[analyze] row_counts from AI:', analysisData.row_counts);
    console.log('[analyze] watches count:', analysisData.watches?.length);
    console.log('[analyze] first watch position:', analysisData.watches?.[0]?.position);

    // Calculate positions from row_counts if provided
    let positioningMethod = 'none';
    if (analysisData.row_counts && Array.isArray(analysisData.row_counts) && analysisData.watches) {
      const rowCounts: number[] = analysisData.row_counts;
      let watchIndex = 0;

      for (let rowNum = 0; rowNum < rowCounts.length; rowNum++) {
        const watchesInRow = rowCounts[rowNum];
        for (let posInRow = 0; posInRow < watchesInRow; posInRow++) {
          if (watchIndex < analysisData.watches.length) {
            analysisData.watches[watchIndex].position = `row-${rowNum + 1}-pos-${posInRow + 1}`;
            watchIndex++;
          }
        }
      }

      // Set grid dimensions from row_counts
      analysisData.grid_rows = rowCounts.length;
      analysisData.grid_cols = Math.max(...rowCounts);
      positioningMethod = 'row_counts';
      console.log('[analyze] Positions calculated from row_counts:', rowCounts);
    } else if (analysisData.watches?.[0]?.position) {
      positioningMethod = 'ai_positions';
      console.log('[analyze] Using AI-provided positions');
    }

    // Add debug info to response
    analysisData._debug = {
      row_counts: analysisData.row_counts || null,
      positioning_method: positioningMethod,
      grid_rows: analysisData.grid_rows,
      grid_cols: analysisData.grid_cols,
    };

    // Inject watch images from curated database
    if (analysisData.watches && Array.isArray(analysisData.watches)) {
      injectWatchImages(analysisData.watches);
    }

    // Generate unique card ID with collision check
    let cardId: string = '';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      cardId = generateCardId();
      const existing = await env.CARDS.get(cardId);
      if (!existing) break;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.error('Failed to generate unique card ID after', maxAttempts, 'attempts');
      // Still return the analysis, just without persistence
      return new Response(JSON.stringify({
        success: true,
        data: analysisData,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Save card to KV
    const savedCard: SavedCard = {
      id: cardId,
      created: new Date().toISOString(),
      analysis: analysisData,
      photoBase64: image,
    };

    await env.CARDS.put(cardId, JSON.stringify(savedCard));
    console.log('[analyze] Saved card with ID:', cardId);

    return new Response(JSON.stringify({
      success: true,
      data: analysisData,
      cardId: cardId,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('API Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(JSON.stringify({
      success: false,
      error: `Analysis service error: ${errorMessage}`,
      type: 'api_error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
