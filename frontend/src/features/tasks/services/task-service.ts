import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';

export type Task = Database['public']['Tables']['tasks']['Row'];

/**
 * Fetches all tasks for a given project.
 * Relies on RLS for security.
 */
export async function getTasks(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to fetch tasks');
  }

  return data as Task[];
}
