'use client';

import { useState } from 'react';
import { Database } from '@/lib/supabase/database.types';
import { updateTask } from '../actions/task-actions';

type TaskStatus = Database['public']['Enums']['task_status'];

interface TaskStatusSelectProps {
  taskId: string;
  currentStatus: TaskStatus;
}

export function TaskStatusSelect({ taskId, currentStatus }: TaskStatusSelectProps) {
  const [status, setStatus] = useState<TaskStatus>(currentStatus);
  const [prevStatus, setPrevStatus] = useState<TaskStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if currentStatus prop changes (e.g. from realtime update)
  if (currentStatus !== prevStatus) {
    setStatus(currentStatus);
    setPrevStatus(currentStatus);
  }

  async function handleStatusChange(newStatus: TaskStatus) {
    const previousStatus = status;
    
    // Optimistic Update
    setStatus(newStatus);
    setIsUpdating(true);
    setError(null);

    try {
      const result = await updateTask(taskId, { status: newStatus });
      
      if (result.error) {
        throw new Error(result.error);
      }
    } catch (err) {
      // Rollback
      setStatus(previousStatus);
      setError('Failed to update status');
      console.error('Status update failed:', err);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="relative inline-flex group/status">
      <div className="relative">
        <select
          value={status}
          disabled={isUpdating}
          onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
          className={`appearance-none inline-flex items-center pl-2.5 pr-6 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-brand-primary/5
            ${status === 'todo' ? 'bg-surface-muted text-text-dim border-border-subtle hover:border-text-dim/20' : ''}
            ${status === 'in_progress' ? 'bg-blue-50/50 text-blue-600 border-blue-100 hover:border-blue-200' : ''}
            ${status === 'done' ? 'bg-green-50/50 text-green-600 border-green-100 hover:border-green-200' : ''}
            ${isUpdating ? 'opacity-50 animate-pulse' : ''}
            ${error ? 'border-red-400 bg-red-50 text-red-600' : ''}
          `}
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1.5 transition-colors ${status === 'todo' ? 'text-text-dim' : status === 'in_progress' ? 'text-blue-600' : 'text-green-600'}`}>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 whitespace-nowrap bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-md shadow-lg z-10 font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}
    </div>
  );
}
