import { AuthForm } from '@/features/auth/components/auth-form';
import { signUp } from '@/features/auth/actions/auth-actions';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function SignUpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
      <AuthForm type="sign-up" action={signUp} />
    </div>
  );
}
