-- Create a workspace and make the current authenticated user its owner.
-- This keeps first-workspace creation atomic while preserving owner-only
-- membership policies for all other member changes.

CREATE OR REPLACE FUNCTION create_workspace(workspace_name TEXT)
RETURNS workspaces
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace workspaces;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF length(trim(workspace_name)) = 0 THEN
    RAISE EXCEPTION 'Workspace name is required';
  END IF;

  INSERT INTO workspaces (name)
  VALUES (trim(workspace_name))
  RETURNING * INTO new_workspace;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace.id, auth.uid(), 'owner');

  RETURN new_workspace;
END;
$$;

GRANT EXECUTE ON FUNCTION create_workspace(TEXT) TO authenticated;
