import { useState, useRef, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { UploadZone } from './components/UploadZone';
import { ProcessingState } from './components/ProcessingState';
import { ErrorState } from './components/ErrorState';
import { CollectionCard } from './components/CollectionCard';
import { DownloadButton } from './components/DownloadButton';
import { ExampleCards } from './components/ExampleCards';
import { processImage, createPreviewUrl } from './utils/imageProcessing';
import { analyzeCollection, ApiError } from './services/api';
import type { AppState, AppError, CollectionAnalysis } from './types/collection';

function App() {
  const [state, setState] = useState<AppState>('idle');
  const [error, setError] = useState<AppError | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [, setProcessedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CollectionAnalysis | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const lastFile = useRef<File | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    lastFile.current = file;
    setError(null);
    setState('uploading');

    try {
      // Create preview URL
      const preview = await createPreviewUrl(file);
      setPreviewUrl(preview);

      // Process image (resize, compress)
      setState('processing');
      const processed = await processImage(file);
      setProcessedImage(processed.base64);

      // Analyze with AI
      const result = await analyzeCollection(processed.base64);
      setAnalysis(result);
      setState('result');
    } catch (err) {
      console.error('Error processing image:', err);

      if (err instanceof ApiError) {
        setError({
          type: err.type,
          message: err.message,
          retryable: err.type !== 'rate_limit',
        });
      } else if (err instanceof Error) {
        setError({
          type: 'file_error',
          message: err.message,
          retryable: true,
        });
      } else {
        setError({
          type: 'api_error',
          message: 'An unexpected error occurred. Please try again.',
          retryable: true,
        });
      }
      setState('error');
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastFile.current) {
      handleFileSelect(lastFile.current);
    }
  }, [handleFileSelect]);

  const handleReset = useCallback(() => {
    setState('idle');
    setError(null);
    setPreviewUrl(null);
    setProcessedImage(null);
    setAnalysis(null);
    lastFile.current = null;
  }, []);

  const handleNewUpload = useCallback(() => {
    handleReset();
  }, [handleReset]);

  return (
    <Layout>
      <Hero />

      <main className="mx-auto max-w-3xl">
        {/* Idle state - show upload zone and examples */}
        {state === 'idle' && (
          <>
            <UploadZone
              onFileSelect={handleFileSelect}
              isProcessing={false}
              previewUrl={null}
            />
            <ExampleCards />
          </>
        )}

        {/* Uploading/Processing state */}
        {(state === 'uploading' || state === 'processing') && (
          <div className="space-y-6">
            <UploadZone
              onFileSelect={handleFileSelect}
              isProcessing={true}
              previewUrl={previewUrl}
            />
            {state === 'processing' && !previewUrl && <ProcessingState />}
          </div>
        )}

        {/* Error state */}
        {state === 'error' && error && (
          <div className="space-y-6">
            {previewUrl && (
              <div className="overflow-hidden rounded-lg">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="h-auto max-h-48 w-full object-contain opacity-50"
                />
              </div>
            )}
            <ErrorState
              error={error}
              onRetry={handleRetry}
              onReset={handleReset}
            />
          </div>
        )}

        {/* Result state */}
        {state === 'result' && analysis && (
          <div className="space-y-6">
            {/* Low confidence warning */}
            {analysis.watches.some(w => w.confidence === 'low') && (
              <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Some identifications have low confidence. Image clarity affects accuracy.
              </div>
            )}

            {/* Collection card */}
            <CollectionCard
              ref={cardRef}
              analysis={analysis}
              imageUrl={null}
            />

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <DownloadButton targetRef={cardRef} />
              <button
                onClick={handleNewUpload}
                className="rounded-lg border border-steel-dark px-4 py-2.5 font-display font-semibold text-steel-light transition-colors hover:border-steel hover:text-white"
              >
                Upload New Photo
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </Layout>
  );
}

export default App;
