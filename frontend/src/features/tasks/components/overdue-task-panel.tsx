'use client';

import { useState } from 'react';
import { getOverdueTasks } from '../services/overdue-task-service';
import { Task } from '../services/task-service';
import { TaskRow } from './task-row';

interface OverdueTaskPanelProps {
  projectId: string;
}

export function OverdueTaskPanel({ projectId }: OverdueTaskPanelProps) {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  async function handleFetch() {
    setLoading(true);
    setError(null);
    setIsOpen(true);
    
    try {
      const result = await getOverdueTasks(projectId);
      setTasks(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load overdue tasks');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleFetch}
        className="px-4 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 hover:bg-red-100 transition-colors uppercase tracking-widest"
      >
        Show Overdue Tasks
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50/30">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Overdue Tasks</h2>
            <p className="text-xs text-slate-500 font-medium">Tasks past their due date that aren&apos;t done</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl"></div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center">
              <p className="font-bold mb-1">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && tasks && tasks.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-500 font-medium">No overdue tasks found!</p>
              <p className="text-xs text-slate-400 mt-1">Everything is on track.</p>
            </div>
          )}

          {!loading && !error && tasks && tasks.length > 0 && (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
