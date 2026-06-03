import { Task } from '../services/task-service';
import { TaskStatusSelect } from './task-status-select';

interface TaskRowProps {
  task: Task;
  assigneeLabel?: string;
}

export function TaskRow({ task, assigneeLabel }: TaskRowProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  const formattedDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : null;

  return (
    <div className="group bg-surface-base p-5 rounded-2xl border border-border-subtle shadow-sm hover:shadow-premium hover:border-brand-primary/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 relative overflow-hidden">
      {isOverdue && <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500"></div>}
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h4 className="text-lg font-black text-text-main truncate group-hover:text-brand-primary transition-colors">
            {task.title}
          </h4>
          <div onClick={(e) => e.stopPropagation()}>
            <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
          </div>
        </div>
        {task.description && (
          <p className="text-sm text-text-dim truncate max-w-2xl font-medium leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6 md:gap-10 shrink-0 border-t md:border-t-0 border-border-subtle pt-4 md:pt-0">
        {task.assignee_id && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-text-dim text-[10px] font-bold border border-border-subtle group-hover:border-brand-primary/20 group-hover:bg-brand-primary/5 transition-colors">
              {task.assignee_id.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-text-dim uppercase font-black tracking-widest leading-none mb-1">Assignee</span>
              <span className="text-xs font-bold text-text-main leading-none">{assigneeLabel || `U-${task.assignee_id.slice(0, 4).toUpperCase()}`}</span>
            </div>
          </div>
        )}

        {formattedDate && (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] border transition-colors ${isOverdue ? 'bg-red-50 text-red-500 border-red-100' : 'bg-surface-muted text-text-dim border-border-subtle group-hover:border-brand-primary/20 group-hover:bg-brand-primary/5'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-text-dim uppercase font-black tracking-widest leading-none mb-1">Due Date</span>
              <span className={`text-xs font-bold leading-none ${isOverdue ? 'text-red-600' : 'text-text-main'}`}>
                {formattedDate}
                {isOverdue && <span className="ml-2 text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter shadow-sm whitespace-nowrap">Overdue</span>}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
