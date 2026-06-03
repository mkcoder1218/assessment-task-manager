import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';

export type Project = Database['public']['Tables']['projects']['Row'];

/**
 * Fetches all projects for a given workspace.
 * Relies on RLS for security.
 */
export async function getProjects(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects');
  }

  return data as Project[];
}

/**
 * Fetches details for a specific project.
 */
export async function getProjectById(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching project:', error);
    throw new Error('Failed to fetch project details');
  }

  return data as Project;
}

/**
 * Fetches task counts grouped by status for a specific project.
 */
export async function getProjectTaskCounts(projectId: string) {
  const supabase = await createClient();
  
  // Using multiple count queries or a single select with count if possible.
  // In Supabase, we can use .select('*', { count: 'exact', head: true }) with filtering.
  
  const getCount = async (status: 'todo' | 'in_progress' | 'done') => {
    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('status', status);
    
    if (error) throw error;
    return count || 0;
  };

  try {
    const [todo, inProgress, done] = await Promise.all([
      getCount('todo'),
      getCount('in_progress'),
      getCount('done')
    ]);

    return { todo, inProgress, done, total: todo + inProgress + done };
  } catch (error) {
    console.error('Error fetching task counts:', error);
    throw new Error('Failed to fetch task counts');
  }
}
