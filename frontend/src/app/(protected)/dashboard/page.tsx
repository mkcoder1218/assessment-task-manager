import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LogoutButton } from '@/features/auth/components/logout-button';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-slate-900">Task Manager</h1>
            <div className="flex items-center space-y-0 space-x-4">
              <span className="text-sm text-slate-600 hidden sm:inline">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Welcome to your Dashboard</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            You have successfully implemented Supabase SSR authentication. Your session is protected by a server-side check.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <span className="block text-blue-700 font-bold text-xl mb-1">SSR</span>
              <span className="text-sm text-blue-600">Secure session refreshing</span>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <span className="block text-green-700 font-bold text-xl mb-1">Actions</span>
              <span className="text-sm text-green-600">Type-safe Auth logic</span>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <span className="block text-purple-700 font-bold text-xl mb-1">RLS</span>
              <span className="text-sm text-purple-600">Database-level isolation</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
