import { useCallback, useState } from 'react';
import html2canvas from 'html2canvas';

interface DownloadButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
}

export function DownloadButton({ targetRef, filename = 'sotc-collection' }: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!targetRef.current || isGenerating) return;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#111111',
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [targetRef, filename, isGenerating]);

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center gap-2 rounded-lg bg-accent-orange px-4 py-2.5 font-display font-semibold text-white transition-all hover:bg-accent-orange-dim disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isGenerating ? (
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
      ) : (
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
  );
}
