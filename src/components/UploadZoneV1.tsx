import { useCallback, useState, useRef } from 'react';

interface UploadZoneV1Props {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  previewUrl: string | null;
}

export function UploadZoneV1({ onFileSelect, isProcessing, previewUrl }: UploadZoneV1Props) {
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

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="w-full max-w-lg mx-auto">
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`upload-zone-v1 cursor-pointer text-center ${isDragActive ? 'drag-active' : ''}`}
      >
        {/* Corner accents with pulse animation */}
        <div className="corner-accent-v1 top-left" />
        <div className="corner-accent-v1 top-right" />
        <div className="corner-accent-v1 bottom-left" />
        <div className="corner-accent-v1 bottom-right" />

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="space-y-6">
          {/* Upload icon in brick-bordered circle */}
          <div className={`
            mx-auto flex h-16 w-16 items-center justify-center rounded-full
            border-2 transition-all duration-300
            ${isDragActive
              ? 'border-brick bg-brick/10 shadow-[0_0_20px_rgba(196,52,46,0.3)]'
              : 'border-brick/50 hover:border-brick hover:shadow-[0_0_15px_rgba(196,52,46,0.2)]'
            }
          `}>
            <svg
              className={`h-6 w-6 transition-colors duration-300 ${isDragActive ? 'text-brick' : 'text-brick/70'}`}
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

          {/* Headline */}
          <div>
            <p className="text-lg font-medium text-primary mb-1">
              {isDragActive ? 'Drop your collection photo' : 'Drop your G-Shock collection'}
            </p>
          </div>

          {/* Explicit CTA Button */}
          <button
            onClick={handleButtonClick}
            className="btn-cta-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Choose Photo
          </button>

          <p className="text-muted text-sm">or drag & drop</p>
        </div>

        {/* Scanning line effect when dragging */}
        {isDragActive && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="scan-line" />
          </div>
        )}
      </div>

      {/* File specs */}
      <p className="mt-4 text-center font-mono text-xs text-muted tracking-wider">
        JPEG · PNG · HEIC · UP TO 10MB
      </p>

      {error && (
        <p className="mt-2 text-center text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
