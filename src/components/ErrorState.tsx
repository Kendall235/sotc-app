import type { ReactNode } from 'react';
import type { AppError } from '../types/collection';

interface ErrorStateProps {
  error: AppError;
  onRetry: () => void;
  onReset: () => void;
}

const errorIcons: Record<AppError['type'], ReactNode> = {
  parse_error: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  no_watches: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
    </svg>
  ),
  api_error: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  ),
  rate_limit: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  file_error: (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
};

const errorTitles: Record<AppError['type'], string> = {
  parse_error: 'Analysis Failed',
  no_watches: 'No Watches Found',
  api_error: 'Connection Error',
  rate_limit: 'Slow Down',
  file_error: 'File Error',
};

export function ErrorState({ error, onRetry, onReset }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {/* Error icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        {errorIcons[error.type]}
      </div>

      {/* Error title */}
      <h3 className="font-display text-xl font-semibold text-white">
        {errorTitles[error.type]}
      </h3>

      {/* Error message */}
      <p className="mt-2 max-w-md text-steel">
        {error.message}
      </p>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {error.retryable && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-accent-orange px-4 py-2 font-display font-semibold text-white transition-colors hover:bg-accent-orange-dim"
          >
            Try Again
          </button>
        )}
        <button
          onClick={onReset}
          className="rounded-lg border border-steel-dark px-4 py-2 font-display font-semibold text-steel-light transition-colors hover:border-steel hover:text-white"
        >
          Upload Different Photo
        </button>
      </div>
    </div>
  );
}
