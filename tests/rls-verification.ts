/**
 * Phase 5.2 — Two-Account RLS Verification Script
 *
 * Tests authentication flows (sign-up, sign-in, sign-out) and
 * cross-workspace data isolation using authenticated anon-client sessions.
 *
 * IMPORTANT: Uses only the anon key — NO service-role key.
 *
 * Usage:
 *   npx tsx tests/rls-verification.ts
 *
 * Prerequisites:
 *   - Supabase project must have "Confirm email" DISABLED in Auth settings
 *     (or test accounts must be pre-confirmed).
 *   - The .env file must contain NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const envPath = path.resolve(__dirname, '..', 'frontend', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) {
  console.error('❌ Could not read Supabase URL / Anon Key from frontend/.env');
  process.exit(1);
}

const SUPABASE_URL = urlMatch[1].trim();
const SUPABASE_ANON_KEY = keyMatch[1].trim();

// Test credentials — these are disposable test accounts
const USER_A = { email: 'rls_test_a@testmail.dev', password: 'RlsTest_A_2026!' };
const USER_B = { email: 'rls_test_b@testmail.dev', password: 'RlsTest_B_2026!' };

// Edge function URL
const EDGE_FN_URL = `${SUPABASE_URL}/functions/v1/overdue-tasks`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface TestResult {
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function record(name: string, passed: boolean, details: string) {
  results.push({ name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`  ${icon} ${name}: ${details}`);
}

function makeAnonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function signUpOrIn(
  client: SupabaseClient,
  email: string,
  password: string
): Promise<{ userId: string; accessToken: string }> {
  // Try sign-in first
  const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (signInData?.session) {
    return {
      userId: signInData.session.user.id,
      accessToken: signInData.session.access_token,
    };
  }

  // Fall back to sign-up
  const { data: signUpData, error: signUpErr } = await client.auth.signUp({
    email,
    password,
  });

  if (signUpErr) {
    throw new Error(`Sign-up failed for ${email}: ${signUpErr.message}`);
  }

  // If email confirmation is disabled the session comes back immediately
  if (signUpData?.session) {
    return {
      userId: signUpData.session.user.id,
      accessToken: signUpData.session.access_token,
    };
  }

  // If email must be confirmed, try signing in (assumes pre-confirmed)
  const { data: retryData, error: retryErr } = await client.auth.signInWithPassword({
    email,
    password,
  });
  if (retryErr || !retryData.session) {
    throw new Error(
      `Could not authenticate ${email}. If email confirmation is enabled, confirm the account first. ${retryErr?.message ?? ''}`
    );
  }
  return {
    userId: retryData.session.user.id,
    accessToken: retryData.session.access_token,
  };
}

function authedClient(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   Phase 5.2 — RLS & Authentication Verification        ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ── 1. Authentication Flows ───────────────────────────────────────────
  console.log('━━━ 1. Authentication Flows ━━━');

  const clientA = makeAnonClient();
  const clientB = makeAnonClient();

  let userA: { userId: string; accessToken: string };
  let userB: { userId: string; accessToken: string };

  try {
    userA = await signUpOrIn(clientA, USER_A.email, USER_A.password);
    record('Sign-up / Sign-in User A', true, `uid=${userA.userId.slice(0, 8)}…`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    record('Sign-up / Sign-in User A', false, msg);
    console.error('Cannot proceed without User A. Aborting.');
    return printSummary();
  }

  try {
    userB = await signUpOrIn(clientB, USER_B.email, USER_B.password);
    record('Sign-up / Sign-in User B', true, `uid=${userB.userId.slice(0, 8)}…`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    record('Sign-up / Sign-in User B', false, msg);
    console.error('Cannot proceed without User B. Aborting.');
    return printSummary();
  }

  // Test sign-out
  const { error: signOutErr } = await clientA.auth.signOut();
  record('Sign-out User A', !signOutErr, signOutErr ? signOutErr.message : 'Session destroyed');

  // Re-sign-in for rest of tests
  const { data: reSignIn } = await clientA.auth.signInWithPassword({
    email: USER_A.email,
    password: USER_A.password,
  });
  record('Re-sign-in User A', !!reSignIn?.session, reSignIn?.session ? 'Session restored' : 'FAILED');
  if (reSignIn?.session) {
    userA = { userId: reSignIn.session.user.id, accessToken: reSignIn.session.access_token };
  }

  // Session refresh (getUser with existing token)
  const supaA = authedClient(userA.accessToken);
  const { data: refreshData, error: refreshErr } = await supaA.auth.getUser();
  record('Session refresh User A', !!refreshData?.user && !refreshErr, refreshErr ? refreshErr.message : 'User retrieved via token');

  // ── 2. Setup Workspaces & Data ────────────────────────────────────────
  console.log('\n━━━ 2. Setup Test Data ━━━');

  const supaB = authedClient(userB.accessToken);

  // Clean up previous test data
  for (const [label, supa, wsName] of [
    ['A', supaA, 'RLS Test Workspace A'],
    ['B', supaB, 'RLS Test Workspace B'],
  ] as const) {
    const { data: existingWs } = await supa.from('workspaces').select('id').eq('name', wsName);
    if (existingWs && existingWs.length > 0) {
      for (const ws of existingWs) {
        await supa.from('workspaces').delete().eq('id', ws.id);
      }
      console.log(`  🧹 Cleaned up old "${wsName}"`);
    }
  }

  // Create Workspace A (owned by User A)
  const { data: wsA, error: wsAErr } = await supaA.from('workspaces').insert({ name: 'RLS Test Workspace A' }).select().single();
  if (wsAErr || !wsA) {
    record('Create Workspace A', false, wsAErr?.message ?? 'No data');
    return printSummary();
  }
  record('Create Workspace A', true, `id=${wsA.id.slice(0, 8)}…`);

  // Add User A as owner
  const { error: memAErr } = await supaA.from('workspace_members').insert({
    workspace_id: wsA.id,
    user_id: userA.userId,
    role: 'owner',
  });
  record('Add User A as owner of Workspace A', !memAErr, memAErr ? memAErr.message : 'OK');

  // Create Workspace B (owned by User B)
  const { data: wsB, error: wsBErr } = await supaB.from('workspaces').insert({ name: 'RLS Test Workspace B' }).select().single();
  if (wsBErr || !wsB) {
    record('Create Workspace B', false, wsBErr?.message ?? 'No data');
    return printSummary();
  }
  record('Create Workspace B', true, `id=${wsB.id.slice(0, 8)}…`);

  const { error: memBErr } = await supaB.from('workspace_members').insert({
    workspace_id: wsB.id,
    user_id: userB.userId,
    role: 'owner',
  });
  record('Add User B as owner of Workspace B', !memBErr, memBErr ? memBErr.message : 'OK');

  // Create Project A in Workspace A
  const { data: projA, error: projAErr } = await supaA
    .from('projects')
    .insert({ workspace_id: wsA.id, name: 'Project A' })
    .select()
    .single();
  record('Create Project A', !projAErr && !!projA, projAErr ? projAErr.message : `id=${projA?.id.slice(0, 8)}…`);

  // Create Project B in Workspace B
  const { data: projB, error: projBErr } = await supaB
    .from('projects')
    .insert({ workspace_id: wsB.id, name: 'Project B' })
    .select()
    .single();
  record('Create Project B', !projBErr && !!projB, projBErr ? projBErr.message : `id=${projB?.id.slice(0, 8)}…`);

  // Create Task A in Project A
  const { data: taskA, error: taskAErr } = await supaA
    .from('tasks')
    .insert({ project_id: projA!.id, title: 'Task A', status: 'todo' })
    .select()
    .single();
  record('Create Task A', !taskAErr && !!taskA, taskAErr ? taskAErr.message : `id=${taskA?.id.slice(0, 8)}…`);

  // Create Task B in Project B  
  const { data: taskB, error: taskBErr } = await supaB
    .from('tasks')
    .insert({ project_id: projB!.id, title: 'Task B', status: 'in_progress' })
    .select()
    .single();
  record('Create Task B', !taskBErr && !!taskB, taskBErr ? taskBErr.message : `id=${taskB?.id.slice(0, 8)}…`);

  // ── 3. Allowed Access ─────────────────────────────────────────────────
  console.log('\n━━━ 3. Allowed Access ━━━');

  // User A reads own workspace
  const { data: wsARead } = await supaA.from('workspaces').select('*').eq('id', wsA.id);
  record('User A reads own workspace', wsARead !== null && wsARead.length === 1, `rows=${wsARead?.length ?? 0}`);

  // User A reads own projects
  const { data: projARead } = await supaA.from('projects').select('*').eq('workspace_id', wsA.id);
  record('User A reads own projects', projARead !== null && projARead.length >= 1, `rows=${projARead?.length ?? 0}`);

  // User A reads own tasks
  const { data: taskARead } = await supaA.from('tasks').select('*').eq('project_id', projA!.id);
  record('User A reads own tasks', taskARead !== null && taskARead.length >= 1, `rows=${taskARead?.length ?? 0}`);

  // User B reads own workspace
  const { data: wsBRead } = await supaB.from('workspaces').select('*').eq('id', wsB.id);
  record('User B reads own workspace', wsBRead !== null && wsBRead.length === 1, `rows=${wsBRead?.length ?? 0}`);

  // User B reads own projects
  const { data: projBRead } = await supaB.from('projects').select('*').eq('workspace_id', wsB.id);
  record('User B reads own projects', projBRead !== null && projBRead.length >= 1, `rows=${projBRead?.length ?? 0}`);

  // User B reads own tasks
  const { data: taskBRead } = await supaB.from('tasks').select('*').eq('project_id', projB!.id);
  record('User B reads own tasks', taskBRead !== null && taskBRead.length >= 1, `rows=${taskBRead?.length ?? 0}`);

  // ── 4. Blocked Cross-Workspace Access — User A vs B ────────────────
  console.log('\n━━━ 4. Cross-Workspace Isolation (User A → User B data) ━━━');

  // User A cannot read User B's workspace
  const { data: aCrossWs } = await supaA.from('workspaces').select('*').eq('id', wsB.id);
  record('A cannot read B workspace', aCrossWs !== null && aCrossWs.length === 0, `rows=${aCrossWs?.length ?? '?'}`);

  // User A cannot read User B's projects
  const { data: aCrossProj } = await supaA.from('projects').select('*').eq('workspace_id', wsB.id);
  record('A cannot read B projects', aCrossProj !== null && aCrossProj.length === 0, `rows=${aCrossProj?.length ?? '?'}`);

  // User A cannot read User B's tasks
  const { data: aCrossTasks } = await supaA.from('tasks').select('*').eq('project_id', projB!.id);
  record('A cannot read B tasks', aCrossTasks !== null && aCrossTasks.length === 0, `rows=${aCrossTasks?.length ?? '?'}`);

  // User A cannot insert into User B's workspace
  const { data: aInsertProj, error: aInsertProjErr } = await supaA
    .from('projects')
    .insert({ workspace_id: wsB.id, name: 'Hacked Project' })
    .select()
    .single();
  record('A cannot insert project into B workspace', !aInsertProj && !!aInsertProjErr, aInsertProjErr?.message ?? 'LEAK: inserted');

  // User A cannot update User B's tasks
  const { data: aUpdateTask, error: aUpdateErr } = await supaA
    .from('tasks')
    .update({ title: 'Hacked by A' })
    .eq('id', taskB!.id)
    .select();
  record(
    'A cannot update B tasks',
    (aUpdateTask === null || aUpdateTask.length === 0) || !!aUpdateErr,
    aUpdateErr ? aUpdateErr.message : `rows affected=${aUpdateTask?.length ?? 0}`
  );

  // User A cannot delete User B's tasks
  const { data: aDeleteTask, error: aDeleteErr } = await supaA
    .from('tasks')
    .delete()
    .eq('id', taskB!.id)
    .select();
  record(
    'A cannot delete B tasks',
    (aDeleteTask === null || aDeleteTask.length === 0) || !!aDeleteErr,
    aDeleteErr ? aDeleteErr.message : `rows affected=${aDeleteTask?.length ?? 0}`
  );

  // ── 5. Blocked Cross-Workspace Access — User B vs A ────────────────
  console.log('\n━━━ 5. Cross-Workspace Isolation (User B → User A data) ━━━');

  // User B cannot read User A's workspace
  const { data: bCrossWs } = await supaB.from('workspaces').select('*').eq('id', wsA.id);
  record('B cannot read A workspace', bCrossWs !== null && bCrossWs.length === 0, `rows=${bCrossWs?.length ?? '?'}`);

  // User B cannot read User A's projects
  const { data: bCrossProj } = await supaB.from('projects').select('*').eq('workspace_id', wsA.id);
  record('B cannot read A projects', bCrossProj !== null && bCrossProj.length === 0, `rows=${bCrossProj?.length ?? '?'}`);

  // User B cannot read User A's tasks
  const { data: bCrossTasks } = await supaB.from('tasks').select('*').eq('project_id', projA!.id);
  record('B cannot read A tasks', bCrossTasks !== null && bCrossTasks.length === 0, `rows=${bCrossTasks?.length ?? '?'}`);

  // User B cannot insert into User A's workspace
  const { data: bInsertProj, error: bInsertProjErr } = await supaB
    .from('projects')
    .insert({ workspace_id: wsA.id, name: 'Hacked Project by B' })
    .select()
    .single();
  record('B cannot insert project into A workspace', !bInsertProj && !!bInsertProjErr, bInsertProjErr?.message ?? 'LEAK: inserted');

  // User B cannot update User A's tasks
  const { data: bUpdateTask, error: bUpdateErr } = await supaB
    .from('tasks')
    .update({ title: 'Hacked by B' })
    .eq('id', taskA!.id)
    .select();
  record(
    'B cannot update A tasks',
    (bUpdateTask === null || bUpdateTask.length === 0) || !!bUpdateErr,
    bUpdateErr ? bUpdateErr.message : `rows affected=${bUpdateTask?.length ?? 0}`
  );

  // User B cannot delete User A's tasks
  const { data: bDeleteTask, error: bDeleteErr } = await supaB
    .from('tasks')
    .delete()
    .eq('id', taskA!.id)
    .select();
  record(
    'B cannot delete A tasks',
    (bDeleteTask === null || bDeleteTask.length === 0) || !!bDeleteErr,
    bDeleteErr ? bDeleteErr.message : `rows affected=${bDeleteTask?.length ?? 0}`
  );

  // ── 6. Edge Function Isolation ─────────────────────────────────────
  console.log('\n━━━ 6. Edge Function Isolation ━━━');

  // User A calls edge function for own project → should succeed (or return empty array)
  try {
    const resAOwn = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userA.accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ project_id: projA!.id }),
    });
    const bodyAOwn = await resAOwn.json();
    const isOk = resAOwn.ok && Array.isArray(bodyAOwn);
    record('A calls edge fn for own project', isOk, isOk ? `tasks=${bodyAOwn.length}` : `status=${resAOwn.status}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    record('A calls edge fn for own project', false, `fetch err: ${msg}`);
  }

  // User A calls edge function for User B's project → should return 0 tasks (RLS blocks)
  try {
    const resACross = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userA.accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ project_id: projB!.id }),
    });
    const bodyACross = await resACross.json();
    const blocked = resACross.ok && Array.isArray(bodyACross) && bodyACross.length === 0;
    record(
      'A edge fn blocked for B project',
      blocked || !resACross.ok,
      blocked ? 'Empty array (RLS)' : `status=${resACross.status}, body=${JSON.stringify(bodyACross).slice(0, 100)}`
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    record('A edge fn blocked for B project', false, `fetch err: ${msg}`);
  }

  // User B calls edge function for User A's project → same check
  try {
    const resBCross = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userB.accessToken}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ project_id: projA!.id }),
    });
    const bodyBCross = await resBCross.json();
    const blocked = resBCross.ok && Array.isArray(bodyBCross) && bodyBCross.length === 0;
    record(
      'B edge fn blocked for A project',
      blocked || !resBCross.ok,
      blocked ? 'Empty array (RLS)' : `status=${resBCross.status}, body=${JSON.stringify(bodyBCross).slice(0, 100)}`
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    record('B edge fn blocked for A project', false, `fetch err: ${msg}`);
  }

  // Unauthenticated call should be rejected
  try {
    const resNoAuth = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ project_id: projA!.id }),
    });
    record('Unauthenticated edge fn call rejected', resNoAuth.status === 401, `status=${resNoAuth.status}`);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    record('Unauthenticated edge fn call rejected', false, `fetch err: ${msg}`);
  }

  // ── 7. Realtime Verification ───────────────────────────────────────
  console.log('\n━━━ 7. Realtime Subscription Test ━━━');

  const realtimeResult = await new Promise<{ passed: boolean; details: string }>((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ passed: false, details: 'Timed out (10s) waiting for realtime event' });
    }, 10000);

    const channel = supaA
      .channel('rls-test-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projA!.id}`,
        },
        (payload) => {
          clearTimeout(timeout);
          const newStatus = (payload.new as Record<string, unknown>).status;
          resolve({
            passed: newStatus === 'in_progress',
            details: `Received UPDATE event, new status=${newStatus}`,
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Now perform the mutation that should trigger the realtime event
          setTimeout(async () => {
            await supaA
              .from('tasks')
              .update({ status: 'in_progress' })
              .eq('id', taskA!.id);
          }, 500);
        }
        if (status === 'CHANNEL_ERROR') {
          clearTimeout(timeout);
          resolve({ passed: false, details: 'Channel error' });
        }
      });
  });

  record('Realtime subscription receives events', realtimeResult.passed, realtimeResult.details);

  // ── 8. Cleanup ─────────────────────────────────────────────────────
  console.log('\n━━━ 8. Cleanup ━━━');

  // Delete workspaces (cascades to projects, tasks, members)
  await supaA.from('workspaces').delete().eq('id', wsA.id);
  await supaB.from('workspaces').delete().eq('id', wsB.id);
  console.log('  🧹 Test workspaces deleted');

  // Remove realtime channels
  await supaA.removeAllChannels();
  await supaB.removeAllChannels();

  printSummary();
}

function printSummary() {
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const failed = results.filter((r) => !r.passed);

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║   Results: ${passed}/${total} passed${failed.length > 0 ? `, ${failed.length} FAILED` : ' — ALL PASSED ✓'}`.padEnd(57) + '║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  if (failed.length > 0) {
    console.log('\nFailed tests:');
    failed.forEach((f) => console.log(`  ❌ ${f.name}: ${f.details}`));
  }

  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
