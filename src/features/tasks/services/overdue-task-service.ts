import { createClient } from '@/lib/supabase/client';
import { Task } from './task-service';

export type OverdueTask = Task & {
  assignee_name: string;
};

/**
 * Invokes the overdue-tasks Edge Function for a specific project.
 */
export async function getOverdueTasks(projectId: string): Promise<OverdueTask[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase.functions.invoke('overdue-tasks', {
    body: { project_id: projectId },
  });

  if (error) {
    console.error('Edge Function error:', error);
    throw new Error(error.message || 'Failed to fetch overdue tasks');
  }

  return data as OverdueTask[];
}
