interface Env {
  ANTHROPIC_API_KEY: string;
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

const ANALYSIS_PROMPT = `You are a G-Shock watch identification expert. Analyze this collection photo and identify each visible G-Shock watch.

For each watch, provide:
- model_number: The specific model (e.g., "DW-5600E-1V", "GA-2100-1A1")
- series: The product line (e.g., "Square/5600", "CasiOak/2100", "Frogman", "Mudmaster")
- display_type: "Digital", "Analog", or "Ana-Digi"
- colorway: Brief description (e.g., "Stealth Black", "Red/Black")
- notable_features: Array of features (e.g., ["Solar", "Bluetooth", "Tide Graph"])
- confidence: "high", "medium", or "low" based on image clarity
- position: Where in the image (e.g., "top left", "center row, 3rd from left")

Also provide:
- total_watches: Integer count
- collection_highlights: 2-3 notable observations about the collection
- series_breakdown: Object with series names as keys and counts as values

Return ONLY valid JSON. If you cannot identify a watch clearly, include it with confidence: "low".`;

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

    return new Response(JSON.stringify({
      success: true,
      data: analysisData,
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
