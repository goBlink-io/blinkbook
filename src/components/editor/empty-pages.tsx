import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';

interface EmptyPagesProps {
  siteId: string;
}

export function EmptyPages({ siteId }: EmptyPagesProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-xl bg-zinc-800 flex items-center justify-center">
          <FileText className="w-7 h-7 text-zinc-500" />
        </div>
      </div>

      <h2 className="text-lg font-bold text-white mb-2 tracking-tight">
        No pages yet
      </h2>

      <p className="text-zinc-400 text-sm mb-8">
        Create your first page to get started.
      </p>

      <Link
        href={`/dashboard/${siteId}/editor/new`}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
      >
        <Plus className="w-4 h-4" />
        Create Page
      </Link>
    </div>
  );
}
