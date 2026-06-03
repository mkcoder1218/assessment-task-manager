-- Ensure API roles can reach the tables before RLS policies filter rows.
-- Migration 003 was already applied remotely before these grants were added.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON workspaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;

GRANT EXECUTE ON FUNCTION get_user_workspace_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION is_workspace_owner(UUID) TO authenticated;
