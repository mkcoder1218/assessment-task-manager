'use client';

import { useState } from 'react';
import { createProject } from '../actions/project-actions';

interface CreateProjectFormProps {
  workspaceId: string;
  compact?: boolean;
}

export function CreateProjectForm({ workspaceId, compact = false }: CreateProjectFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const result = await createProject(new FormData(event.currentTarget));

    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? 'flex w-full flex-col gap-3 sm:flex-row' : 'mx-auto mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row'}
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="min-w-0 flex-1">
        <label htmlFor={compact ? 'project-name-compact' : 'project-name'} className="sr-only">
          Project name
        </label>
        <input
          id={compact ? 'project-name-compact' : 'project-name'}
          name="name"
          type="text"
          required
          maxLength={80}
          placeholder="Project name"
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
        {pending ? 'Creating' : 'New project'}
      </button>
    </form>
  );
}
