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
      className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all block"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {project.name}
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-mono uppercase tracking-tighter">
          {project.id.slice(0, 8)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-slate-50 rounded-lg">
          <span className="block text-sm font-bold text-slate-900">{taskCounts.todo}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Todo</span>
        </div>
        <div className="text-center p-2 bg-orange-50 rounded-lg">
          <span className="block text-sm font-bold text-orange-600">{taskCounts.inProgress}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Doing</span>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <span className="block text-sm font-bold text-green-600">{taskCounts.done}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Done</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
        <span>Total: {taskCounts.total} tasks</span>
        <span className="text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Details →</span>
      </div>
    </Link>
  );
}
