import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus, ExternalLink, Settings, FileText } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let spaces: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_published: boolean;
    updated_at: string;
    page_count: number;
  }> = [];

  if (user) {
    const { data } = await supabase
      .from('bb_spaces')
      .select('id, name, slug, description, is_published, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (data) {
      const spacesWithCounts = await Promise.all(
        data.map(async (space) => {
          const { count } = await supabase
            .from('bb_pages')
            .select('*', { count: 'exact', head: true })
            .eq('space_id', space.id);
          return { ...space, page_count: count ?? 0 };
        })
      );
      spaces = spacesWithCounts;
    }
  }

  if (spaces.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">My Spaces</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No spaces yet</h2>
          <p className="text-zinc-400 mb-8 max-w-md">
            Create your first docs site to get started. It only takes a minute.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Create your first docs site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">My Spaces</h1>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          New Space
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces.map((space) => (
          <div
            key={space.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-semibold truncate">{space.name}</h3>
                <p className="text-sm text-zinc-500 truncate">{space.slug}.blinkbook.goblink.io</p>
              </div>
              <span
                className={`shrink-0 ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                  space.is_published
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-zinc-700/50 text-zinc-400 border border-zinc-600'
                }`}
              >
                {space.is_published ? 'Published' : 'Draft'}
              </span>
            </div>

            {space.description && (
              <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{space.description}</p>
            )}

            <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
              <span>{space.page_count} {space.page_count === 1 ? 'page' : 'pages'}</span>
              <span>Updated {new Date(space.updated_at).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
              <Link
                href={`/dashboard/${space.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition"
              >
                <FileText className="w-3.5 h-3.5" />
                Open
              </Link>
              <Link
                href={`/dashboard/${space.id}/settings`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </Link>
              {space.is_published && (
                <a
                  href={`https://${space.slug}.blinkbook.goblink.io`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-md transition ml-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Live
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
