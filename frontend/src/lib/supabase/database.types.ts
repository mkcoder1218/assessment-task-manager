/**
 * Database type definitions.
 * 
 * NOTE: This file must be generated after linking your Supabase project.
 * Use the following command:
 * 
 * npx supabase gen types typescript \
 *   --project-id YOUR_PROJECT_REF \
 *   --schema public \
 *   > frontend/src/lib/supabase/database.types.ts
 */

export type Database = {
  public: {
    Tables: {
      [_ in string]: never;
    };
    Views: {
      [_ in string]: never;
    };
    Functions: {
      [_ in string]: never;
    };
    Enums: {
      [_ in string]: never;
    };
  };
};
