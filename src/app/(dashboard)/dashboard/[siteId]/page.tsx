import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus, ExternalLink, Globe, FileText, Eye, EyeOff } from 'lucide-react';

export default async function SpaceOverviewPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const supabase = await createClient();

  const { data: space } = await supabase
    .from('bb_spaces')
    .select('*')
    .eq('id', siteId)
    .single();

  if (!space) {
    notFound();
  }

  const { data: pages } = await supabase
    .from('bb_pages')
    .select('id, title, slug, is_published, updated_at')
    .eq('space_id', siteId)
    .order('position', { ascending: true });

  const allPages = pages ?? [];
  const publishedCount = allPages.filter((p) => p.is_published).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{space.name}</h1>
          <p className="text-sm text-zinc-500 mt-1">{space.slug}.blinkbook.goblink.io</p>
        </div>
        <div className="flex items-center gap-3">
          {space.is_published && (
            <a
              href={`https://${space.slug}.blinkbook.goblink.io`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-600 rounded-lg transition"
            >
              <ExternalLink className="w-4 h-4" />
              View Live
            </a>
          )}
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition font-medium">
            <Globe className="w-4 h-4" />
            {space.is_published ? 'Republish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-500 mb-1">Total pages</p>
          <p className="text-2xl font-bold text-white">{allPages.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-500 mb-1">Published</p>
          <p className="text-2xl font-bold text-green-400">{publishedCount}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-500 mb-1">Drafts</p>
          <p className="text-2xl font-bold text-zinc-400">{allPages.length - publishedCount}</p>
        </div>
      </div>

      {/* Pages */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Pages</h2>
        <Link
          href={`/dashboard/${siteId}/editor/new`}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition"
        >
          <Plus className="w-3.5 h-3.5" />
          New Page
        </Link>
      </div>

      {allPages.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 mb-4">No pages yet. Create your first page to get started.</p>
          <Link
            href={`/dashboard/${siteId}/editor/new`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            New Page
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          {allPages.map((page) => (
            <div
              key={page.id}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-zinc-800/50 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{page.title}</p>
                  <p className="text-xs text-zinc-500">/{page.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-zinc-500">
                  {new Date(page.updated_at).toLocaleDateString()}
                </span>
                <span title={page.is_published ? 'Published' : 'Draft'}>
                  {page.is_published ? (
                    <Eye className="w-4 h-4 text-green-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-zinc-500" />
                  )}
                </span>
                <Link
                  href={`/dashboard/${siteId}/editor/${page.id}`}
                  className="text-sm text-blue-400 hover:text-blue-300 transition"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
