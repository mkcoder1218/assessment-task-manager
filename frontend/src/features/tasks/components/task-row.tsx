import { Task } from '../services/task-service';
import { TaskStatusSelect } from './task-status-select';

interface TaskRowProps {
  task: Task;
}

export function TaskRow({ task }: TaskRowProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  const formattedDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : null;

  return (
    <div className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="text-base font-bold text-slate-900 truncate">
            {task.title}
          </h4>
          <TaskStatusSelect taskId={task.id} currentStatus={task.status} />
        </div>
        {task.description && (
          <p className="text-sm text-slate-500 truncate max-w-xl">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-8 shrink-0">
        {task.assignee_id && (
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Assignee</span>
            <span className="text-xs font-semibold text-slate-700">User {task.assignee_id.slice(0, 4)}</span>
          </div>
        )}

        {formattedDate && (
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Due Date</span>
            <span className={`text-xs font-semibold ${isOverdue ? 'text-red-500' : 'text-slate-700'}`}>
              {formattedDate}
              {isOverdue && <span className="ml-1 text-[10px] bg-red-100 px-1 rounded uppercase">Overdue</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
