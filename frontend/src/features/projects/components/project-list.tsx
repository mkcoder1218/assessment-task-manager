import { Project, getProjectTaskCounts } from '../services/project-service';
import { CreateProjectForm } from './create-project-form';
import { ProjectCard } from './project-card';

interface ProjectListProps {
  projects: Project[];
  workspaceId: string;
}

export async function ProjectList({ projects, workspaceId }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-subtle bg-surface-base px-5 py-14 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-muted text-text-dim">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-6 4h6m-7 4h8M5 3h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" />
          </svg>
        </div>
        <h3 className="text-xl font-black tracking-tight text-text-main">No projects yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-dim">Create a project to start grouping tasks in this workspace.</p>
        <CreateProjectForm workspaceId={workspaceId} />
      </div>
    );
  }

  // Load task counts for all projects in parallel
  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => ({
      project,
      counts: await getProjectTaskCounts(project.id),
    }))
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projectsWithCounts.map(({ project, counts }) => (
        <ProjectCard key={project.id} project={project} taskCounts={counts} />
      ))}
    </div>
  );
}
