'use client';

import { useState } from 'react';
import { createWorkspace } from '../actions/workspace-actions';

interface CreateWorkspaceFormProps {
  compact?: boolean;
}

export function CreateWorkspaceForm({ compact = false }: CreateWorkspaceFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const result = await createWorkspace(new FormData(event.currentTarget));

    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'flex w-full flex-col gap-3 sm:flex-row' : 'mx-auto mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row'}>
      <div className="min-w-0 flex-1">
        <label htmlFor={compact ? 'workspace-name-compact' : 'workspace-name'} className="sr-only">
          Workspace name
        </label>
        <input
          id={compact ? 'workspace-name-compact' : 'workspace-name'}
          name="name"
          type="text"
          required
          maxLength={80}
          placeholder="Workspace name"
          className="h-11 w-full rounded-lg border border-border-subtle bg-surface-base px-3 text-sm font-medium text-text-main outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
        />
        {error && <p className="mt-2 text-left text-xs font-semibold text-red-600">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span aria-hidden="true">+</span>
        {pending ? 'Creating' : 'New workspace'}
      </button>
    </form>
  );
}
