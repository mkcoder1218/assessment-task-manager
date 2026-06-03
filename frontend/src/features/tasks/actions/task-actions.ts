'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';
import { revalidatePath } from 'next/cache';

type TaskStatus = Database['public']['Enums']['task_status'];

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  assignee_id?: string | null;
  due_date?: string | null;
}

export async function createTask(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  const projectId = String(formData.get('projectId') || '').trim();
  const assigneeId = String(formData.get('assigneeId') || '').trim();

  if (!projectId) {
    return { error: 'Project is required.' };
  }

  if (!title) {
    return { error: 'Task title is required.' };
  }

  if (title.length > 120) {
    return { error: 'Task title must be 120 characters or fewer.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title,
      project_id: projectId,
      assignee_id: assigneeId || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return { error: error.message };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, data };
}

/**
 * Updates a task. Relies on RLS for authorization.
 */
export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .update(input)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true, data };
}
