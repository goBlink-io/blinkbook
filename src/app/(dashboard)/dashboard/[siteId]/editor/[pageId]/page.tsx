'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BlockEditor } from '@/components/editor/block-editor';
import { EditorToolbar } from '@/components/editor/editor-toolbar';
import type { TiptapDoc, BBPage, BBSpace } from '@/types/database';
import type { Editor } from '@tiptap/core';

type SaveStatus = 'saved' | 'saving' | 'unsaved';

export default function EditorPage() {
  const params = useParams<{ siteId: string; pageId: string }>();
  const router = useRouter();
  const { siteId, pageId } = params;

  const [page, setPage] = useState<BBPage | null>(null);
  const [space, setSpace] = useState<BBSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [title, setTitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [editorRef, setEditorRef] = useState<Editor | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const pendingContentRef = useRef<TiptapDoc | null>(null);

  // Fetch page and space data
  useEffect(() => {
    async function load() {
      const [pageRes, spaceRes] = await Promise.all([
        fetch(`/api/spaces/${siteId}/pages/${pageId}`),
        fetch(`/api/spaces/${siteId}`),
      ]);

      if (!pageRes.ok || !spaceRes.ok) {
        router.push(`/dashboard/${siteId}`);
        return;
      }

      const pageData: BBPage = await pageRes.json();
      const spaceData: BBSpace = await spaceRes.json();

      setPage(pageData);
      setSpace(spaceData);
      setTitle(pageData.title);
      setIsPublished(pageData.is_published);
      setLoading(false);
    }

    load();
  }, [siteId, pageId, router]);

  // Auto-save with debounce
  const save = useCallback(async (data: { title?: string; content?: TiptapDoc; is_published?: boolean }) => {
    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/spaces/${siteId}/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('unsaved');
      }
    } catch {
      setSaveStatus('unsaved');
    }
  }, [siteId, pageId]);

  const debouncedSave = useCallback((content: TiptapDoc) => {
    pendingContentRef.current = content;
    setSaveStatus('unsaved');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (pendingContentRef.current) {
        save({ content: pendingContentRef.current });
        pendingContentRef.current = null;
      }
    }, 1000);
  }, [save]);

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    setSaveStatus('unsaved');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      save({ title: newTitle, ...(pendingContentRef.current ? { content: pendingContentRef.current } : {}) });
      pendingContentRef.current = null;
    }, 1000);
  }, [save]);

  const handleTogglePublish = useCallback(() => {
    const newValue = !isPublished;
    setIsPublished(newValue);
    save({ is_published: newValue });
  }, [isPublished, save]);

  if (loading || !page || !space) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar
        siteId={siteId}
        spaceName={space.name}
        pageTitle={title}
        onTitleChange={handleTitleChange}
        saveStatus={saveStatus}
        isPublished={isPublished}
        onTogglePublish={handleTogglePublish}
        editor={editorRef}
        pageSlug={page.slug}
        spaceSlug={space.slug}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-8 px-6">
          <BlockEditorWrapper
            initialContent={page.content}
            onUpdate={debouncedSave}
            onEditorReady={setEditorRef}
          />
        </div>
      </div>
    </div>
  );
}

function BlockEditorWrapper({
  initialContent,
  onUpdate,
  onEditorReady,
}: {
  initialContent: TiptapDoc;
  onUpdate: (content: TiptapDoc) => void;
  onEditorReady: (editor: Editor) => void;
}) {
  return <BlockEditor initialContent={initialContent} onUpdate={onUpdate} />;
}
