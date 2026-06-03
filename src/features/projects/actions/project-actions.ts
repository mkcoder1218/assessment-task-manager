'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createProject(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  const workspaceId = String(formData.get('workspaceId') || '').trim();

  if (!workspaceId) {
    return { error: 'Choose a workspace first.' };
  }

  if (!name) {
    return { error: 'Project name is required.' };
  }

  if (name.length > 80) {
    return { error: 'Project name must be 80 characters or fewer.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, workspace_id: workspaceId })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating project:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  redirect(`/projects/${data.id}`);
}
