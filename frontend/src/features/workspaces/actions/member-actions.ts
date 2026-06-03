'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function addWorkspaceMember(formData: FormData) {
  const workspaceId = String(formData.get('workspaceId') || '').trim();
  const email = String(formData.get('email') || '').trim();

  if (!workspaceId) {
    return { error: 'Workspace is required.' };
  }

  if (!email) {
    return { error: 'Email is required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('add_workspace_member_by_email', {
    target_workspace_id: workspaceId,
    member_email: email,
  });

  if (error) {
    console.error('Error adding workspace member:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: 'Member added.' };
}

export async function removeWorkspaceMember(formData: FormData) {
  const workspaceId = String(formData.get('workspaceId') || '').trim();
  const userId = String(formData.get('userId') || '').trim();

  if (!workspaceId || !userId) {
    return { error: 'Workspace and user are required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('remove_workspace_member', {
    target_workspace_id: workspaceId,
    target_user_id: userId,
  });

  if (error) {
    console.error('Error removing workspace member:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: 'Member removed.' };
}
