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
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-1">
          <label htmlFor="status-filter" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Status
          </label>
          <select
            id="status-filter"
            value={currentStatus}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="flex-1 space-y-1">
          <label htmlFor="assignee-filter" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Assignee
          </label>
          <select
            id="assignee-filter"
            value={currentAssignee}
            onChange={(e) => updateFilter('assignee', e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
          >
            <option value="all">All Assignees</option>
            {members.map((member) => (
              <option key={member.user_id} value={member.user_id}>
                User {member.user_id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {currentStatus !== 'all' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                Status: {currentStatus.replace('_', ' ')}
              </span>
            )}
            {currentAssignee !== 'all' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase">
                Assignee: {currentAssignee.slice(0, 4)}
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            Clear Filters ×
          </button>
        </div>
      )}
    </div>
  );
}
