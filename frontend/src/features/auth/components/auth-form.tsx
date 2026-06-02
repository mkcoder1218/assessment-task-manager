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
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          {isSignIn ? 'Welcome back' : 'Create an account'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {isSignIn
            ? 'Sign in to manage your workspaces'
            : 'Start organizing your tasks today'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-900"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="mt-1 block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-slate-900"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md border border-green-100">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : isSignIn ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div className="text-center text-sm">
        <span className="text-slate-600">
          {isSignIn ? "Don't have an account? " : 'Already have an account? '}
        </span>
        <Link
          href={isSignIn ? '/sign-up' : '/sign-in'}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          {isSignIn ? 'Sign up' : 'Sign in'}
        </Link>
      </div>
    </div>
  );
}
