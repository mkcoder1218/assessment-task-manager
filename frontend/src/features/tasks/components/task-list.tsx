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
      <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
        <h3 className="text-lg font-medium text-slate-900">No tasks found</h3>
        <p className="text-slate-500 mt-1">This project doesn&apos;t have any tasks yet.</p>
        <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          Add first task
        </button>
      </div>
    );
  }

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;

  return (
    <>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            onClick={() => setSelectedTaskId(task.id)}
            className="cursor-pointer"
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
