import { Suspense } from 'react';
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProjectById } from '@/features/projects/services/project-service';
import { getWorkspaces, getAllWorkspaceMembers, WorkspaceMember } from '@/features/workspaces/services/workspace-service';
import { getTasks } from '@/features/tasks/services/task-service';
import { TaskList } from '@/features/tasks/components/task-list';
import { TaskFilters } from '@/features/tasks/components/task-filters';
import { OverdueTaskPanel } from '@/features/tasks/components/overdue-task-panel';

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ status?: string; assignee?: string }>;
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { projectId } = await params;
  const { status, assignee } = await searchParams;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const project = await getProjectById(projectId);

  if (!project) {
    return notFound();
  }

  const workspaces = await getWorkspaces();
  const currentWorkspace = workspaces.find(ws => ws.id === project.workspace_id);
  
  // Fetch members for the filter dropdown
  const members = await getAllWorkspaceMembers(project.workspace_id);

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass border-b border-border-subtle sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-18 items-center">
            <div className="flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className="group flex items-center justify-center w-10 h-10 rounded-xl bg-surface-muted border border-border-subtle text-text-dim hover:text-brand-primary hover:border-brand-primary/30 transition-all"
                aria-label="Back to Dashboard"
              >
                <svg className="w-5 h-5 translate-x-0 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="h-6 w-px bg-border-subtle hidden sm:block"></div>
              <h1 className="text-xl font-black text-text-main tracking-tight line-clamp-1">
                {project.name}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-text-dim uppercase tracking-widest">{currentWorkspace?.name}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-bold border border-brand-primary/20">
                {user.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-text-dim uppercase tracking-widest">
                <span className="hover:text-brand-primary cursor-pointer transition-colors px-2 py-0.5 rounded-md bg-surface-muted">{currentWorkspace?.name || 'Workspace'}</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span className="text-brand-primary font-black px-2 py-0.5 rounded-md bg-brand-primary/5">Project Tasks</span>
              </div>
              <h2 className="text-4xl font-black text-text-main tracking-tight">Focus on what matters</h2>
              <p className="text-text-dim font-medium max-w-xl">Manage and track all tasks for <span className="text-text-main font-bold">&quot;{project.name}&quot;</span>. Filter by status or assignee to stay organized.</p>
            </div>
            <div className="flex items-center shrink-0">
              <OverdueTaskPanel projectId={projectId} />
            </div>
          </div>

          <div className="bg-surface-base p-2 rounded-2xl border border-border-subtle shadow-sm mb-12">
            <TaskFilters members={members} />
          </div>
        </div>

        <div className="relative">
          <Suspense key={`${status}-${assignee}`} fallback={<TaskListSkeleton />}>
            <TaskDataWrapper projectId={projectId} status={status} assignee={assignee} members={members} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

async function TaskDataWrapper({ 
  projectId, 
  status, 
  assignee,
  members
}: { 
  projectId: string; 
  status?: string; 
  assignee?: string;
  members: WorkspaceMember[];
}) {
  const tasks = await getTasks(projectId, { 
    status, 
    assigneeId: assignee 
  }).catch((err) => {
    console.error('Task loading error:', err);
    return null;
  });

  if (tasks === null) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-center text-red-800">
        <h3 className="font-bold mb-1">Could not load tasks</h3>
        <p className="text-sm">Please refresh the page or contact support.</p>
      </div>
    );
  }

  return <TaskList tasks={tasks} members={members} projectId={projectId} />;
}

function TaskListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-24 bg-surface-base rounded-2xl border border-border-subtle shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 skeleton-shimmer"></div>
        </div>
      ))}
    </div>
  );
}
