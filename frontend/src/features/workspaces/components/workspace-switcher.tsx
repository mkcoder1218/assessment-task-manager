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
    <div className="relative inline-block text-left w-full sm:w-64">
      <label htmlFor="workspace-select" className="sr-only">Switch Workspace</label>
      <select
        id="workspace-select"
        value={currentWorkspaceId || ''}
        onChange={(e) => handleSwitch(e.target.value)}
        className="block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-slate-900 shadow-sm transition-all"
      >
        <option value="" disabled>Select a workspace</option>
        {workspaces.map((ws) => (
          <option key={ws.id} value={ws.id}>
            {ws.name}
          </option>
        ))}
      </select>
    </div>
  );
}
