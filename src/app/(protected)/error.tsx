'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-xl rounded-xl border border-border-subtle bg-surface-base p-6 shadow-sm sm:p-8">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-black tracking-tight text-text-main">Something went wrong</h2>
        <p className="mb-6 text-sm leading-6 text-text-dim">
          {error.message || "The current workspace view could not load."}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-secondary"
          >
            Retry
          </button>
          <a
            href="/dashboard"
            className="rounded-lg bg-surface-muted px-5 py-3 text-sm font-bold text-text-main transition hover:bg-border-subtle"
          >
            Back to dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
