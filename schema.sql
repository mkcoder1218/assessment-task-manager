-- ==========================================
-- 1. ENUMS
-- ==========================================

CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE workspace_role AS ENUM ('owner', 'member');

-- ==========================================
-- 2. TABLES
-- ==========================================

-- WORKSPACES
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- WORKSPACE MEMBERS
CREATE TABLE workspace_members (
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role workspace_role NOT NULL DEFAULT 'member',
    PRIMARY KEY (workspace_id, user_id)
);

-- PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TASKS
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 3. INDEXES
-- ==========================================

CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- ==========================================
-- 4. FUNCTIONS (RLS Helpers)
-- ==========================================

-- Break recursion in RLS policies by using plpgsql to avoid inlining 
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

CREATE OR REPLACE FUNCTION add_workspace_member_by_email(target_workspace_id UUID, member_email TEXT)
RETURNS workspace_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_user_id UUID;
  inserted_member workspace_members;
BEGIN
  IF NOT is_workspace_owner(target_workspace_id) THEN
    RAISE EXCEPTION 'Only workspace owners can add members';
  END IF;

  IF length(trim(member_email)) = 0 THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  SELECT u.id
  INTO target_user_id
  FROM auth.users u
  WHERE lower(u.email) = lower(trim(member_email))
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No registered user found for that email';
  END IF;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (target_workspace_id, target_user_id, 'member')
  RETURNING * INTO inserted_member;

  RETURN inserted_member;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'User is already a member of this workspace';
END;
$$;

CREATE OR REPLACE FUNCTION remove_workspace_member(target_workspace_id UUID, target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_role workspace_role;
  owner_count INTEGER;
BEGIN
  IF NOT is_workspace_owner(target_workspace_id) THEN
    RAISE EXCEPTION 'Only workspace owners can remove members';
  END IF;

  SELECT role
  INTO target_role
  FROM workspace_members
  WHERE workspace_id = target_workspace_id
    AND user_id = target_user_id;

  IF target_role IS NULL THEN
    RAISE EXCEPTION 'User is not a member of this workspace';
  END IF;

  IF target_role = 'owner' THEN
    SELECT count(*)
    INTO owner_count
    FROM workspace_members
    WHERE workspace_id = target_workspace_id
      AND role = 'owner';

    IF owner_count <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last workspace owner';
    END IF;
  END IF;

  DELETE FROM workspace_members
  WHERE workspace_id = target_workspace_id
    AND user_id = target_user_id;
END;
$$;

-- ==========================================
-- 5. RLS POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Allow Supabase API roles to access tables; RLS policies below control rows.
GRANT SELECT, INSERT, UPDATE, DELETE ON workspaces TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON workspace_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_workspace_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION is_workspace_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_assign_task_to_project(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_workspace_member_by_email(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_workspace_member(UUID, UUID) TO authenticated;

-- ------------------------------------------
-- WORKSPACES POLICIES
-- ------------------------------------------

-- SELECT: Users can view workspaces they are members of
CREATE POLICY "Users can view workspaces they belong to" 
ON workspaces FOR SELECT 
USING (
    id IN (SELECT get_user_workspace_ids())
);

-- INSERT: Authenticated users can create workspaces
CREATE POLICY "Authenticated users can create workspaces" 
ON workspaces FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Only owners can update workspace details
CREATE POLICY "Owners can update their workspaces" 
ON workspaces FOR UPDATE 
USING (
    is_workspace_owner(id)
);

-- DELETE: Only owners can delete workspaces
CREATE POLICY "Owners can delete their workspaces" 
ON workspaces FOR DELETE 
USING (
    is_workspace_owner(id)
);

-- ------------------------------------------
-- WORKSPACE_MEMBERS POLICIES
-- ------------------------------------------

-- SELECT: Users can view members of workspaces they are part of
CREATE POLICY "Users can view members of their workspaces" 
ON workspace_members FOR SELECT 
USING (
    user_id = auth.uid() OR workspace_id IN (SELECT get_user_workspace_ids())
);

-- INSERT: Only owners can add members
CREATE POLICY "Owners can add members" 
ON workspace_members FOR INSERT 
WITH CHECK (
    is_workspace_owner(workspace_id)
);

-- UPDATE: Only owners can change roles
CREATE POLICY "Owners can update member roles" 
ON workspace_members FOR UPDATE 
USING (
    is_workspace_owner(workspace_id)
);

-- DELETE: Owners can remove members, members can leave (delete themselves)
CREATE POLICY "Owners can remove members or users can leave" 
ON workspace_members FOR DELETE 
USING (
    (auth.uid() = user_id) OR is_workspace_owner(workspace_id)
);

-- ------------------------------------------
-- PROJECTS POLICIES
-- ------------------------------------------

-- SELECT: Users can view projects in their workspaces
CREATE POLICY "Users can view projects in their workspaces" 
ON projects FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_members.workspace_id = projects.workspace_id 
        AND workspace_members.user_id = auth.uid()
    )
);

-- INSERT: Members can create projects
CREATE POLICY "Workspace members can create projects" 
ON projects FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_members.workspace_id = projects.workspace_id 
        AND workspace_members.user_id = auth.uid()
    )
);

-- UPDATE: Members can update projects
CREATE POLICY "Workspace members can update projects" 
ON projects FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_members.workspace_id = projects.workspace_id 
        AND workspace_members.user_id = auth.uid()
    )
);

-- DELETE: Only workspace owners can delete projects
CREATE POLICY "Owners can delete projects" 
ON projects FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_members.workspace_id = projects.workspace_id 
        AND workspace_members.user_id = auth.uid() 
        AND workspace_members.role = 'owner'
    )
);

-- ------------------------------------------
-- TASKS POLICIES
-- ------------------------------------------

-- SELECT: Users can view tasks in projects belonging to their workspaces
CREATE POLICY "Users can view tasks in their workspaces" 
ON tasks FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM projects p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = tasks.project_id 
        AND wm.user_id = auth.uid()
    )
);

-- INSERT: Members can create tasks
CREATE POLICY "Workspace members can create tasks" 
ON tasks FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = tasks.project_id 
        AND wm.user_id = auth.uid()
    )
    AND can_assign_task_to_project(tasks.project_id, tasks.assignee_id)
);

-- UPDATE: Members can update tasks
CREATE POLICY "Workspace members can update tasks" 
ON tasks FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM projects p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = tasks.project_id 
        AND wm.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = tasks.project_id
        AND wm.user_id = auth.uid()
    )
    AND can_assign_task_to_project(tasks.project_id, tasks.assignee_id)
);

-- DELETE: Members can delete tasks
CREATE POLICY "Workspace members can delete tasks" 
ON tasks FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM projects p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = tasks.project_id 
        AND wm.user_id = auth.uid()
    )
);

-- ==========================================
-- 6. SEED DATA
-- ==========================================

DO $$
DECLARE
  seed_user_one UUID;
  seed_user_two UUID;
BEGIN
  SELECT id INTO seed_user_one
  FROM auth.users
  ORDER BY created_at
  LIMIT 1;

  SELECT id INTO seed_user_two
  FROM auth.users
  WHERE id <> seed_user_one
  ORDER BY created_at
  LIMIT 1;

  IF seed_user_one IS NULL THEN
    RAISE NOTICE 'Seed data skipped: create at least one Supabase Auth user, then rerun this script.';
    RETURN;
  END IF;

  seed_user_two := COALESCE(seed_user_two, seed_user_one);

  INSERT INTO workspaces (id, name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Engineering'),
    ('22222222-2222-2222-2222-222222222222', 'Marketing')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  INSERT INTO workspace_members (workspace_id, user_id, role) VALUES
    ('11111111-1111-1111-1111-111111111111', seed_user_one, 'owner'),
    ('11111111-1111-1111-1111-111111111111', seed_user_two, 'member'),
    ('22222222-2222-2222-2222-222222222222', seed_user_one, 'owner'),
    ('22222222-2222-2222-2222-222222222222', seed_user_two, 'member')
  ON CONFLICT (workspace_id, user_id) DO UPDATE SET role = EXCLUDED.role;

  INSERT INTO projects (id, workspace_id, name) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Backend API'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Mobile App'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Q4 Campaign'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Brand Refresh')
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

  INSERT INTO tasks (id, project_id, title, description, status, assignee_id, due_date) VALUES
    ('10000000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Set up database schema', 'Create tables, enums, indexes, and RLS helper functions.', 'done', seed_user_one, NOW() - INTERVAL '8 days'),
    ('10000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Wire Supabase auth', 'Connect SSR auth flow across protected pages.', 'in_progress', seed_user_two, NOW() + INTERVAL '2 days'),
    ('10000000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Document API rules', 'Write notes for project and task access boundaries.', 'todo', seed_user_one, NOW() + INTERVAL '5 days'),
    ('10000000-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Review RLS verification', 'Run direct API checks with two user accounts.', 'todo', NULL, NOW() - INTERVAL '1 day'),
    ('10000000-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Build project task list', 'Render status, assignee, and due date in a responsive list.', 'done', seed_user_two, NOW() - INTERVAL '4 days'),
    ('10000000-0000-0000-0000-000000000006', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Add inline task editing', 'Support title, description, status, assignee, and due date edits.', 'in_progress', seed_user_one, NOW() + INTERVAL '1 day'),
    ('10000000-0000-0000-0000-000000000007', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Polish mobile layout', 'Verify the task workflow at 375px width.', 'todo', seed_user_two, NOW() + INTERVAL '6 days'),
    ('10000000-0000-0000-0000-000000000008', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Tune realtime refresh', 'Confirm status changes sync across sessions.', 'todo', NULL, NOW() - INTERVAL '2 days'),
    ('10000000-0000-0000-0000-000000000009', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Draft campaign copy', 'Prepare launch copy for the first campaign pass.', 'in_progress', seed_user_one, NOW() + INTERVAL '3 days'),
    ('10000000-0000-0000-0000-000000000010', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Create social calendar', 'Plan launch posts by channel and owner.', 'todo', seed_user_two, NOW() + INTERVAL '9 days'),
    ('10000000-0000-0000-0000-000000000011', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Review campaign metrics', 'Define the dashboard metrics for launch week.', 'todo', NULL, NOW() - INTERVAL '3 days'),
    ('10000000-0000-0000-0000-000000000012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Publish landing page brief', 'Hand off content requirements for implementation.', 'done', seed_user_one, NOW() - INTERVAL '6 days'),
    ('10000000-0000-0000-0000-000000000013', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Refresh logo usage', 'Document updated clear-space and lockup guidance.', 'done', seed_user_one, NOW() - INTERVAL '10 days'),
    ('10000000-0000-0000-0000-000000000014', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Choose color palette', 'Narrow the palette to accessible UI-safe colors.', 'done', seed_user_two, NOW() - INTERVAL '7 days'),
    ('10000000-0000-0000-0000-000000000015', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Finalize typography scale', 'Pick heading and body styles for product screens.', 'in_progress', seed_user_one, NOW() + INTERVAL '4 days')
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    assignee_id = EXCLUDED.assignee_id,
    due_date = EXCLUDED.due_date;
END $$;
