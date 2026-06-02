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
    <div className="relative group/status">
      <select
        value={status}
        disabled={isUpdating}
        onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
        className={`appearance-none inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500
          ${status === 'todo' ? 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300' : ''}
          ${status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300' : ''}
          ${status === 'done' ? 'bg-green-50 text-green-700 border-green-200 hover:border-green-300' : ''}
          ${isUpdating ? 'opacity-70 animate-pulse' : ''}
          ${error ? 'border-red-500 ring-red-500' : ''}
        `}
      >
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
      
      {error && (
        <div className="absolute top-full left-0 mt-1 whitespace-nowrap bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded shadow-sm z-10 font-bold uppercase tracking-tighter">
          {error}
        </div>
      )}
    </div>
  );
}
