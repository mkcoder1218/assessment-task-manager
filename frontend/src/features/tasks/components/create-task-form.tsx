'use client';

import { useState } from 'react';
import { WorkspaceMember } from '@/features/workspaces/services/workspace-service';
import { createTask } from '../actions/task-actions';

interface CreateTaskFormProps {
  projectId: string;
  members: WorkspaceMember[];
}

export function CreateTaskForm({ projectId, members }: CreateTaskFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = event.currentTarget;
    const result = await createTask(new FormData(form));

    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }

    form.reset();
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-base p-4 shadow-sm md:flex-row md:items-start">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="min-w-0 flex-1">
        <label htmlFor="task-title" className="sr-only">Task title</label>
        <input
          id="task-title"
          name="title"
          type="text"
          required
          maxLength={120}
          placeholder="New task"
          className="h-11 w-full rounded-xl border border-border-subtle bg-surface-muted px-3 text-sm font-semibold text-text-main outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
        />
        {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
      </div>
      <select
        name="assigneeId"
        defaultValue=""
        className="h-11 rounded-xl border border-border-subtle bg-surface-muted px-3 text-sm font-semibold text-text-main outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
      >
        <option value="">Unassigned</option>
        {members.map((member) => (
          <option key={member.user_id} value={member.user_id}>
            User {member.user_id.slice(0, 4).toUpperCase()}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Creating' : 'Add task'}
      </button>
    </form>
  );
}
