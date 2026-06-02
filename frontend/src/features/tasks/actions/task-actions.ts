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
