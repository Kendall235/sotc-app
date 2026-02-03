import { useCallback, useState, useRef } from 'react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  previewUrl: string | null;
}

export function UploadZone({ onFileSelect, isProcessing, previewUrl }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateAndSelect = useCallback((file: File) => {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB');
      return;
    }

    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSelect(file);
    }
  }, [validateAndSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelect(file);
    }
  }, [validateAndSelect]);

  const handleClick = useCallback(() => {
    if (!isProcessing) {
      inputRef.current?.click();
    }
  }, [isProcessing]);

  if (previewUrl) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-resin-dark border border-[var(--color-border)]">
        <img
          src={previewUrl}
          alt="Collection preview"
          className="h-auto w-full max-h-96 object-contain"
        />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            {/* Scan line */}
            <div className="scan-line" />

            <div className="text-center relative z-10">
              <p className="font-mono text-sm text-brick mb-4 tracking-wide">
                Identifying your collection<span className="animate-blink">_</span>
              </p>
              <div className="h-[3px] w-64 bg-resin-mid rounded overflow-hidden mx-auto">
                <div className="h-full bg-brick animate-progress-sweep rounded" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative cursor-pointer rounded-2xl p-12 text-center transition-all duration-300
          border-[1.5px] overflow-hidden
          ${isDragActive
            ? 'border-[var(--color-brick-border)] bg-resin-dark'
            : 'border-[var(--color-border)] bg-resin-dark hover:border-[var(--color-brick-border)] hover:-translate-y-0.5'
          }
          ${isDragActive ? 'shadow-[0_8px_40px_var(--color-brick-glow)]' : ''}
        `}
      >
        {/* Corner accents - top-left and bottom-right via CSS */}
        <div
          className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-brick rounded-tl opacity-40 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: isDragActive ? 0.9 : undefined }}
        />
        <div
          className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-brick rounded-br opacity-40 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: isDragActive ? 0.9 : undefined }}
        />
        {/* Corner accents - top-right and bottom-left */}
        <div
          className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-brick rounded-tr opacity-40 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: isDragActive ? 0.9 : undefined }}
        />
        <div
          className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-brick rounded-bl opacity-40 transition-opacity duration-300 pointer-events-none"
          style={{ opacity: isDragActive ? 0.9 : undefined }}
        />

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="space-y-5">
          {/* Upload icon in circle */}
          <div className={`
            mx-auto flex h-14 w-14 items-center justify-center rounded-full
            border-[1.5px] transition-colors duration-300
            ${isDragActive ? 'border-brick' : 'border-muted hover:border-brick'}
          `}>
            <svg
              className={`h-5 w-5 transition-colors duration-300 ${isDragActive ? 'text-brick' : 'text-tertiary'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div>
            <p className="text-[15px] font-medium text-primary">
              {isDragActive ? 'Drop your collection photo' : 'Drop your collection photo '}
              {!isDragActive && (
                <span className="text-brick font-semibold cursor-pointer">or browse</span>
              )}
            </p>
          </div>

          <p className="font-mono text-xs text-secondary tracking-wider">
            JPEG · PNG · HEIC · UP TO 10MB
          </p>
        </div>

        {/* Scanning line effect when dragging */}
        {isDragActive && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="scan-line" />
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="flex justify-center gap-10 pt-14 pb-10 flex-wrap">
        <div className="flex items-center gap-2.5">
          <span className="step-number">1</span>
          <span className="text-sm text-secondary font-medium">Upload photo</span>
        </div>
        <div className="w-6 h-px bg-[var(--color-border)] self-center hidden sm:block" />
        <div className="flex items-center gap-2.5">
          <span className="step-number">2</span>
          <span className="text-sm text-secondary font-medium">AI scans collection</span>
        </div>
        <div className="w-6 h-px bg-[var(--color-border)] self-center hidden sm:block" />
        <div className="flex items-center gap-2.5">
          <span className="step-number">3</span>
          <span className="text-sm text-secondary font-medium">Share your SOTC</span>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-center text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
