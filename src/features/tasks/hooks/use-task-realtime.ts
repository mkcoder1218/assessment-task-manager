'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Task } from '../services/task-service';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type RealtimeTask = Task;

/**
 * Custom hook to synchronize project tasks via Supabase Realtime Channels.
 * Returns the current live list of tasks and handles subscription cleanup.
 */
export function useTaskRealtime(projectId: string, initialTasks: Task[]): Task[] {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [prevInitialTasks, setPrevInitialTasks] = useState<Task[]>(initialTasks);
  const supabase = createClient();

  // Adjust state when initialTasks (from props) change
  if (initialTasks !== prevInitialTasks) {
    setTasks(initialTasks);
    setPrevInitialTasks(initialTasks);
  }

  useEffect(() => {
    const channel = supabase
      .channel(`project-tasks:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          setTasks((currentTasks: Task[]) => {
            const nextTasks = [...currentTasks];
            switch (payload.eventType) {
              case 'INSERT':
                if (nextTasks.some((t) => t.id === payload.new.id)) {
                  return nextTasks;
                }
                return [payload.new as Task, ...nextTasks];

              case 'UPDATE':
                return nextTasks.map((t) =>
                  t.id === payload.new.id ? { ...t, ...(payload.new as Task) } : t
                );

              case 'DELETE':
                return nextTasks.filter((t) => t.id !== (payload.old as Task).id);

              default:
                return nextTasks;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, initialTasks, supabase]);

  return tasks;
}
