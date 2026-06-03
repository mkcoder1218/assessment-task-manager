import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProjectById, getProjectTaskCounts } from '@/features/projects/services/project-service';
import { getWorkspaces, getAllWorkspaceMembers, WorkspaceMember } from '@/features/workspaces/services/workspace-service';
import { getTasks } from '@/features/tasks/services/task-service';
import { TaskList } from '@/features/tasks/components/task-list';
import { TaskFilters } from '@/features/tasks/components/task-filters';
import { OverdueTaskPanel } from '@/features/tasks/components/overdue-task-panel';
import { CreateTaskForm } from '@/features/tasks/components/create-task-form';

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ status?: string; assignee?: string }>;
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { projectId } = await params;
  const { status, assignee } = await searchParams;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const project = await getProjectById(projectId);

  if (!project) {
    return notFound();
  }

  const workspaces = await getWorkspaces();
  const currentWorkspace = workspaces.find(ws => ws.id === project.workspace_id);

  if (!currentWorkspace) {
    return notFound();
  }
  
  // Fetch members for the filter dropdown
  const [members, taskCounts] = await Promise.all([
    getAllWorkspaceMembers(project.workspace_id),
    getProjectTaskCounts(projectId)
  ]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b border-border-subtle bg-surface-base/90 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center justify-between gap-4 py-3">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <Link 
                href={`/dashboard?workspaceId=${project.workspace_id}`} 
                className="group flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface-muted px-3 text-sm font-bold text-text-dim transition hover:border-brand-primary/30 hover:text-brand-primary"
                aria-label="Back to workspace projects"
              >
                <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Projects</span>
              </Link>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-text-dim">{currentWorkspace.name}</p>
                <h1 className="truncate text-lg font-black tracking-tight text-text-main sm:text-xl">
                  {project.name}
                </h1>
              </div>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-primary/20 bg-brand-primary/10 text-xs font-bold text-brand-primary">
                {user.email?.[0].toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-6 rounded-xl border border-border-subtle bg-surface-base p-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-text-dim">
                  <Link href={`/dashboard?workspaceId=${project.workspace_id}`} className="rounded-md bg-surface-muted px-2 py-1 transition hover:text-brand-primary">
                    {currentWorkspace.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span className="text-brand-primary">{project.name}</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-text-main sm:text-3xl">
                  {project.name}
                </h2>
                <p className="text-sm leading-6 text-text-dim">
                  Tasks are scoped to this project, and assignees come from {currentWorkspace.name}.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:min-w-80">
                <div className="rounded-lg border border-border-subtle bg-surface-muted p-3 text-center">
                  <p className="text-lg font-black text-text-main">{taskCounts.todo}</p>
                  <p className="text-xs font-semibold text-text-dim">Todo</p>
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center">
                  <p className="text-lg font-black text-blue-700">{taskCounts.inProgress}</p>
                  <p className="text-xs font-semibold text-blue-500">Doing</p>
                </div>
                <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-center">
                  <p className="text-lg font-black text-green-700">{taskCounts.done}</p>
                  <p className="text-xs font-semibold text-green-600">Done</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4 flex justify-end">
            <OverdueTaskPanel projectId={projectId} />
          </div>

          <div className="mb-4 rounded-xl border border-border-subtle bg-surface-base p-2 shadow-sm">
            <TaskFilters members={members} />
          </div>
          <div className="mb-8">
            <CreateTaskForm projectId={projectId} members={members} />
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
