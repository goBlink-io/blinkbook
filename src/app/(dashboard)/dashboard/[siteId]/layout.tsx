'use client';

import { useParams, usePathname } from 'next/navigation';
import { EditorSidebar } from '@/components/editor/editor-sidebar';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ siteId: string; pageId?: string }>();
  const pathname = usePathname();

  // Only show editor sidebar on editor and pages routes
  const isEditorRoute = pathname.includes('/editor/') || pathname.includes('/pages');
  const pageId = params.pageId;

  if (!isEditorRoute) {
    return <>{children}</>;
  }

  return (
    <div className="-mx-6 lg:-mx-8 -my-8 flex h-[calc(100vh-0px)]">
      <EditorSidebar activePageId={pageId} />
      <main className="flex-1 overflow-hidden flex flex-col">{children}</main>
    </div>
  );
}
