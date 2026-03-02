'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Loader2, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface InviteInfo {
  spaceName: string;
  role: string;
  email: string;
}

export default function AcceptInvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      const res = await fetch(`/api/invitations/${token}`);
      if (res.ok) {
        setInvite(await res.json());
      } else {
        setError('This invitation is invalid or has already been used.');
      }
      setLoading(false);
    };
    init();
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    const res = await fetch(`/api/invitations/${token}`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/${data.spaceId}`);
    } else {
      setError('Failed to accept invitation. Please try again.');
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid Invitation</h1>
          <p className="text-sm text-zinc-400 mb-6">{error}</p>
          <Link href="/dashboard" className="text-sm text-blue-400 hover:text-blue-300">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-6 h-6 text-white" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">You&apos;ve been invited</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Join <span className="text-white font-medium">{invite?.spaceName}</span> as a{' '}
          <span className="text-zinc-300 capitalize">{invite?.role}</span>
        </p>

        {isLoggedIn ? (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50"
          >
            {accepting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Users className="w-4 h-4" />
            )}
            {accepting ? 'Accepting...' : 'Accept Invitation'}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-500">Sign in or create an account to accept this invitation.</p>
            <Link
              href={`/login?next=/invitations/${token}`}
              className="block w-full py-2.5 px-4 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-500 text-white transition text-center"
            >
              Sign In
            </Link>
            <Link
              href={`/signup?next=/invitations/${token}`}
              className="block w-full py-2.5 px-4 rounded-lg font-medium text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition text-center"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
