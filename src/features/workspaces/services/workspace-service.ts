import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';

export type Workspace = Database['public']['Tables']['workspaces']['Row'];
export type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row'];

/**
 * Fetches all workspaces for the authenticated user.
 * Relies on RLS for security.
 */
export async function getWorkspaces() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workspaces:', error.message, error.code, error.details);
    throw new Error(`Failed to fetch workspaces: ${error.message}`);
  }

  return data as Workspace[];
}

/**
 * Fetches the membership details for the authenticated user in a specific workspace.
 */
export async function getWorkspaceMembership(workspaceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows found'
    console.error('Error fetching membership:', error);
    throw new Error('Failed to fetch membership details');
  }

  return data as WorkspaceMember | null;
}
/**
 * Fetches all members for a specific workspace.
 */
export async function getAllWorkspaceMembers(workspaceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('role', { ascending: false })
    .order('user_id', { ascending: true });

  if (error) {
    console.error('Error fetching workspace members:', error);
    throw new Error('Failed to fetch workspace members');
  }

  return data as WorkspaceMember[];
}
