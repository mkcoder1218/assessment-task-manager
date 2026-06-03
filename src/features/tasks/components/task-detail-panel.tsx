'use client';

import { Task } from '../services/task-service';
import { WorkspaceMember } from '@/features/workspaces/services/workspace-service';
import { TaskEditForm } from './task-edit-form';

interface TaskDetailPanelProps {
  task: Task | null;
  members: WorkspaceMember[];
  onClose: () => void;
}

export function TaskDetailPanel({ task, members, onClose }: TaskDetailPanelProps) {
  if (!task) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-text-main/20 backdrop-blur-sm z-[90] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-surface-base shadow-[0_0_50px_rgba(0,0,0,0.15)] z-[100] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-l border-border-subtle overflow-y-auto animate-in slide-in-from-right duration-500">
        <div className="sticky top-0 z-10 flex items-center justify-between p-8 border-b border-border-subtle bg-surface-base/80 backdrop-blur-md">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-text-main tracking-tight">Task Details</h2>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
              <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest">Update information</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="group w-10 h-10 flex items-center justify-center text-text-dim hover:text-brand-primary hover:bg-brand-primary/10 rounded-2xl transition-all"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          <TaskEditForm task={task} members={members} onClose={onClose} />
        </div>
      </div>
    </>
  );
}
