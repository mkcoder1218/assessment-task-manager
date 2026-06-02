-- Enable Realtime for the tasks table
BEGIN;
  -- Add tasks to the publication for realtime
  ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
COMMIT;
