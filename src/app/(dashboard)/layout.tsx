import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { KeyboardShortcutsProvider } from '@/components/dashboard/keyboard-shortcuts-provider';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('bb_users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <DashboardSidebar
        user={{
          email: user.email ?? '',
          name: profile?.name ?? user.email?.split('@')[0] ?? '',
          avatar_url: profile?.avatar_url ?? null,
        }}
      />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
          <KeyboardShortcutsProvider>
            {children}
          </KeyboardShortcutsProvider>
        </div>
      </main>
    </div>
  );
}
