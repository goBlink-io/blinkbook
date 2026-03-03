'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BlockEditor } from '@/components/editor/block-editor';
import { EditorToolbar } from '@/components/editor/editor-toolbar';
import { ChevronDown, Search } from 'lucide-react';
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

  // SEO fields
  const [seoOpen, setSeoOpen] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState<string | null>(null);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [noindex, setNoindex] = useState(false);
  const seoTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const slugTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

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
      setSlug(pageData.slug);
      setMetaTitle(pageData.meta_title ?? '');
      setMetaDescription(pageData.meta_description ?? '');
      setNoindex(pageData.noindex ?? false);
      setLoading(false);
    }

    load();
  }, [siteId, pageId, router]);

  // Auto-save with debounce
  const save = useCallback(async (data: { title?: string; slug?: string; content?: TiptapDoc; is_published?: boolean; meta_title?: string | null; meta_description?: string | null; noindex?: boolean }) => {
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

  const debouncedSeoSave = useCallback((updates: { meta_title?: string | null; meta_description?: string | null; noindex?: boolean }) => {
    setSaveStatus('unsaved');
    if (seoTimerRef.current) clearTimeout(seoTimerRef.current);
    seoTimerRef.current = setTimeout(() => {
      save(updates);
    }, 1000);
  }, [save]);

  const handleMetaTitleChange = useCallback((value: string) => {
    setMetaTitle(value);
    debouncedSeoSave({ meta_title: value.trim() || null });
  }, [debouncedSeoSave]);

  const handleMetaDescriptionChange = useCallback((value: string) => {
    setMetaDescription(value);
    debouncedSeoSave({ meta_description: value.trim() || null });
  }, [debouncedSeoSave]);

  const handleNoindexToggle = useCallback(() => {
    const newValue = !noindex;
    setNoindex(newValue);
    save({ noindex: newValue });
  }, [noindex, save]);

  const handleSlugChange = useCallback((value: string) => {
    // Sanitize: lowercase, only a-z0-9 and hyphens, no leading/trailing hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+/, '');
    setSlug(sanitized);
    setSlugError(null);
    if (slugTimerRef.current) clearTimeout(slugTimerRef.current);
    if (!sanitized || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(sanitized)) {
      if (sanitized) setSlugError('Slug must start and end with a letter or number');
      return;
    }
    setSaveStatus('unsaved');
    slugTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/spaces/${siteId}/pages/${pageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: sanitized }),
        });
        if (res.ok) {
          const updated = await res.json();
          setPage(updated);
          setSaveStatus('saved');
          setSlugError(null);
        } else {
          const err = await res.json();
          setSaveStatus('unsaved');
          setSlugError(err.error === 'A page with this slug already exists in this space' ? 'Slug already taken' : err.error);
        }
      } catch {
        setSaveStatus('unsaved');
        setSlugError('Failed to save');
      }
    }, 1000);
  }, [siteId, pageId]);

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
        pageSlug={slug}
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

        {/* Collapsible SEO Panel */}
        <div className="border-t border-zinc-800">
          <button
            onClick={() => setSeoOpen((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              SEO Settings
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
          </button>
          {seoOpen && (
            <div className="px-6 pb-6 space-y-5">
              <div className="max-w-xl">
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">URL Slug</label>
                <div className="flex items-center gap-0">
                  <span className="px-3 py-2 bg-zinc-900 border border-r-0 border-zinc-700 rounded-l-lg text-xs text-zinc-500 select-none whitespace-nowrap">
                    {space.custom_domain ? `https://${space.custom_domain}/` : `${space.slug}.blinkbook.goblink.io/`}
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className={`flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-r-lg text-white text-sm font-mono focus:outline-none focus:ring-2 transition ${
                      slugError ? 'focus:ring-red-500 border-red-500/50' : 'focus:ring-blue-500'
                    }`}
                    placeholder={page.slug}
                  />
                </div>
                {slugError && (
                  <p className="text-xs text-red-400 mt-1">{slugError}</p>
                )}
                <p className="text-xs text-zinc-600 mt-1">Changing the slug will break existing links to this page.</p>
              </div>
              <div className="max-w-xl">
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Meta Title</label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => handleMetaTitleChange(e.target.value)}
                  placeholder={page.title}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div className="max-w-xl">
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => handleMetaDescriptionChange(e.target.value)}
                  rows={2}
                  placeholder="A short description for search engines…"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
                <div className="flex justify-end mt-1">
                  <span
                    className={`text-xs ${
                      metaDescription.length >= 150 && metaDescription.length <= 160
                        ? 'text-green-400'
                        : metaDescription.length > 160
                          ? 'text-amber-400'
                          : 'text-zinc-500'
                    }`}
                  >
                    {metaDescription.length}/160
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between max-w-xl bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">Hide from search engines</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Add <code className="text-zinc-400 bg-zinc-800 px-1 py-0.5 rounded text-xs">noindex</code> to prevent search engines from indexing this page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleNoindexToggle}
                  className={`relative inline-flex w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${
                    noindex ? 'bg-blue-600' : 'bg-zinc-700'
                  }`}
                  role="switch"
                  aria-checked={noindex}
                >
                  <span
                    className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform mt-1 ${
                      noindex ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
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
