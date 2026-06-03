'use client';

import { useState } from 'react';
import { WorkspaceMember } from '../services/workspace-service';
import { addWorkspaceMember, removeWorkspaceMember } from '../actions/member-actions';

interface WorkspaceMembersPanelProps {
  workspaceId: string;
  members: WorkspaceMember[];
  canManageMembers: boolean;
}

export function WorkspaceMembersPanel({
  workspaceId,
  members,
  canManageMembers,
}: WorkspaceMembersPanelProps) {
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [pendingAdd, setPendingAdd] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);

  const ownerCount = members.filter((member) => member.role === 'owner').length;

  async function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddError(null);
    setAddSuccess(null);
    setPendingAdd(true);

    const form = event.currentTarget;
    const result = await addWorkspaceMember(new FormData(form));

    if (result?.error) {
      setAddError(result.error);
    } else {
      setAddSuccess(result?.success || 'Member added.');
      form.reset();
    }

    setPendingAdd(false);
  }

  async function handleRemove(member: WorkspaceMember) {
    setRemoveError(null);
    setPendingRemoveId(member.user_id);

    const formData = new FormData();
    formData.set('workspaceId', workspaceId);
    formData.set('userId', member.user_id);

    const result = await removeWorkspaceMember(formData);

    if (result?.error) {
      setRemoveError(result.error);
    }

    setPendingRemoveId(null);
  }

  return (
    <section className="rounded-xl border border-border-subtle bg-surface-base p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-black tracking-tight text-text-main">Members</h3>
          <p className="text-sm text-text-dim">Access to this workspace, its projects, and its tasks.</p>
        </div>
        <span className="text-xs font-bold text-text-dim">{members.length} total</span>
      </div>

      {canManageMembers && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="workspaceId" value={workspaceId} />
          <div className="min-w-0 flex-1">
            <label htmlFor="member-email" className="sr-only">Registered user email</label>
            <input
              id="member-email"
              name="email"
              type="email"
              required
              placeholder="registered-user@example.com"
              className="h-11 w-full rounded-lg border border-border-subtle bg-surface-base px-3 text-sm font-medium text-text-main outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10"
            />
            {addError && <p className="mt-2 text-xs font-semibold text-red-600">{addError}</p>}
            {addSuccess && <p className="mt-2 text-xs font-semibold text-green-600">{addSuccess}</p>}
          </div>
          <button
            type="submit"
            disabled={pendingAdd}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-brand-primary px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pendingAdd ? 'Adding' : 'Add member'}
          </button>
        </form>
      )}

      {removeError && <p className="mb-3 text-xs font-semibold text-red-600">{removeError}</p>}

      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-subtle bg-surface-muted p-6 text-center text-sm text-text-dim">
          No members are visible for this workspace.
        </div>
      ) : (
        <ul className="divide-y divide-border-subtle overflow-hidden rounded-lg border border-border-subtle">
          {members.map((member) => {
            const isLastOwner = member.role === 'owner' && ownerCount <= 1;
            const canRemove = canManageMembers && !isLastOwner;

            return (
              <li key={member.user_id} className="flex flex-col gap-3 bg-surface-base p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-text-main">
                    User {member.user_id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-text-dim">{member.user_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 items-center rounded-lg border border-brand-primary/20 bg-brand-primary/10 px-3 text-xs font-bold uppercase text-brand-primary">
                    {member.role}
                  </span>
                  {canManageMembers && (
                    <button
                      type="button"
                      onClick={() => handleRemove(member)}
                      disabled={!canRemove || pendingRemoveId === member.user_id}
                      title={isLastOwner ? 'Cannot remove the last owner' : 'Remove member'}
                      className="h-8 rounded-lg border border-border-subtle px-3 text-xs font-bold text-text-dim transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {pendingRemoveId === member.user_id ? 'Removing' : 'Remove'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
