import Link from 'next/link';
import { Project } from '../services/project-service';

interface ProjectCardProps {
  project: Project;
  taskCounts: {
    todo: number;
    inProgress: number;
    done: number;
    total: number;
  };
}

export function ProjectCard({ project, taskCounts }: ProjectCardProps) {
  return (
    <Link 
      href={`/projects/${project.id}`}
      className="group block rounded-xl border border-border-subtle bg-surface-base p-5 shadow-sm transition hover:border-brand-primary/40 hover:shadow-md"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h3 className="truncate text-lg font-black text-text-main transition-colors group-hover:text-brand-primary">
            {project.name}
          </h3>
          <p className="text-xs font-medium text-text-dim">
            ID {project.id.slice(0, 8)}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface-muted text-text-dim transition group-hover:border-brand-primary/20 group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border-subtle bg-surface-muted p-3 text-center">
          <span className="block text-lg font-black leading-tight text-text-main">{taskCounts.todo}</span>
          <span className="mt-1 block text-xs font-semibold text-text-dim">Todo</span>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center">
          <span className="block text-lg font-black leading-tight text-blue-700">{taskCounts.inProgress}</span>
          <span className="mt-1 block text-xs font-semibold text-blue-500">Doing</span>
        </div>
        <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-center">
          <span className="block text-lg font-black leading-tight text-green-700">{taskCounts.done}</span>
          <span className="mt-1 block text-xs font-semibold text-green-600">Done</span>
        </div>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-end justify-between">
          <span className="text-xs font-semibold text-text-dim">Completion</span>
          <span className="text-xs font-black text-text-main">
            {taskCounts.total > 0 ? Math.round((taskCounts.done / taskCounts.total) * 100) : 0}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full border border-border-subtle/50 bg-surface-muted">
          <div 
            className="h-full bg-brand-primary transition-all duration-700 ease-out"
            style={{ width: `${taskCounts.total > 0 ? (taskCounts.done / taskCounts.total) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-4">
        <span className="text-xs font-semibold text-text-dim">
          {taskCounts.total} tasks
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-brand-primary opacity-80 transition group-hover:opacity-100">
          Open tasks <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </span>
      </div>
    </Link>
  );
}
