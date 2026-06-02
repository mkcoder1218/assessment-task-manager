'use client';

import { useState } from 'react';
import { Task } from '../services/task-service';
import { TaskRow } from './task-row';
import { TaskDetailPanel } from './task-detail-panel';
import { WorkspaceMember } from '@/features/workspaces/services/workspace-service';

import { useTaskRealtime } from '../hooks/use-task-realtime';

interface TaskListProps {
  tasks: Task[];
  members: WorkspaceMember[];
  projectId: string;
}

export function TaskList({ tasks: initialTasks, members, projectId }: TaskListProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const tasks = useTaskRealtime(projectId, initialTasks);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 bg-surface-base rounded-3xl border border-border-subtle shadow-premium animate-fade-in">
        <div className="empty-illustration mb-8 relative">
           <div className="absolute inset-0 flex items-center justify-center opacity-40">
             <svg className="w-16 h-16 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
             </svg>
           </div>
        </div>
        <h3 className="text-2xl font-black text-text-main tracking-tight">No tasks found</h3>
        <p className="text-text-dim mt-2 max-w-sm mx-auto font-medium">This project is currently empty. Start by adding tasks to track your progress.</p>
        <button className="mt-8 inline-flex items-center px-8 py-3 text-sm font-bold rounded-2xl shadow-lg shadow-brand-primary/20 text-white bg-brand-primary hover:bg-brand-secondary transform hover:scale-[1.02] active:scale-[0.98] transition-all">
          Create First Task
        </button>
      </div>
    );
  }

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 animate-fade-in">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            onClick={() => setSelectedTaskId(task.id)}
            className="group"
          >
            <TaskRow task={task} />
          </div>
        ))}
      </div>

      <TaskDetailPanel 
        task={selectedTask} 
        members={members} 
        onClose={() => setSelectedTaskId(null)} 
      />
    </>
  );
}
