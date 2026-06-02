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
-- 4. RLS POLICIES
-- ==========================================

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- WORKSPACES POLICIES
-- ------------------------------------------

-- SELECT: Users can view workspaces they are members of
CREATE POLICY "Users can view workspaces they belong to" 
ON workspaces FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_members.workspace_id = id 
        AND workspace_members.user_id = auth.uid()
    )
);

-- INSERT: Authenticated users can create workspaces
CREATE POLICY "Authenticated users can create workspaces" 
ON workspaces FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Only owners can update workspace details
CREATE POLICY "Owners can update their workspaces" 
ON workspaces FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_members.workspace_id = id 
        AND workspace_members.user_id = auth.uid() 
        AND workspace_members.role = 'owner'
    )
);

-- DELETE: Only owners can delete workspaces
CREATE POLICY "Owners can delete their workspaces" 
ON workspaces FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_members.workspace_id = id 
        AND workspace_members.user_id = auth.uid() 
        AND workspace_members.role = 'owner'
    )
);

-- ------------------------------------------
-- WORKSPACE_MEMBERS POLICIES
-- ------------------------------------------

-- SELECT: Users can view members of workspaces they are part of
CREATE POLICY "Users can view members of their workspaces" 
ON workspace_members FOR SELECT 
USING (
    workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm 
        WHERE wm.user_id = auth.uid()
    )
);

-- INSERT: Only owners can add members
CREATE POLICY "Owners can add members" 
ON workspace_members FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_members.workspace_id = workspace_id 
        AND workspace_members.user_id = auth.uid() 
        AND workspace_members.role = 'owner'
    )
);

-- UPDATE: Only owners can change roles
CREATE POLICY "Owners can update member roles" 
ON workspace_members FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_members.workspace_id = workspace_id 
        AND workspace_members.user_id = auth.uid() 
        AND workspace_members.role = 'owner'
    )
);

-- DELETE: Owners can remove members, members can leave (delete themselves)
CREATE POLICY "Owners can remove members or users can leave" 
ON workspace_members FOR DELETE 
USING (
    (auth.uid() = user_id) OR 
    EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_members.workspace_id = workspace_id 
        AND workspace_members.user_id = auth.uid() 
        AND workspace_members.role = 'owner'
    )
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
        WHERE workspace_members.workspace_id = workspace_id 
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
        WHERE p.id = project_id 
        AND wm.user_id = auth.uid()
    )
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
-- 5. SEED DATA (INSTRUCTIONS)
-- ==========================================

/*
  NOTE: Replace '00000000-0000-0000-0000-000000000000' with real user IDs from auth.users.
  Seed script for local development.
*/

-- 1. Workspaces
-- INSERT INTO workspaces (id, name) VALUES 
-- ('w1-uuid...', 'Engineering'), 
-- ('w2-uuid...', 'Marketing');

-- 2. Members
-- INSERT INTO workspace_members (workspace_id, user_id, role) VALUES 
-- ('w1-uuid...', 'user1-uuid...', 'owner'),
-- ('w1-uuid...', 'user2-uuid...', 'member'),
-- ('w2-uuid...', 'user1-uuid...', 'owner');

-- 3. Projects
-- INSERT INTO projects (id, workspace_id, name) VALUES 
-- ('p1...', 'w1...', 'Backend API'),
-- ('p2...', 'w1...', 'Mobile App'),
-- ('p3...', 'w2...', 'Q4 Campaign'),
-- ('p4...', 'w2...', 'Brand Refresh');

-- 4. Tasks (15+)
-- INSERT INTO tasks (project_id, title, status, assignee_id) VALUES 
-- ('p1...', 'Setup database', 'done', 'user1...'),
-- ('p1...', 'Auth integration', 'in_progress', 'user2...'),
-- ('p1...', 'Dockerize app', 'todo', NULL),
-- ('p1...', 'API Docs', 'todo', 'user1...'),
-- ('p2...', 'React Native init', 'done', 'user2...'),
-- ('p2...', 'Login screen', 'in_progress', 'user2...'),
-- ('p2...', 'Push notifications', 'todo', NULL),
-- ('p2...', 'App store assets', 'todo', 'user1...'),
-- ('p3...', 'Copywriting', 'in_progress', 'user1...'),
-- ('p3...', 'Asset design', 'todo', 'user2...'),
-- ('p3...', 'Social media plan', 'todo', NULL),
-- ('p3...', 'Landing page', 'todo', 'user1...'),
-- ('p4...', 'Logo update', 'done', 'user1...'),
-- ('p4...', 'Color palette', 'done', 'user1...'),
-- ('p4...', 'Typography', 'in_progress', 'user2...'),
-- ('p4...', 'Brand guide', 'todo', NULL);
