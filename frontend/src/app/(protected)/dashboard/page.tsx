import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { getWorkspaces, Workspace } from '@/features/workspaces/services/workspace-service';
import { getProjects, getProjectTaskCounts, Project } from '@/features/projects/services/project-service';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Load core data (Phase 2.3 Verification)
  const workspaces: Workspace[] = await getWorkspaces();
  const firstWorkspace: Workspace | undefined = workspaces[0];
  
  let projects: Project[] = [];
  let taskSummary: { todo: number; inProgress: number; done: number; total: number } | null = null;

  if (firstWorkspace) {
    projects = await getProjects(firstWorkspace.id);
    if (projects[0]) {
      taskSummary = await getProjectTaskCounts(projects[0].id);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-slate-900">Task Manager</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 hidden sm:inline">{user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-medium text-slate-900 mb-4">Verification: Authenticated User</h2>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-600 truncate">ID: <code className="bg-slate-100 px-1 rounded">{user.id}</code></p>
              <p className="text-slate-600">Email: {user.email}</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-900 mb-4">Verification: Your Workspaces ({workspaces.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((ws) => (
                <div key={ws.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900">{ws.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{ws.id}</p>
                </div>
              ))}
              {workspaces.length === 0 && <p className="text-slate-500 italic">No workspaces found.</p>}
            </div>
          </section>

          {firstWorkspace && (
            <section>
              <h2 className="text-lg font-medium text-slate-900 mb-4">
                Verification: Interior Projects in <span className="text-blue-600">&quot;{firstWorkspace.name}&quot;</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
                    <h3 className="font-bold text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{p.id}</p>
                  </div>
                ))}
                {projects.length === 0 && <p className="text-slate-500 italic">No projects found in this workspace.</p>}
              </div>
            </section>
          )}

          {taskSummary && projects[0] && (
            <section>
              <h2 className="text-lg font-medium text-slate-900 mb-4">
                Verification: Task Counts in <span className="text-blue-600">&quot;{projects[0].name}&quot;</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="block text-2xl font-bold text-slate-900">{taskSummary.total}</span>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Total</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="block text-2xl font-bold text-blue-600">{taskSummary.todo}</span>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Todo</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="block text-2xl font-bold text-orange-500">{taskSummary.inProgress}</span>
                  <span className="text-xs text-slate-500 uppercase font-semibold">In Progress</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                  <span className="block text-2xl font-bold text-green-600">{taskSummary.done}</span>
                  <span className="text-xs text-slate-500 uppercase font-semibold">Done</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
