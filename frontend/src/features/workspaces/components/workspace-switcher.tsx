'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Workspace } from '../services/workspace-service';

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspaceId?: string;
}

export function WorkspaceSwitcher({ workspaces, currentWorkspaceId }: WorkspaceSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSwitch(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('workspaceId', id);
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <div className="group relative w-full">
      <label htmlFor="workspace-select" className="mb-2 block text-xs font-bold text-text-dim">
        Active workspace
      </label>
      <div className="relative">
        <select
          id="workspace-select"
          value={currentWorkspaceId || ''}
          onChange={(e) => handleSwitch(e.target.value)}
          className="block h-11 w-full cursor-pointer appearance-none rounded-lg border border-border-subtle bg-surface-base px-3 pr-10 text-sm font-semibold text-text-main outline-none transition hover:border-brand-primary/50 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
        >
          <option value="" disabled>No workspace selected</option>
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-dim transition-colors group-hover:text-brand-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
