import { Project, getProjectTaskCounts } from '../services/project-service';
import { ProjectCard } from './project-card';

interface ProjectListProps {
  projects: Project[];
}

export async function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
        <h3 className="text-lg font-medium text-slate-900">No projects yet</h3>
        <p className="text-slate-500 mt-1">Get started by creating your first project.</p>
        <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
          Create Project
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
