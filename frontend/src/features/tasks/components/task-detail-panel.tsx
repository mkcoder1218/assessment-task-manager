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
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Task Details</h2>
            <p className="text-xs text-slate-500 font-medium">Edit the fields below to update the task</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        <TaskEditForm task={task} members={members} onClose={onClose} />
      </div>
    </>
  );
}
