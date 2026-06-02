# Workspace Task Manager

A modular, fullstack task management application with multi-tenant isolation.

## Tech Stack
- Next.js (App Router)
- Supabase (Postgres, Auth, Realtime, Edge Functions)
- Tailwind CSS
- TypeScript

## Getting Started

### Prerequisites
- Node.js
- Docker (for local Supabase development)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Configure environment variables in `frontend/.env.local`:
   ```text
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### Database & Security
The project uses Row Level Security (RLS) to enforce multi-tenancy.
Policies are defined in `backend/supabase/migrations/001_initial_schema.sql`.

#### RLS Verification
See `frontend/src/app/api/test-rls/route.ts` for automated security test scenarios.

### Deployment
#### Edge Functions
To deploy the overdue tasks edge function:
```bash
cd backend
npx supabase functions deploy overdue-tasks
```

## Dashboard Features
- Workspace switching
- Project summaries with task counts
- Realtime task synchronization
- Optimistic status updates with automatic rollback
- Overdue task analysis via Edge Functions

## Development
To start the local dev server:
```bash
cd frontend
npm run dev
```