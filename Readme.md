# Workspace Task Manager

Modern fullstack task management application built with Next.js and Supabase.

**Start time:** 2026-06-02 13:49:34 Africa/Addis_Ababa  
**End time:** [ADD BEFORE SUBMISSION] Africa/Addis_Ababa

## Project Overview

A collaborative workspace and project management tool. Users can manage multiple workspaces, organize projects within them, and track tasks with status updates and assignments.

## Architecture

### Modular Frontend
The application uses a feature-based structure in `frontend/src/features/` to ensure scalability and maintainability:
- **Auth**: Supabase authentication integration.
- **Workspaces**: Workspace management and membership.
- **Projects**: Project organization within workspaces.
- **Tasks**: Task CRUD and assignment.

### Secure Supabase Backend
- **Multi-tenancy**: Strict workspace isolation enforced via Row Level Security (RLS).
- **SSR Integration**: Uses `@supabase/ssr` for secure server-side session management.
- **Type Safety**: Database-driven TypeScript types via Supabase CLI.

## Schema Overview

- `workspaces`: High-level organizational units.
- `workspace_members`: Junction table for users and workspaces (roles: `owner`, `member`).
- `projects`: Grouped tasks within a workspace.
- `tasks`: Individual units of work (statuses: `todo`, `in_progress`, `done`).

## Security (RLS)

Strict RLS policies exist on every table for `SELECT`, `INSERT`, `UPDATE`, and `DELETE`. 
Access is gated through the `workspace_members` table, ensuring users can only interact with data in workspaces they belong to. Direct recursion is avoided using optimized `EXISTS` queries.

## Development Setup

### Local Setup (5 Steps)

1. **Clone & Install**: `npm install` in `frontend/`.
2. **Environment**: Copy `frontend/.env.example` to `frontend/.env.local` and add your Supabase credentials.
3. **Supabase CLI**: `npx supabase login` then `npx supabase link --project-ref YOUR_PROJECT_REF`.
4. **Database**: `npx supabase db push`.
5. **Types**: `npx supabase gen types typescript --project-id YOUR_PROJECT_REF > frontend/src/lib/supabase/database.types.ts`.

### Essential Commands

- **Link**: `npx supabase link --project-ref YOUR_PROJECT_REF`
- **Push Migration**: `npx supabase db push`
- **Gen Types**: `npx supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > frontend/src/lib/supabase/database.types.ts`
- **Lint**: `cd frontend && npm run lint`
- **Build**: `cd frontend && npm run build`

## Project Status

### Completed Features (Phase 1)
- [x] Project scaffolding (Next.js + Supabase).
- [x] Modular directory structure.
- [x] Database schema & initial migration.
- [x] Full RLS policy implementation.
- [x] Supabase SSR utility integration (Server/Browser/Middleware).
- [x] Type generation configuration.

### Incomplete Features
- [ ] Application screens and UI components (Phase 2).
- [ ] Real-time task updates.
- [ ] File attachments (Storage).

### Known Issues
- Database types are currently empty placeholders until the project is linked.

## Architectural Decisions

- **Feature-based Structure**: Organizing code by domain (features/) rather than type (components/pages) to prevent "folder bloating".
- **SSR-first Auth**: Using `@supabase/ssr` to prevent flashes of unauthenticated content and improve security.
- **Schema-first Development**: Defining the source of truth in `schema.sql` before building UI.

## RLS Verification Checklist

To verify security isolation, perform the following manual tests using User A and User B:

### Multi-Account Workspace Separation
1. [ ] Log in as **User A**. Verify you see only **Engineering** and **Marketing**.
2. [ ] Log in as **User B**. Verify you see only **Engineering**.
3. [ ] Attempt to access User B's private project URL (if any) as User A. Verify a 404 or empty state is returned.

### Cross-Workspace Operation Blockage
1. [ ] **Cross-read**: Verify User B cannot see tasks belonging to the **Marketing** workspace.
2. [ ] **Cross-insert**: Try to create a project in **Marketing** while logged in as User B. Verify the request is rejected by RLS.
3. [ ] **Cross-update**: Try to rename a project in **Marketing** while logged in as User B. Verify the operation fails.
4. [ ] **Cross-delete**: Try to delete a project in **Marketing** while logged in as User B. Verify the operation fails.