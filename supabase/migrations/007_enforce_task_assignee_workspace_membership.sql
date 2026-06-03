-- Enforce the hierarchy:
-- project -> workspace -> members, and task assignees must be members of the
-- task project's workspace.

CREATE OR REPLACE FUNCTION can_assign_task_to_project(target_project_id UUID, target_assignee_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF target_assignee_id IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE p.id = target_project_id
      AND wm.user_id = target_assignee_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION can_assign_task_to_project(UUID, UUID) TO authenticated;

DROP POLICY IF EXISTS "Workspace members can create tasks" ON tasks;
CREATE POLICY "Workspace members can create tasks"
ON tasks FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM projects p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = tasks.project_id
        AND wm.user_id = auth.uid()
    )
    AND can_assign_task_to_project(tasks.project_id, tasks.assignee_id)
);

DROP POLICY IF EXISTS "Workspace members can update tasks" ON tasks;
CREATE POLICY "Workspace members can update tasks"
ON tasks FOR UPDATE
USING (
    EXISTS (
        SELECT 1
        FROM projects p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = tasks.project_id
        AND wm.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM projects p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = tasks.project_id
        AND wm.user_id = auth.uid()
    )
    AND can_assign_task_to_project(tasks.project_id, tasks.assignee_id)
);
