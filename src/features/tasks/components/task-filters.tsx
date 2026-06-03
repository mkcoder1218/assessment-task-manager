'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { WorkspaceMember } from '@/features/workspaces/services/workspace-service';

interface TaskFiltersProps {
  members: WorkspaceMember[];
}

export function TaskFilters({ members }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentStatus = searchParams.get('status') || 'all';
  const currentAssignee = searchParams.get('assignee') || 'all';

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  const hasActiveFilters = currentStatus !== 'all' || currentAssignee !== 'all';

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 p-2">
      <div className="flex-1 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-text-dim group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <select
            id="status-filter"
            value={currentStatus}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="appearance-none block w-full pl-11 pr-10 py-3 text-sm font-bold bg-surface-muted border border-border-subtle rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary text-text-main transition-all cursor-pointer hover:bg-surface-base"
          >
            <option value="all">Every Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-dim">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-text-dim group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <select
            id="assignee-filter"
            value={currentAssignee}
            onChange={(e) => updateFilter('assignee', e.target.value)}
            className="appearance-none block w-full pl-11 pr-10 py-3 text-sm font-bold bg-surface-muted border border-border-subtle rounded-xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary text-text-main transition-all cursor-pointer hover:bg-surface-base"
          >
            <option value="all">All Assignees</option>
            {members.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                User {member.user_id.slice(0, 4).toUpperCase()}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-dim">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="px-6 py-3 text-xs font-black text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2"
        >
          Reset Filters
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}
