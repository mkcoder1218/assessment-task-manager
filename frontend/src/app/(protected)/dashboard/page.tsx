import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { getWorkspaces, getWorkspaceMembership } from '@/features/workspaces/services/workspace-service';
import { getProjects } from '@/features/projects/services/project-service';
import { WorkspaceSwitcher } from '@/features/workspaces/components/workspace-switcher';
import { ProjectList } from '@/features/projects/components/project-list';
import { DashboardSkeleton } from '@/features/workspaces/components/dashboard-skeleton';

interface DashboardPageProps {
  searchParams: Promise<{ workspaceId?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { workspaceId } = await searchParams;
  const workspaces = await getWorkspaces();
  
  // If no workspaceId in URL, default to the first one available
  const currentWorkspaceId = workspaceId || workspaces[0]?.id;
  const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId);

  // Fetch membership role for the current workspace
  const membership = currentWorkspaceId ? await getWorkspaceMembership(currentWorkspaceId) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Task Manager</h1>
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-slate-500 hidden sm:inline">{user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest">Active Workspace</h2>
            <div className="flex items-center gap-3">
              <WorkspaceSwitcher workspaces={workspaces} currentWorkspaceId={currentWorkspaceId} />
              {membership && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  {membership.role}
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 hidden lg:block">
            <p className="text-xs text-slate-500 font-medium">
              You are viewing the dashboard as <span className="text-slate-900">{user.email}</span>
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900">Projects</h3>
            <span className="text-sm text-slate-500">{currentWorkspace?.name || 'Loading...'}</span>
          </div>

          <Suspense fallback={<DashboardSkeleton />}>
            {currentWorkspaceId ? (
              <ProjectDataWrapper workspaceId={currentWorkspaceId} />
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500">You don&apos;t have any workspaces yet.</p>
              </div>
            )}
          </Suspense>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200 mt-12">
        <p className="text-center text-slate-400 text-xs tracking-widest uppercase">
          Workspace Task Manager &copy; 2026
        </p>
      </footer>
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

  return <ProjectList projects={projects} />;
}
