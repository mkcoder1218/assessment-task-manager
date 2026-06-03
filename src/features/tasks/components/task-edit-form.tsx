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
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="edit-title" className="block text-xs font-black text-text-dim uppercase tracking-widest ml-1">
            Task Title
          </label>
          <input
            id="edit-title"
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-5 py-3.5 bg-surface-muted border border-border-subtle rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary text-text-main font-bold transition-all outline-none"
            placeholder="What needs to be done?"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-description" className="block text-xs font-black text-text-dim uppercase tracking-widest ml-1">
            Description
          </label>
          <textarea
            id="edit-description"
            rows={5}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-5 py-3.5 bg-surface-muted border border-border-subtle rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary text-text-main font-medium transition-all outline-none resize-none leading-relaxed"
            placeholder="Add some context or details..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="edit-status" className="block text-xs font-black text-text-dim uppercase tracking-widest ml-1">
              Status
            </label>
            <div className="relative group">
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Database['public']['Enums']['task_status'] })}
                className="appearance-none w-full px-5 py-3.5 bg-surface-muted border border-border-subtle rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary text-text-main font-bold transition-all outline-none cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-dim group-hover:text-brand-primary transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-assignee" className="block text-xs font-black text-text-dim uppercase tracking-widest ml-1">
              Assignee
            </label>
            <div className="relative group">
              <select
                id="edit-assignee"
                value={formData.assignee_id || ''}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value || null })}
                className="appearance-none w-full px-5 py-3.5 bg-surface-muted border border-border-subtle rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary text-text-main font-bold transition-all outline-none cursor-pointer"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    User {member.user_id.slice(0, 4).toUpperCase()}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-dim group-hover:text-brand-primary transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-due-date" className="block text-xs font-black text-text-dim uppercase tracking-widest ml-1">
            Due Date
          </label>
          <div className="relative group">
            <input
              id="edit-due-date"
              type="date"
              value={formData.due_date ? formData.due_date.split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value || null })}
              className="w-full px-5 py-3.5 bg-surface-muted border border-border-subtle rounded-2xl focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary text-text-main font-bold transition-all outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50/50 rounded-2xl border border-red-100 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border-subtle">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-4 text-sm font-black text-text-dim bg-surface-muted hover:bg-border-subtle rounded-2xl transition-all uppercase tracking-widest"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-4 text-sm font-black text-white bg-brand-primary hover:bg-brand-secondary shadow-lg shadow-brand-primary/20 rounded-2xl transition-all disabled:opacity-50 uppercase tracking-widest active:scale-[0.98]"
        >
          {loading ? 'Propagating...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
