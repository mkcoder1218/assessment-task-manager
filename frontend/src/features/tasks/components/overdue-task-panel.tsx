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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load overdue tasks';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleFetch}
        className="group relative px-6 py-2.5 bg-red-500 text-white text-[10px] font-black rounded-xl hover:bg-red-600 transition-all uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-500/20 active:scale-[0.98]"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        Show Overdue
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-text-main/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="bg-surface-base w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-border-subtle flex justify-between items-center bg-red-50/10">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-text-main tracking-tight">Critical Tasks</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Action required: Past due & incomplete</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center text-text-dim hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-surface-muted rounded-2xl animate-pulse"></div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-50/50 text-red-600 rounded-2xl border border-red-100 flex flex-col items-center text-center gap-3">
              <svg className="w-10 h-10 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div>
                <p className="font-black uppercase tracking-widest text-[10px] mb-1">Retrieval Failed</p>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && tasks && tasks.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-text-main font-black">All systems green!</p>
                <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest mt-1">No overdue tasks found in this project.</p>
              </div>
            </div>
          )}

          {!loading && !error && tasks && tasks.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {tasks.map((task) => (
                <div key={task.id} className="transform hover:scale-[1.01] transition-transform">
                  <TaskRow task={task} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-border-subtle bg-surface-muted/30 flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-8 py-3 bg-text-main text-surface-base text-[10px] font-black rounded-2xl hover:bg-black transition-all uppercase tracking-widest shadow-xl"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
