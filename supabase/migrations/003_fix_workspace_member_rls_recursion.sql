-- Fix recursive workspace_members RLS checks by moving owner lookup into
-- a SECURITY DEFINER helper, which evaluates without re-entering the policy.

CREATE OR REPLACE FUNCTION get_user_workspace_ids()
RETURNS TABLE (workspace_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT wm.workspace_id
  FROM workspace_members wm
  WHERE wm.user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION is_workspace_owner(target_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = target_workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'owner'
  );
END;
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON workspaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_workspace_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION is_workspace_owner(UUID) TO authenticated;

DROP POLICY IF EXISTS "Users can view workspaces they belong to" ON workspaces;
CREATE POLICY "Users can view workspaces they belong to"
ON workspaces FOR SELECT
USING (
    id IN (SELECT get_user_workspace_ids())
);

DROP POLICY IF EXISTS "Owners can update their workspaces" ON workspaces;
CREATE POLICY "Owners can update their workspaces"
ON workspaces FOR UPDATE
USING (
    is_workspace_owner(id)
);

DROP POLICY IF EXISTS "Owners can delete their workspaces" ON workspaces;
CREATE POLICY "Owners can delete their workspaces"
ON workspaces FOR DELETE
USING (
    is_workspace_owner(id)
);

DROP POLICY IF EXISTS "Users can view members of their workspaces" ON workspace_members;
CREATE POLICY "Users can view members of their workspaces"
ON workspace_members FOR SELECT
USING (
    user_id = auth.uid() OR workspace_id IN (SELECT get_user_workspace_ids())
);

DROP POLICY IF EXISTS "Owners can add members" ON workspace_members;
CREATE POLICY "Owners can add members"
ON workspace_members FOR INSERT
WITH CHECK (
    is_workspace_owner(workspace_id)
);

DROP POLICY IF EXISTS "Owners can update member roles" ON workspace_members;
CREATE POLICY "Owners can update member roles"
ON workspace_members FOR UPDATE
USING (
    is_workspace_owner(workspace_id)
);

DROP POLICY IF EXISTS "Owners can remove members or users can leave" ON workspace_members;
CREATE POLICY "Owners can remove members or users can leave"
ON workspace_members FOR DELETE
USING (
    (auth.uid() = user_id) OR is_workspace_owner(workspace_id)
);

DROP POLICY IF EXISTS "Workspace members can create projects" ON projects;
CREATE POLICY "Workspace members can create projects"
ON projects FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = projects.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
);
