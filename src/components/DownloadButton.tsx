import { useCallback, useRef, useState } from 'react';
import html2canvas from 'html2canvas';

type DownloadState = 'idle' | 'generating' | 'success' | 'error';

interface DownloadButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
}

export function DownloadButton({ targetRef, filename = 'sotc-collection' }: DownloadButtonProps) {
  const [state, setState] = useState<DownloadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDownload = useCallback(async () => {
    if (!targetRef.current || state === 'generating') return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState('generating');
    setErrorMessage(null);

    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#111114', // resin-dark
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setState('success');
      // Reset to idle after showing success
      timeoutRef.current = setTimeout(() => setState('idle'), 2000);
    } catch (error) {
      console.error('Failed to generate image:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate image';
      setErrorMessage(message);
      setState('error');
      // Reset to idle after showing error
      timeoutRef.current = setTimeout(() => {
        setState('idle');
        setErrorMessage(null);
      }, 3000);
    }
  }, [targetRef, filename, state]);

  const buttonClass = {
    idle: 'bg-brick hover:shadow-[0_4px_20px_rgba(196,52,46,0.3)] hover:-translate-y-0.5',
    generating: 'bg-brick opacity-50 cursor-not-allowed',
    success: 'bg-gold hover:bg-gold',
    error: 'bg-red-600 hover:bg-red-700',
  }[state];

  return (
    <div className="relative">
      <button
        onClick={handleDownload}
        disabled={state === 'generating'}
        className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-body text-sm font-bold text-white transition-all ${buttonClass}`}
      >
        {state === 'generating' && (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating...
          </>
        )}
        {state === 'success' && (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Downloaded!
          </>
        )}
        {state === 'error' && (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Failed
          </>
        )}
        {state === 'idle' && (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Card
          </>
        )}
      </button>
      {/* Error toast */}
      {state === 'error' && errorMessage && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg bg-red-900/90 px-3 py-2 text-xs text-white shadow-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
