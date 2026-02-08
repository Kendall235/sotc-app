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
  image_url: z.string().url().nullable().optional(),
});

export const CollectionAnalysisSchema = z.object({
  total_watches: z.number().int().min(0),
  watches: z.array(WatchSchema),
  collection_highlights: z.array(z.string()),
  series_breakdown: z.record(z.string(), z.number()),
  grid_rows: z.number().int().min(1),
  grid_cols: z.number().int().min(1),
  row_counts: z.array(z.number()).optional(),
  _debug: z.object({
    row_counts: z.array(z.number()).nullable(),
    positioning_method: z.string(),
    grid_rows: z.number(),
    grid_cols: z.number(),
  }).optional(),
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
  cardId?: string;
}

// Saved card from KV
export interface SavedCard {
  id: string;
  created: string;
  analysis: CollectionAnalysis;
  photoBase64: string;
}

export interface AnalyzeErrorResponse {
  success: false;
  error: string;
  type: AppError['type'];
}

export type ApiResponse = AnalyzeResponse | AnalyzeErrorResponse;
