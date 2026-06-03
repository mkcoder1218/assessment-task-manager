'use client';

import { signOut } from '@/features/auth/actions/auth-actions';

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
    >
      Sign Out
    </button>
  );
}
