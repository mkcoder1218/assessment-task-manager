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
      <div className="animate-fade-in rounded-xl border border-dashed border-border-subtle bg-surface-base px-5 py-14 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-muted text-text-dim">
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
             </svg>
        </div>
        <h3 className="text-xl font-black tracking-tight text-text-main">No tasks found</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-dim">This project is currently empty. Use the task form above to add the first item.</p>
      </div>
    );
  }

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;
  const memberLabelById = new Map(
    members.map((member) => [member.user_id, `User ${member.user_id.slice(0, 4).toUpperCase()}`])
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-3 animate-fade-in">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            onClick={() => setSelectedTaskId(task.id)}
            className="group"
          >
            <TaskRow task={task} assigneeLabel={task.assignee_id ? memberLabelById.get(task.assignee_id) : undefined} />
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
