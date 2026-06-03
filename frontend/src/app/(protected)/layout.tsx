import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Shared layout for all protected routes.
 * Ensures the user is authenticated before rendering protected content.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <>{children}</>;
}
