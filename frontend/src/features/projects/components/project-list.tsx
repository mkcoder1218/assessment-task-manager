import { Project, getProjectTaskCounts } from '../services/project-service';
import { ProjectCard } from './project-card';

interface ProjectListProps {
  projects: Project[];
}

export async function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-24 bg-surface-base rounded-3xl border-2 border-dashed border-border-subtle animate-fade-in shadow-sm">
        <div className="empty-illustration mb-8"></div>
        <h3 className="text-2xl font-black text-text-main tracking-tight">No projects yet</h3>
        <p className="text-text-dim mt-2 max-w-sm mx-auto font-medium">Get started by creating your first project to organize your workspace effectively.</p>
        <button className="mt-8 inline-flex items-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-2xl shadow-lg shadow-brand-primary/20 text-white bg-brand-primary hover:bg-brand-secondary transform hover:scale-[1.02] active:scale-[0.98] transition-all">
          Create Your First Project
        </button>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projectsWithCounts.map(({ project, counts }) => (
        <ProjectCard key={project.id} project={project} taskCounts={counts} />
      ))}
    </div>
  );
}
