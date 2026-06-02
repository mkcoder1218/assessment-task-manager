import { Database } from '@/lib/supabase/database.types';

type TaskStatus = Database['public']['Enums']['task_status'];

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const styles = {
    todo: 'bg-surface-muted text-text-dim border-border-subtle',
    in_progress: 'bg-blue-50 text-blue-600 border-blue-100',
    done: 'bg-green-50 text-green-600 border-green-100',
  };

  const labels = {
    todo: 'TO DO',
    in_progress: 'IN PROGRESS',
    done: 'DONE',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest border-2 ${styles[status]}`}>
      <span className={`w-1 h-1 rounded-full mr-1.5 ${status === 'todo' ? 'bg-text-dim' : status === 'in_progress' ? 'bg-blue-600' : 'bg-green-600'}`}></span>
      {labels[status]}
    </span>
  );
}
