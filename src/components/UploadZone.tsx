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
      <div className="relative overflow-hidden rounded-lg bg-card">
        <img
          src={previewUrl}
          alt="Collection preview"
          className="h-auto w-full max-h-96 object-contain"
        />
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center">
              <div className="relative h-1 w-48 overflow-hidden rounded-full bg-steel-dark">
                <div className="animate-scan absolute inset-0 bg-gradient-to-b from-transparent via-accent-orange to-transparent" />
              </div>
              <p className="mt-4 font-display text-lg text-white">Identifying your collection...</p>
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
          relative cursor-pointer rounded-lg p-8 sm:p-12 text-center transition-all duration-200
          ${isDragActive ? 'upload-zone-border-active bg-elevated' : 'upload-zone-border bg-card hover:bg-elevated'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="space-y-4">
          {/* Scan icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-secondary">
            <svg
              className={`h-8 w-8 ${isDragActive ? 'text-accent-orange' : 'text-steel'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <div>
            <p className="font-display text-lg text-white">
              {isDragActive ? 'Drop your collection photo' : 'Drop your collection photo here'}
            </p>
            <p className="mt-1 text-sm text-steel">
              or <span className="text-accent-orange">click to browse</span>
            </p>
          </div>

          <p className="text-xs text-steel-dark">
            Supports JPEG, PNG, HEIC up to 10MB
          </p>
        </div>

        {/* Scanning line effect when dragging */}
        {isDragActive && (
          <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
            <div className="animate-scan absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent-orange to-transparent" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-center text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
