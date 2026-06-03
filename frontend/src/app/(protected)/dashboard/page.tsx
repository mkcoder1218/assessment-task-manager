import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { getAllWorkspaceMembers, getWorkspaces, getWorkspaceMembership } from '@/features/workspaces/services/workspace-service';
import { getProjects } from '@/features/projects/services/project-service';
import { WorkspaceSwitcher } from '@/features/workspaces/components/workspace-switcher';
import { CreateWorkspaceForm } from '@/features/workspaces/components/create-workspace-form';
import { WorkspaceMembersPanel } from '@/features/workspaces/components/workspace-members-panel';
import { ProjectList } from '@/features/projects/components/project-list';
import { CreateProjectForm } from '@/features/projects/components/create-project-form';
import { DashboardSkeleton } from '@/features/workspaces/components/dashboard-skeleton';

interface DashboardPageProps {
  searchParams: Promise<{ workspaceId?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null; // Should be handled by layout, but avoids TS errors

  const { workspaceId } = await searchParams;
  const workspaces = await getWorkspaces();
  
  const requestedWorkspace = workspaceId
    ? workspaces.find((workspace) => workspace.id === workspaceId)
    : null;
  const currentWorkspaceId = requestedWorkspace?.id || workspaces[0]?.id;

  if (workspaceId && !requestedWorkspace && workspaces[0]) {
    redirect(`/dashboard?workspaceId=${workspaces[0].id}`);
  }

  const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId);

  // Fetch membership role for the current workspace
  const [membership, workspaceMembers] = currentWorkspaceId
    ? await Promise.all([
        getWorkspaceMembership(currentWorkspaceId),
        getAllWorkspaceMembers(currentWorkspaceId),
      ])
    : [null, []];

  return (
    <div className="min-h-screen bg-background text-text-main">
      <nav className="sticky top-0 z-50 border-b border-border-subtle bg-surface-base/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white shadow-sm">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-lg font-black tracking-tight">TaskFlow</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold leading-5">{user.email?.split('@')[0]}</p>
                <p className="text-xs text-text-dim">{user.email}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-xl border border-border-subtle bg-surface-base p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-text-dim">
                <span className="rounded-md bg-surface-muted px-2 py-1 uppercase tracking-widest">Workspaces</span>
                <span aria-hidden="true">/</span>
                <span className="text-brand-primary">{currentWorkspace?.name || 'New workspace'}</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                {currentWorkspace?.name || 'Create your first workspace'}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-text-dim">
                Select a workspace to see only its projects and tasks.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[520px]">
              <WorkspaceSwitcher workspaces={workspaces} currentWorkspaceId={currentWorkspaceId} />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <CreateWorkspaceForm compact />
                {membership && (
                  <span className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-brand-primary/20 bg-brand-primary/10 px-3 text-xs font-bold uppercase tracking-wide text-brand-primary">
                    {membership.role} role
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-5">
          <div className="flex flex-col gap-2 border-b border-border-subtle pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-black tracking-tight">Projects</h3>
              <p className="mt-1 text-sm text-text-dim">
                {currentWorkspace ? `${currentWorkspace.name} projects` : 'Create a workspace before adding projects'}
              </p>
            </div>
            {currentWorkspaceId && (
              <div className="w-full sm:w-auto sm:min-w-[420px]">
                <CreateProjectForm workspaceId={currentWorkspaceId} compact />
              </div>
            )}
          </div>

          <Suspense fallback={<DashboardSkeleton />}>
            {currentWorkspaceId ? (
              <ProjectDataWrapper workspaceId={currentWorkspaceId} />
            ) : (
              <div className="rounded-xl border border-dashed border-border-subtle bg-surface-base px-5 py-14 text-center shadow-sm">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10 text-2xl font-black text-brand-primary">+</div>
                <h4 className="text-xl font-black tracking-tight">No workspaces yet</h4>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-dim">Create one now and the dashboard will open it automatically.</p>
                <CreateWorkspaceForm />
              </div>
            )}
          </Suspense>
        </section>

        {currentWorkspaceId && (
          <div className="mt-8">
            <WorkspaceMembersPanel
              workspaceId={currentWorkspaceId}
              members={workspaceMembers}
              canManageMembers={membership?.role === 'owner'}
            />
          </div>
        )}
      </main>
    </div>
  );
}

async function ProjectDataWrapper({ workspaceId }: { workspaceId: string }) {
  const projects = await getProjects(workspaceId).catch((err) => {
    console.error('Project loading error:', err);
    return null;
  });

  if (projects === null) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center">
        <h3 className="text-red-800 font-bold mb-1">Failed to load projects</h3>
        <p className="text-red-600 text-sm">Please refresh the page or try again later.</p>
      </div>
    );
  }

  return <ProjectList projects={projects} workspaceId={workspaceId} />;
}
