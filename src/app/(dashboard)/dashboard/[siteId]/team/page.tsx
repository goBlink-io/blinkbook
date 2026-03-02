'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, Plus, Trash2, Lock, Crown, Pencil, Eye } from 'lucide-react';
import { InviteModal } from '@/components/dashboard/invite-modal';
import type { BBTeamMember } from '@/types/database';

interface TeamMemberWithUser extends BBTeamMember {
  user?: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
}

const roleIcons = {
  admin: Crown,
  editor: Pencil,
  viewer: Eye,
};

const roleColors = {
  admin: 'bg-amber-500/10 text-amber-400',
  editor: 'bg-blue-500/10 text-blue-400',
  viewer: 'bg-zinc-500/10 text-zinc-400',
};

export default function TeamPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const router = useRouter();
  const [members, setMembers] = useState<TeamMemberWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [plan, setPlan] = useState<string>('free');

  const fetchMembers = useCallback(async () => {
    const res = await fetch(`/api/spaces/${siteId}/team`);
    if (res.ok) {
      const data = await res.json();
      setMembers(data);
    }
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    fetchMembers();
    fetch('/api/billing/subscription').then(r => r.json()).then(d => {
      setPlan(d.subscription?.plan ?? 'free');
    });
  }, [fetchMembers]);

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this team member?')) return;
    await fetch(`/api/spaces/${siteId}/team/${memberId}`, { method: 'DELETE' });
    fetchMembers();
  };

  const handleRoleChange = async (memberId: string, role: string) => {
    await fetch(`/api/spaces/${siteId}/team/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    fetchMembers();
  };

  const handleInvite = async () => {
    if (plan !== 'team') {
      router.push('/dashboard/billing');
      return;
    }
    setShowInvite(true);
  };

  const accepted = members.filter(m => m.status === 'accepted');
  const pending = members.filter(m => m.status === 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6" /> Team
          </h1>
          <p className="text-zinc-400 mt-1">Manage team members and roles for this space.</p>
        </div>
        <button
          onClick={handleInvite}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition"
        >
          {plan === 'team' ? (
            <Plus className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          Invite Member
        </button>
      </div>

      {plan !== 'team' && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm text-amber-400">
            Team members require the Team plan.{' '}
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="underline hover:text-amber-300"
            >
              Upgrade now
            </button>
          </p>
        </div>
      )}

      {/* Accepted Members */}
      {accepted.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Members ({accepted.length})</h2>
          <div className="space-y-2">
            {accepted.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Invitations */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Pending Invitations ({pending.length})</h2>
          <div className="space-y-2">
            {pending.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm text-zinc-400">
                    ?
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300">{member.email}</p>
                    <p className="text-xs text-zinc-500">Pending</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={member.role} />
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="text-zinc-500 hover:text-red-400 transition p-1"
                    title="Revoke invitation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {accepted.length === 0 && pending.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No team members yet.</p>
          {plan === 'team' && (
            <p className="text-zinc-500 text-xs mt-1">Invite your first collaborator to get started.</p>
          )}
        </div>
      )}

      {showInvite && (
        <InviteModal
          siteId={siteId}
          onClose={() => setShowInvite(false)}
          onInvited={() => {
            setShowInvite(false);
            fetchMembers();
          }}
        />
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const Icon = roleIcons[role as keyof typeof roleIcons] ?? Eye;
  const color = roleColors[role as keyof typeof roleColors] ?? roleColors.viewer;

  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="w-3 h-3" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function MemberRow({
  member,
  onRoleChange,
  onRemove,
}: {
  member: TeamMemberWithUser;
  onRoleChange: (id: string, role: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-white shrink-0 overflow-hidden">
          {member.user?.avatar_url ? (
            <img src={member.user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            (member.user?.name ?? member.email ?? '?').charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{member.user?.name ?? member.email}</p>
          <p className="text-xs text-zinc-500">{member.user?.email ?? member.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={member.role}
          onChange={(e) => onRoleChange(member.id, e.target.value)}
          className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
        <button
          onClick={() => onRemove(member.id)}
          className="text-zinc-500 hover:text-red-400 transition p-1"
          title="Remove member"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
