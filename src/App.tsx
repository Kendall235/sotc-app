import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { UploadZone } from './components/UploadZone';
import { UploadZoneV1 } from './components/UploadZoneV1';
import { UploadZoneV2 } from './components/UploadZoneV2';
import { UploadZoneV3 } from './components/UploadZoneV3';
import { ProcessingState } from './components/ProcessingState';
import { ScanningOverlay } from './components/ScanningOverlay';
import { ErrorState } from './components/ErrorState';
import { CollectionCard } from './components/CollectionCard';
import { ShareButtons } from './components/ShareButtons';
import { ExampleCards } from './components/ExampleCards';
import { LandingV1 } from './pages/LandingV1';
import { LandingV2 } from './pages/LandingV2';
import { LandingV3 } from './pages/LandingV3';
import { DevPreview } from './DevPreview';
import { processImage, createPreviewUrl } from './utils/imageProcessing';
import { analyzeCollection, fetchCard, ApiError } from './services/api';
import type { AppState, AppError, CollectionAnalysis } from './types/collection';

// Check if we're in dev mode and on /dev path
const isDevPreview = import.meta.env.DEV && window.location.pathname === '/dev';

// Check if URL contains a card ID (5 alphanumeric characters) - computed outside component
function getCardIdFromUrl(): string | null {
  const path = window.location.pathname;
  const match = path.match(/^\/([a-zA-Z0-9]{5})$/);
  return match ? match[1] : null;
}

function App() {
  // Compute initial cardId from URL before first render
  const initialCardId = useMemo(() => getCardIdFromUrl(), []);

  const [state, setState] = useState<AppState>(initialCardId ? 'processing' : 'idle');
  const [error, setError] = useState<AppError | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [, setProcessedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<CollectionAnalysis | null>(null);
  const [cardId, setCardId] = useState<string | undefined>(undefined);

  const cardRef = useRef<HTMLDivElement>(null);
  const lastFile = useRef<File | null>(null);
  const cardLoadAttempted = useRef(false);

  // Fetch card if ID in URL (only runs once on mount)
  useEffect(() => {
    if (!initialCardId || cardLoadAttempted.current) return;
    cardLoadAttempted.current = true;

    fetchCard(initialCardId)
      .then((savedCard) => {
        setAnalysis(savedCard.analysis);
        setPreviewUrl(savedCard.photoBase64);
        setCardId(savedCard.id);
        setState('result');
      })
      .catch((err) => {
        console.error('Failed to load card:', err);
        if (err instanceof ApiError) {
          setError({
            type: err.type,
            message: err.message,
            retryable: false,
          });
        } else {
          setError({
            type: 'api_error',
            message: 'Failed to load card. It may have been deleted.',
            retryable: false,
          });
        }
        setState('error');
      });
  }, [initialCardId]);

  // Get variant from URL query param (?v=1, ?v=2, ?v=3)
  const variant = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('v');
  }, []);

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
      setAnalysis(result.analysis);
      setCardId(result.cardId);

      // Update URL to reflect the new card ID (without page reload)
      if (result.cardId) {
        window.history.pushState({}, '', `/${result.cardId}`);
      }

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
    setCardId(undefined);
    lastFile.current = null;
    // Reset URL to home
    window.history.pushState({}, '', '/');
  }, []);

  const handleNewUpload = useCallback(() => {
    handleReset();
  }, [handleReset]);

  // Render the appropriate upload zone based on variant
  const renderUploadZone = (isProcessing: boolean, preview: string | null) => {
    switch (variant) {
      case '1':
        return (
          <UploadZoneV1
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            previewUrl={preview}
          />
        );
      case '2':
        return (
          <UploadZoneV2
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            previewUrl={preview}
          />
        );
      case '3':
        return (
          <UploadZoneV3
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            previewUrl={preview}
          />
        );
      default:
        return (
          <UploadZone
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
            previewUrl={preview}
          />
        );
    }
  };

  // Render DevPreview in dev mode when on /dev path
  if (isDevPreview) {
    return <DevPreview />;
  }

  return (
    <Layout>
      {/* Only show original Hero for v=0 (original landing) */}
      {variant === '0' && <Hero />}

      <main className={`mx-auto ${variant === '0' ? 'max-w-3xl' : 'max-w-5xl'}`}>
        {/* Idle state - show landing page variant or default */}
        {state === 'idle' && (
          variant === '1' ? (
            <LandingV1 onFileSelect={handleFileSelect} />
          ) : variant === '3' ? (
            <LandingV3 onFileSelect={handleFileSelect} />
          ) : variant === '0' ? (
            // Original landing (now accessed via ?v=0)
            <>
              <UploadZone
                onFileSelect={handleFileSelect}
                isProcessing={false}
                previewUrl={null}
              />
              <ExampleCards />
            </>
          ) : (
            // Default: V2 landing
            <LandingV2 onFileSelect={handleFileSelect} />
          )
        )}

        {/* Uploading/Processing state */}
        {(state === 'uploading' || state === 'processing') && (
          previewUrl ? (
            <ScanningOverlay previewUrl={previewUrl} />
          ) : (
            <div className="space-y-6 max-w-lg mx-auto">
              {renderUploadZone(true, null)}
              {state === 'processing' && <ProcessingState />}
            </div>
          )
        )}

        {/* Error state */}
        {state === 'error' && error && (
          <div className="space-y-6">
            {previewUrl && (
              <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
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
          <div className="flex flex-col items-center space-y-6">
            {/* Low confidence warning */}
            {analysis.watches.some(w => w.confidence === 'low') && (
              <div className="flex items-center gap-2 rounded-xl bg-gold/10 border border-[var(--color-gold-border)] px-4 py-3 text-sm text-gold w-full max-w-[600px]">
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
              photoUrl={previewUrl}
              cardId={cardId}
            />

            {/* Actions */}
            <ShareButtons cardRef={cardRef} cardId={cardId} />
            <button
              onClick={handleNewUpload}
              className="btn-ghost"
            >
              Upload New Photo
            </button>
          </div>
        )}
      </main>

      <Footer />
    </Layout>
  );
}

export default App;
