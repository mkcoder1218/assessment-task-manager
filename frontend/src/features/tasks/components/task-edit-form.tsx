'use client';

import { useState } from 'react';
import { Task } from '../services/task-service';
import { updateTask, UpdateTaskInput } from '../actions/task-actions';
import { WorkspaceMember } from '@/features/workspaces/services/workspace-service';
import { Database } from '@/lib/supabase/database.types';

interface TaskEditFormProps {
  task: Task;
  members: WorkspaceMember[];
  onClose: () => void;
}

export function TaskEditForm({ task, members, onClose }: TaskEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateTaskInput>({
    title: task.title,
    description: task.description || '',
    status: task.status,
    assignee_id: task.assignee_id,
    due_date: task.due_date,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await updateTask(task.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      onClose();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="edit-title" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Task Title
          </label>
          <input
            id="edit-title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
          />
        </div>

        <div>
          <label htmlFor="edit-description" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Description
          </label>
          <textarea
            id="edit-description"
            rows={4}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 resize-none"
            placeholder="Add a more detailed description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-status" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Status
            </label>
            <select
              id="edit-status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Database['public']['Enums']['task_status'] })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <label htmlFor="edit-assignee" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Assignee
            </label>
            <select
              id="edit-assignee"
              value={formData.assignee_id || ''}
              onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value || null })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  User {member.user_id.slice(0, 4)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="edit-due-date" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Due Date
          </label>
          <input
            id="edit-due-date"
            type="date"
            value={formData.due_date ? formData.due_date.split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value || null })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
