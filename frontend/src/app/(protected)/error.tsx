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
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center animate-fade-in">
      <div className="p-12 bg-surface-base rounded-[2.5rem] shadow-premium border border-border-subtle max-w-xl w-full">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-red-100">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-text-main tracking-tight mb-3">System Interruption</h2>
        <p className="text-text-dim font-medium mb-10 leading-relaxed">
          {error.message || "We encountered an unexpected error while processing your request. Our team has been notified."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-10 py-4 bg-brand-primary text-white font-black rounded-2xl hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 uppercase tracking-widest text-xs active:scale-[0.98]"
          >
            Attempt Recovery
          </button>
          <a
            href="/dashboard"
            className="px-10 py-4 bg-surface-muted text-text-main font-black rounded-2xl hover:bg-border-subtle transition-all uppercase tracking-widest text-xs"
          >
            Escalate to Safety
          </a>
        </div>
      </div>
    </div>
  );
}
