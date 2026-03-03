'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookOpen, LayoutGrid, User, CreditCard, LogOut, Users, Lock, Settings, BarChart3, FileText, GitBranch, LinkIcon, DollarSign } from 'lucide-react';

interface SidebarProps {
  user: {
    email: string;
    name: string;
    avatar_url: string | null;
  };
}

const navItems = [
  { href: '/dashboard', label: 'My Spaces', icon: LayoutGrid },
  { href: '/dashboard/account', label: 'Account', icon: User },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
];

export function DashboardSidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Extract siteId from pathname if on a space route
  const siteMatch = pathname.match(/^\/dashboard\/([a-f0-9-]{36})/);
  const siteId = siteMatch?.[1] ?? null;

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0">
      <div className="p-5 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">BlinkBook</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        {siteId && <SpaceNav siteId={siteId} pathname={pathname} />}
      </nav>

      <div className="p-3 border-t border-zinc-800 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-white shrink-0 overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-zinc-500 hover:text-white transition p-1"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function SpaceNav({ siteId, pathname }: { siteId: string; pathname: string }) {
  const [plan, setPlan] = useState<string>('free');

  useEffect(() => {
    fetch('/api/billing/subscription')
      .then((r) => r.json())
      .then((d) => setPlan(d.subscription?.plan ?? 'free'))
      .catch(() => {});
  }, []);

  const isTeamPlan = plan === 'team';

  const spaceLinks = [
    { href: `/dashboard/${siteId}`, label: 'Overview', icon: FileText },
    { href: `/dashboard/${siteId}/pages`, label: 'Pages', icon: FileText },
    { href: `/dashboard/${siteId}/analytics`, label: 'Analytics', icon: BarChart3 },
    { href: `/dashboard/${siteId}/versions`, label: 'Versions', icon: GitBranch },
    { href: `/dashboard/${siteId}/links`, label: 'Links', icon: LinkIcon },
    { href: `/dashboard/${siteId}/monetization`, label: 'Monetization', icon: DollarSign },
    { href: `/dashboard/${siteId}/settings`, label: 'Settings', icon: Settings },
    { href: `/dashboard/${siteId}/team`, label: 'Team', icon: isTeamPlan ? Users : Lock },
  ];

  return (
    <div className="mt-4 pt-4 border-t border-zinc-800">
      <p className="px-3 mb-1 text-xs font-medium text-zinc-600 uppercase tracking-wider">Space</p>
      {spaceLinks.map((item) => {
        const isActive =
          item.href === `/dashboard/${siteId}`
            ? pathname === `/dashboard/${siteId}`
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
              isActive
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
