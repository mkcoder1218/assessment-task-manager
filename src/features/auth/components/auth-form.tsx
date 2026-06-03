'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
  action: (formData: FormData) => Promise<{ error?: string; success?: string } | undefined>;
}

export function AuthForm({ type, action }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await action(formData);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(result.success);
    }

    setLoading(false);
  }

  const isSignIn = type === 'sign-in';

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-surface-base rounded-2xl shadow-premium border border-border-subtle animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-text-main tracking-tight">
          {isSignIn ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="text-text-dim">
          {isSignIn
            ? 'Sign in to manage your workspaces'
            : 'Start organizing your tasks today'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-semibold text-text-main">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="block w-full px-4 py-2.5 bg-surface-muted border border-border-subtle rounded-xl shadow-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition-all outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-semibold text-text-main">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="block w-full px-4 py-2.5 bg-surface-muted border border-border-subtle rounded-xl shadow-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-main transition-all outline-none"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50/50 rounded-xl border border-red-100 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 text-sm text-green-600 bg-green-50/50 rounded-xl border border-green-100 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            isSignIn ? 'Sign In' : 'Create Account'
          )}
        </button>
      </form>

      <div className="pt-4 text-center text-sm border-t border-border-subtle">
        <span className="text-text-dim">
          {isSignIn ? "Don't have an account? " : 'Already have an account? '}
        </span>
        <Link
          href={isSignIn ? '/sign-up' : '/sign-in'}
          className="font-bold text-brand-primary hover:text-brand-secondary transition-colors"
        >
          {isSignIn ? 'Sign up' : 'Sign in'}
        </Link>
      </div>
    </div>
  );
}
