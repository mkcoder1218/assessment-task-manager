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
      className="group bg-surface-base p-6 rounded-2xl border border-border-subtle shadow-premium hover:shadow-premium-hover hover:border-brand-primary/30 transition-all duration-300 block relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-0 bg-brand-primary group-hover:h-full transition-all duration-500"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-text-main group-hover:text-brand-primary transition-colors">
            {project.name}
          </h3>
          <p className="text-[10px] text-text-dim font-bold uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-brand-primary/40 rounded-full"></span>
            Project ID: {project.id.slice(0, 8)}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center border border-border-subtle group-hover:bg-brand-primary/10 group-hover:border-brand-primary/20 transition-colors">
          <svg className="w-5 h-5 text-text-dim group-hover:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-surface-muted rounded-xl border border-border-subtle/50">
          <span className="block text-lg font-black text-text-main leading-tight">{taskCounts.todo}</span>
          <span className="text-[9px] text-text-dim font-bold uppercase tracking-widest mt-1 block">Todo</span>
        </div>
        <div className="text-center p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
          <span className="block text-lg font-black text-blue-600 leading-tight">{taskCounts.inProgress}</span>
          <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-1 block">Doing</span>
        </div>
        <div className="text-center p-3 bg-green-50/50 rounded-xl border border-green-100/50">
          <span className="block text-lg font-black text-green-600 leading-tight">{taskCounts.done}</span>
          <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest mt-1 block">Done</span>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Completion</span>
          <span className="text-[10px] font-black text-text-main">
            {taskCounts.total > 0 ? Math.round((taskCounts.done / taskCounts.total) * 100) : 0}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-surface-muted rounded-full overflow-hidden border border-border-subtle/30">
          <div 
            className="h-full bg-brand-primary transition-all duration-1000 ease-out"
            style={{ width: `${taskCounts.total > 0 ? (taskCounts.done / taskCounts.total) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-border-subtle flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-bold text-text-dim uppercase tracking-widest">
            Total Capacity: <span className="text-text-main">{taskCounts.total} Tasks</span>
          </div>
        </div>
        <span className="text-xs font-bold text-brand-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">
          Explore <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </span>
      </div>
    </Link>
  );
}
