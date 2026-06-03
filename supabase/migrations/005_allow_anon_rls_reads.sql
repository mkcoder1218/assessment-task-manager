-- Let unauthenticated API requests reach SELECT policies without table-level
-- permission errors. RLS still denies rows because auth.uid() is null.

GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT ON workspaces TO anon;
GRANT SELECT ON workspace_members TO anon;
GRANT SELECT ON projects TO anon;
GRANT SELECT ON tasks TO anon;

GRANT EXECUTE ON FUNCTION get_user_workspace_ids() TO anon;
GRANT EXECUTE ON FUNCTION is_workspace_owner(UUID) TO anon;
