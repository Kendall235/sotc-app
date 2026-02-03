import { useCallback, useRef, useState } from 'react';
import html2canvas from 'html2canvas';

type ButtonState = 'idle' | 'loading' | 'success' | 'error';

interface ShareButtonsProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  shareUrl?: string;
}

export function ShareButtons({ cardRef, shareUrl = 'https://sotc.app' }: ShareButtonsProps) {
  const [copyState, setCopyState] = useState<ButtonState>('idle');
  const [downloadState, setDownloadState] = useState<ButtonState>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

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
  }, [shareUrl]);

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

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || downloadState === 'loading') return;

    clearTimeouts();
    setDownloadState('loading');

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#111114',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `sotc-collection-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
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
            Downloaded!
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
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PNG
          </>
        )}
      </button>
    </div>
  );
}
