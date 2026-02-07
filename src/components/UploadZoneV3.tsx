import { useCallback, useState, useRef } from 'react';

interface UploadZoneV3Props {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  previewUrl: string | null;
}

export function UploadZoneV3({ onFileSelect, isProcessing, previewUrl }: UploadZoneV3Props) {
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
      <div className="relative overflow-hidden rounded-3xl bg-[#101012] border border-[rgba(248,246,241,0.12)]">
        <img
          src={previewUrl}
          alt="Collection preview"
          className="h-auto w-full max-h-96 object-contain"
        />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center relative z-10">
              <p className="font-mono text-sm text-cream mb-4 tracking-wide">
                Identifying your collection<span className="animate-blink">_</span>
              </p>
              <div className="h-[2px] w-48 bg-[#1A1A1E] rounded overflow-hidden mx-auto">
                <div className="h-full bg-cream animate-progress-sweep rounded" style={{ background: '#F8F6F1' }} />
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
        className={`upload-zone-luxury cursor-pointer text-center ${isDragActive ? 'drag-active' : ''}`}
      >
        {/* Cream corner accents */}
        <div className="corner-accent-cream top-left" />
        <div className="corner-accent-cream top-right" />
        <div className="corner-accent-cream bottom-left" />
        <div className="corner-accent-cream bottom-right" />

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="space-y-8">
          {/* Minimal icon */}
          <div className={`
            mx-auto flex h-14 w-14 items-center justify-center rounded-full
            border transition-all duration-300
            ${isDragActive
              ? 'border-cream'
              : 'border-[rgba(248,246,241,0.25)] hover:border-[rgba(248,246,241,0.5)]'
            }
          `}
          style={{ borderColor: isDragActive ? '#F8F6F1' : undefined }}
          >
            <svg
              className="h-5 w-5 transition-colors duration-300"
              style={{ color: isDragActive ? '#F8F6F1' : '#E8E5DE' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>

          {/* Minimal text */}
          <div>
            <p className="text-xl font-light tracking-wide" style={{ color: '#F8F6F1' }}>
              {isDragActive ? 'Release to upload' : 'Drop your collection'}
            </p>
          </div>

          {/* Luxury Button */}
          <button
            onClick={handleButtonClick}
            className="btn-luxury"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Choose Photo
          </button>
        </div>
      </div>

      {/* File specs - below zone, minimal */}
      <p className="mt-6 text-center font-mono text-xs tracking-wider" style={{ color: '#6E6A64' }}>
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
