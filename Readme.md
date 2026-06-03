# Workspace Task Manager

Multi-workspace task management app built with Next.js App Router, TypeScript, Supabase Auth/Postgres/Realtime/Edge Functions, and Tailwind CSS.

## Submission Details

- Exact start time: June 2, 2026, 14:23:38 EAT (UTC+03:00)
- Exact end time: June 2, 2026, 16:54:49 EAT (UTC+03:00)
- GitHub repository: add the public repository URL before sending the submission email
- Vercel deployment: add the live Vercel URL before sending the submission email

## Complete And Working

- Supabase Auth sign up, sign in, and sign out.
- Protected App Router dashboard and project routes using the Supabase SSR client pattern.
- Multi-tenant schema with `workspaces`, `workspace_members`, `projects`, and `tasks`.
- Row Level Security policies for `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on all required tables.
- Workspace dashboard with project summaries and task counts by status.
- Project task view with status and assignee filters stored in URL query params.
- Inline task detail editing for title, description, status, assignee, and due date with save/cancel affordances.
- Supabase Realtime task updates with channel cleanup on unmount.
- Optimistic task status updates with rollback and visible failure feedback.
- Overdue task Edge Function called from the UI, using the caller JWT so RLS still applies.
- Loading, empty, and error states for the main data-fetching views.
- Generated Supabase database types used for table rows and enums.

## Incomplete Or Known Tradeoffs

- Assignee display names are derived from user ids because the minimum assignment schema does not include a public profile table and `auth.users` is not readable from the client. With more time, I would add a `profiles` table populated on sign-up and return real names from the Edge Function.
- Seed data is runnable after at least one Supabase Auth user exists. The script assigns the first two Auth users it finds, falling back to one user if only one exists.
- Supabase is kept in the standard top-level `supabase` folder for migrations, config, and Edge Functions.

## Architectural Decisions

- Server Components load dashboard, workspace, project, and task data so the app does not rely on client-side `useEffect` data fetching.
- Client Components are used for interactive surfaces: auth forms, filters, realtime task lists, inline editing, and optimistic status controls.
- RLS is the source of authorization truth. UI checks improve ergonomics, but direct API access is constrained by database policies.
- Task assignment is validated in the database with a helper function so users cannot assign tasks to users outside the project workspace.

## Run Locally

```bash
npm install
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `frontend/.env.local` before starting the app.

## Database And Edge Function

- Root `schema.sql` contains the required schema, RLS policies, helper functions, and seed data.
- Supabase migrations live in `supabase/migrations`.
- The overdue task Edge Function is committed at `supabase/functions/overdue-tasks/index.ts`.

Deploy the Edge Function:

```bash
npx supabase functions deploy overdue-tasks
```

## Verification

```bash
cd frontend
npm run lint
npm run build
```

Both commands pass locally.
