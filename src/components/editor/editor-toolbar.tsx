'use client';

import Link from 'next/link';
import { ArrowLeft, Undo2, Redo2, Eye, EyeOff, ExternalLink, Check, Loader2, AlertCircle, Download } from 'lucide-react';
import { tiptapToMarkdown } from '@/lib/tiptap-to-markdown';
import type { TiptapDoc } from '@/types/database';
import type { Editor } from '@tiptap/core';

type SaveStatus = 'saved' | 'saving' | 'unsaved';

interface EditorToolbarProps {
  siteId: string;
  spaceName: string;
  pageTitle: string;
  onTitleChange: (title: string) => void;
  saveStatus: SaveStatus;
  isPublished: boolean;
  onTogglePublish: () => void;
  editor: Editor | null;
  pageSlug: string;
  spaceSlug: string;
}

export function EditorToolbar({
  siteId,
  spaceName,
  pageTitle,
  onTitleChange,
  saveStatus,
  isPublished,
  onTogglePublish,
  editor,
  pageSlug,
  spaceSlug,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center justify-between h-12 pl-12 lg:pl-4 pr-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={`/dashboard/${siteId}`}
          className="text-zinc-500 hover:text-white transition p-1 -ml-1"
          title="Back to space"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="flex items-center gap-1.5 text-sm min-w-0">
          <span className="text-zinc-500 shrink-0 hidden sm:inline">{spaceName}</span>
          <span className="text-zinc-600 shrink-0 hidden sm:inline">/</span>
          <input
            type="text"
            value={pageTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent text-white font-medium outline-none min-w-[100px] max-w-[300px] truncate"
            placeholder="Untitled"
          />
        </div>

        <SaveStatusBadge status={saveStatus} />
      </div>

      <div className="flex items-center gap-1.5">
        {editor && (
          <>
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 transition rounded"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-1.5 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 transition rounded"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </>
        )}

        <div className="w-px h-5 bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={onTogglePublish}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition ${
            isPublished
              ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20'
              : 'text-zinc-400 bg-zinc-800 hover:bg-zinc-700'
          }`}
        >
          {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {isPublished ? 'Published' : 'Draft'}
        </button>

        {isPublished && (
          <a
            href={`/sites/${spaceSlug}/${pageSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-zinc-500 hover:text-white transition rounded"
            title="Preview"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {editor && (
          <button
            type="button"
            onClick={() => {
              const json = editor.getJSON() as TiptapDoc;
              const markdown = tiptapToMarkdown(json);
              const blob = new Blob([markdown], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${pageSlug || 'page'}.md`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="p-1.5 text-zinc-500 hover:text-white transition rounded"
            title="Download as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function SaveStatusBadge({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saved':
      return (
        <span className="flex items-center gap-1 text-xs text-green-400/70">
          <Check className="w-3 h-3" />
          Saved
        </span>
      );
    case 'saving':
      return (
        <span className="flex items-center gap-1 text-xs text-zinc-500">
          <Loader2 className="w-3 h-3 animate-spin" />
          Saving...
        </span>
      );
    case 'unsaved':
      return (
        <span className="flex items-center gap-1 text-xs text-amber-400/70">
          <AlertCircle className="w-3 h-3" />
          Unsaved changes
        </span>
      );
  }
}
