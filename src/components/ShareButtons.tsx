import { useCallback, useRef, useState, useMemo } from 'react';
import { toPng } from 'html-to-image';
import { ensureFontsLoaded } from '../utils/fontLoader';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Convert a data URL to a File object for Web Share API
 */
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64Data] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
  const byteString = atob(base64Data);
  const arrayBuffer = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    arrayBuffer[i] = byteString.charCodeAt(i);
  }
  return new File([arrayBuffer], filename, { type: mimeType });
}

/**
 * Check if the browser supports sharing files via Web Share API
 */
function canShareFiles(): boolean {
  if (!navigator.share || !navigator.canShare) return false;
  try {
    const testFile = new File([''], 'test.png', { type: 'image/png' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

/**
 * Detect if user is on a mobile device
 */
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

interface ShareButtonsProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  cardId?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAYS = [150, 300, 500];

export function ShareButtons({ cardRef, cardId }: ShareButtonsProps) {
  // Construct share URL from cardId
  const shareUrl = cardId
    ? `https://sotc.app/${cardId}`
    : 'https://sotc.app';
  const [copyState, setCopyState] = useState<ButtonState>('idle');
  const [downloadState, setDownloadState] = useState<ButtonState>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if on mobile for button text and share behavior
  const isMobile = useMemo(() => isMobileDevice(), []);
  const supportsFileShare = useMemo(() => canShareFiles(), []);

  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleCopyLink = useCallback(async () => {
    clearTimeouts();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyState('success');
      timeoutRef.current = setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('error');
      timeoutRef.current = setTimeout(() => setCopyState('idle'), 2000);
    }
  }, [shareUrl]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: 'My G-Shock Collection',
      text: 'Check out my G-Shock collection!',
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  }, [shareUrl, handleCopyLink]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || downloadState === 'loading') return;

    clearTimeouts();
    setDownloadState('loading');

    try {
      let dataUrl: string | null = null;
      let attempts = 0;

      while (!dataUrl && attempts < MAX_RETRIES) {
        // Ensure fonts are loaded
        const fontsReady = await ensureFontsLoaded();
        if (!fontsReady) {
          console.warn(`Font loading incomplete (attempt ${attempts + 1})`);
        }

        // Delay increases with each attempt
        const delay = RETRY_DELAYS[attempts] || 500;
        await new Promise(resolve => setTimeout(resolve, delay));

        try {
          dataUrl = await toPng(cardRef.current, {
            backgroundColor: '#1A1917',
            pixelRatio: 2,
            cacheBust: true,
          });
        } catch (renderError) {
          console.warn(`Render attempt ${attempts + 1} failed:`, renderError);
        }

        attempts++;
      }

      if (!dataUrl) {
        throw new Error('All export attempts failed');
      }

      const filename = `sotc-collection-${Date.now()}.png`;

      // On mobile with file sharing support, use Web Share API
      if (isMobile && supportsFileShare) {
        const file = dataUrlToFile(dataUrl, filename);
        try {
          await navigator.share({
            files: [file],
            title: 'My G-Shock Collection',
          });
          setDownloadState('success');
          timeoutRef.current = setTimeout(() => setDownloadState('idle'), 2000);
          return;
        } catch (err) {
          // If user cancelled, don't show error
          if ((err as Error).name === 'AbortError') {
            setDownloadState('idle');
            return;
          }
          // Fall through to anchor download
          console.warn('Share failed, falling back to download:', err);
        }
      }

      // Fallback: anchor download (works on desktop, may not work on iOS Safari)
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setDownloadState('success');
      timeoutRef.current = setTimeout(() => setDownloadState('idle'), 2000);
    } catch (error) {
      console.error('Failed to generate image:', error);
      setDownloadState('error');
      timeoutRef.current = setTimeout(() => setDownloadState('idle'), 3000);
    }
  }, [cardRef, downloadState]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {/* Share SOTC */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-body text-sm font-bold text-white bg-brick hover:shadow-[0_4px_20px_rgba(196,52,46,0.3)] hover:-translate-y-0.5 transition-all"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share SOTC
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-body text-sm font-bold transition-all ${
          copyState === 'success'
            ? 'bg-gold text-black'
            : copyState === 'error'
            ? 'bg-red-600 text-white'
            : 'btn-ghost'
        }`}
      >
        {copyState === 'success' ? (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : copyState === 'error' ? (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Failed
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Copy Link
          </>
        )}
      </button>

      {/* Download PNG */}
      <button
        onClick={handleDownload}
        disabled={downloadState === 'loading'}
        className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-body text-sm font-bold transition-all ${
          downloadState === 'loading'
            ? 'btn-ghost opacity-50 cursor-not-allowed'
            : downloadState === 'success'
            ? 'bg-gold text-black'
            : downloadState === 'error'
            ? 'bg-red-600 text-white'
            : 'btn-ghost'
        }`}
      >
        {downloadState === 'loading' ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </>
        ) : downloadState === 'success' ? (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {isMobile ? 'Saved!' : 'Downloaded!'}
          </>
        ) : downloadState === 'error' ? (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Failed
          </>
        ) : (
          <>
            {isMobile ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            {isMobile ? 'Save Image' : 'Download PNG'}
          </>
        )}
      </button>
    </div>
  );
}
