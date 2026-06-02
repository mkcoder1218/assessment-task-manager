# Workspace Task Manager

Modern fullstack task management application built with Next.js and Supabase.

## Project Structure

- `frontend/`: Next.js application
- `backend/`: Supabase configuration and migrations
- `schema.sql`: Database schema definition

## Development

### Generating Database Types

After linking your Supabase project, run:

```bash
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_REF \
  --schema public \
  > frontend/src/lib/supabase/database.types.ts
```