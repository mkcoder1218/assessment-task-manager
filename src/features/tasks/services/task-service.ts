import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';

export type Task = Database['public']['Tables']['tasks']['Row'];

/**
 * Fetches all tasks for a given project, with optional filtering.
 * Relies on RLS for security.
 */
export async function getTasks(projectId: string, filters?: { status?: string; assigneeId?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId);

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status as Database['public']['Enums']['task_status']);
  }

  if (filters?.assigneeId && filters.assigneeId !== 'all') {
    query = query.eq('assignee_id', filters.assigneeId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to fetch tasks');
  }

  return data as Task[];
}
