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

  if (!user) return null; // Should be handled by layout, but avoids TS errors

  const { workspaceId } = await searchParams;
  const workspaces = await getWorkspaces();
  
  // If no workspaceId in URL, default to the first one available
  const currentWorkspaceId = workspaceId || workspaces[0]?.id;
  const currentWorkspace = workspaces.find(ws => ws.id === currentWorkspaceId);

  // Fetch membership role for the current workspace
  const membership = currentWorkspaceId ? await getWorkspaceMembership(currentWorkspaceId) : null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass border-b border-border-subtle sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-18 items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shadow-md shadow-brand-primary/20">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-xl font-black text-text-main tracking-tight uppercase">TaskFlow</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-text-main">{user.email?.split('@')[0]}</span>
                <span className="text-[10px] uppercase tracking-widest text-text-dim font-semibold">{user.email}</span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-bold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              Current Workspace
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <WorkspaceSwitcher workspaces={workspaces} currentWorkspaceId={currentWorkspaceId} />
              {membership && (
                <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold bg-surface-base text-brand-primary border border-brand-primary/20 shadow-sm">
                  {membership.role.toUpperCase()}
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-surface-base/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-border-subtle hidden lg:block shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center text-text-dim text-sm font-bold border border-border-subtle">
                {user.email?.[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-text-dim font-bold uppercase tracking-wider">Authenticated As</p>
                <p className="text-sm text-text-main font-semibold leading-none mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div>
              <h3 className="text-3xl font-black text-text-main tracking-tight">Project Overview</h3>
              <p className="text-text-dim text-sm font-medium mt-1">Managing {currentWorkspace?.name || 'Workspace'}</p>
            </div>
          </div>

          <Suspense fallback={<DashboardSkeleton />}>
            {currentWorkspaceId ? (
              <ProjectDataWrapper workspaceId={currentWorkspaceId} />
            ) : (
              <div className="text-center py-24 bg-surface-base rounded-3xl border border-border-subtle shadow-premium animate-fade-in">
                <div className="empty-illustration mb-6"></div>
                <h4 className="text-xl font-bold text-text-main">No workspaces found</h4>
                <p className="text-text-dim mt-2 max-w-md mx-auto">Create a workspace to start managing your projects and tasks effectively.</p>
              </div>
            )}
          </Suspense>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 border-t border-border-subtle mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-text-dim text-xs font-bold tracking-widest uppercase items-center flex gap-2">
            <span className="w-1 h-1 bg-brand-primary rounded-full"></span>
            Task Manager Assessment &copy; 2026
          </p>
          <div className="flex items-center gap-8 text-[10px] font-bold text-text-dim uppercase tracking-widest">
            <span className="hover:text-brand-primary cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-brand-primary cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-brand-primary cursor-pointer transition-colors">Support</span>
          </div>
        </div>
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
