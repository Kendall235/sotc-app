import { CollectionAnalysisSchema } from '../types/collection';
import type { ApiResponse, CollectionAnalysis } from '../types/collection';

const API_ENDPOINT = '/api/analyze';

export class ApiError extends Error {
  type: 'parse_error' | 'no_watches' | 'api_error' | 'rate_limit' | 'file_error';

  constructor(message: string, type: ApiError['type']) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
  }
}

export async function analyzeCollection(imageBase64: string): Promise<CollectionAnalysis> {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: imageBase64 }),
  });

  if (response.status === 429) {
    throw new ApiError(
      'Rate limit exceeded. Please wait a few minutes before trying again.',
      'rate_limit'
    );
  }

  if (!response.ok) {
    throw new ApiError(
      'Failed to connect to the analysis service. Please try again.',
      'api_error'
    );
  }

  const data: ApiResponse = await response.json();

  if (!data.success) {
    throw new ApiError(data.error, data.type);
  }

  // Validate the response with Zod
  const parseResult = CollectionAnalysisSchema.safeParse(data.data);

  if (!parseResult.success) {
    console.error('Validation error:', parseResult.error);
    throw new ApiError(
      'Failed to parse analysis results. Please try again.',
      'parse_error'
    );
  }

  if (parseResult.data.total_watches === 0) {
    throw new ApiError(
      'No G-Shock watches detected in the image. Try uploading a clearer photo.',
      'no_watches'
    );
  }

  return parseResult.data;
}
