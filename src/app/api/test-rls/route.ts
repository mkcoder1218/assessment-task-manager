import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/supabase/database.types';

type ProjectInsert = Database['public']['Tables']['projects']['Insert'];

/**
 * DEVELOPMENT ONLY: RLS Verification API
 * Attempts to perform unauthorized operations to verify RLS protection.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Known Marketing Workspace ID from seed data
  // User B should NOT be able to see this.
  const MARKETING_WORKSPACE_ID = 'b16a4993-9c8a-4934-8c85-64bc439d73d6';

  const results: {
    user: string | undefined;
    timestamp: string;
    tests: { name: string; description: string; success: boolean; details: string }[];
  } = {
    user: user.email,
    timestamp: new Date().toISOString(),
    tests: [],
  };

  // Test 1: Unauthorized Read
  const { data: workspace, error: readError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', MARKETING_WORKSPACE_ID)
    .single();

  results.tests.push({
    name: 'Read unauthorized workspace',
    description: 'Attempt to read Marketing workspace as a non-member',
    success: !workspace && (!readError || readError.code === 'PGRST116'),
    details: workspace ? 'FAIL: Data was returned' : 'PASS: Data was blocked',
  });

  // Test 2: Unauthorized Insert
  const { data: project, error: insertError } = await supabase
    .from('projects')
    .insert({
      workspace_id: MARKETING_WORKSPACE_ID,
      name: 'Hack Project',
    } satisfies ProjectInsert)
    .select()
    .single();

  results.tests.push({
    name: 'Insert into unauthorized workspace',
    description: 'Attempt to create a project in a workspace you do not belong to',
    success: !project && insertError !== null,
    details: project ? 'FAIL: Project was created' : `PASS: Blocked (${insertError?.message})`,
  });

  return NextResponse.json(results);
}
