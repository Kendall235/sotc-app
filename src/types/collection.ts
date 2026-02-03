import { z } from 'zod';

// Zod schemas for runtime validation of Claude's response
export const DisplayTypeSchema = z.enum(['Digital', 'Analog', 'Ana-Digi']);

export const ConfidenceSchema = z.enum(['high', 'medium', 'low']);

export const WatchSchema = z.object({
  model_number: z.string(),
  series: z.string(),
  display_type: DisplayTypeSchema,
  colorway: z.string(),
  notable_features: z.array(z.string()),
  confidence: ConfidenceSchema,
  position: z.string(),
});

export const CollectionAnalysisSchema = z.object({
  total_watches: z.number().int().min(0),
  watches: z.array(WatchSchema),
  collection_highlights: z.array(z.string()),
  series_breakdown: z.record(z.string(), z.number()),
});

// TypeScript types derived from Zod schemas
export type DisplayType = z.infer<typeof DisplayTypeSchema>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
export type Watch = z.infer<typeof WatchSchema>;
export type CollectionAnalysis = z.infer<typeof CollectionAnalysisSchema>;

// App state types
export type AppState = 'idle' | 'uploading' | 'processing' | 'result' | 'error';

export interface AppError {
  type: 'parse_error' | 'no_watches' | 'api_error' | 'rate_limit' | 'file_error';
  message: string;
  retryable: boolean;
}

// API response types
export interface AnalyzeResponse {
  success: true;
  data: CollectionAnalysis;
}

export interface AnalyzeErrorResponse {
  success: false;
  error: string;
  type: AppError['type'];
}

export type ApiResponse = AnalyzeResponse | AnalyzeErrorResponse;
