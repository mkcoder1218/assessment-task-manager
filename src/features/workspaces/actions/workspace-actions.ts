'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createWorkspace(formData: FormData) {
  const name = String(formData.get('name') || '').trim();

  if (!name) {
    return { error: 'Workspace name is required.' };
  }

  if (name.length > 80) {
    return { error: 'Workspace name must be 80 characters or fewer.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('create_workspace', {
    workspace_name: name,
  });

  if (error) {
    console.error('Error creating workspace:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  redirect(`/dashboard?workspaceId=${data.id}`);
}
