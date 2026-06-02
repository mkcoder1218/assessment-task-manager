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
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label="Back to Dashboard"
              >
                ←
              </Link>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {project.name}
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-slate-500 hidden sm:inline">{user.email}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                <span>{currentWorkspace?.name || 'Workspace'}</span>
                <span>/</span>
                <span className="text-blue-600">Tasks</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Task Overview</h2>
            </div>
            <div className="flex items-center gap-3">
              <OverdueTaskPanel projectId={projectId} />
            </div>
          </div>

          <TaskFilters members={members} />
        </div>

        <div className="space-y-6">
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
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-slate-200 rounded-xl border border-transparent shadow-sm"></div>
      ))}
    </div>
  );
}
