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
    <div className="relative inline-block text-left w-full sm:w-80 group">
      <label htmlFor="workspace-select" className="sr-only">Switch Workspace</label>
      <div className="relative">
        <select
          id="workspace-select"
          value={currentWorkspaceId || ''}
          onChange={(e) => handleSwitch(e.target.value)}
          className="appearance-none block w-full pl-5 pr-12 py-3.5 text-base font-bold bg-surface-base border-2 border-border-subtle focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary sm:text-sm rounded-2xl text-text-main shadow-sm transition-all cursor-pointer hover:border-brand-primary/50"
        >
          <option value="" disabled>Select a workspace</option>
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-dim group-hover:text-brand-primary transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
