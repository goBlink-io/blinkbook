'use client';

import type { Editor } from '@tiptap/core';
import { Bold, Italic, Strikethrough, Code, Link2, Heading1, Heading2, Heading3, Heading4, Type } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';

interface FloatingToolbarProps {
  editor: Editor;
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showHeadingPicker, setShowHeadingPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateToolbar = () => {
      const { state, view } = editor;
      const { selection } = state;
      const { empty } = selection;

      if (empty || !editor.isFocused) {
        setVisible(false);
        setShowHeadingPicker(false);
        setShowLinkInput(false);
        return;
      }

      const { from, to } = selection;
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      const left = (start.left + end.left) / 2;
      const top = start.top - 8;

      setPosition({ top, left });
      setVisible(true);
    };

    editor.on('selectionUpdate', updateToolbar);
    editor.on('blur', () => { setVisible(false); setShowHeadingPicker(false); setShowLinkInput(false); });

    return () => {
      editor.off('selectionUpdate', updateToolbar);
    };
  }, [editor]);

  const currentHeading = editor.isActive('heading', { level: 1 })
    ? 'H1'
    : editor.isActive('heading', { level: 2 })
    ? 'H2'
    : editor.isActive('heading', { level: 3 })
    ? 'H3'
    : editor.isActive('heading', { level: 4 })
    ? 'H4'
    : 'P';

  const setLink = useCallback(() => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const headingOptions = [
    { label: 'P', icon: Type, action: () => editor.chain().focus().setParagraph().run() },
    { label: 'H1', icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 as const }).run() },
    { label: 'H2', icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 as const }).run() },
    { label: 'H3', icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 as const }).run() },
    { label: 'H4', icon: Heading4, action: () => editor.chain().focus().toggleHeading({ level: 4 as const }).run() },
  ];

  if (!visible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-0.5 bg-zinc-800 border border-zinc-700 rounded-lg p-1 shadow-xl -translate-x-1/2 -translate-y-full"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Heading picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setShowHeadingPicker(!showHeadingPicker); setShowLinkInput(false); }}
          className={`px-2 py-1 text-xs font-semibold rounded transition ${
            currentHeading !== 'P' ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          {currentHeading}
        </button>
        {showHeadingPicker && (
          <div className="absolute bottom-full left-0 mb-1 bg-zinc-800 border border-zinc-700 rounded-lg py-1 shadow-xl z-10">
            {headingOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => { opt.action(); setShowHeadingPicker(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-1 text-sm hover:bg-zinc-700 transition ${
                    currentHeading === opt.label ? 'text-blue-400' : 'text-zinc-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-zinc-700 mx-0.5" />

      <ToolbarButton
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </ToolbarButton>

      <ToolbarButton
        active={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
        title="Inline Code (Ctrl+E)"
      >
        <Code className="w-3.5 h-3.5" />
      </ToolbarButton>

      <div className="w-px h-5 bg-zinc-700 mx-0.5" />

      {/* Link */}
      <div className="relative">
        <ToolbarButton
          active={editor.isActive('link')}
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run();
            } else {
              setShowLinkInput(!showLinkInput);
              setShowHeadingPicker(false);
            }
          }}
          title="Link"
        >
          <Link2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        {showLinkInput && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-zinc-800 border border-zinc-700 rounded-lg p-2 shadow-xl z-10">
            <form
              onSubmit={(e) => { e.preventDefault(); setLink(); }}
              className="flex gap-1"
            >
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="w-48 px-2 py-1 text-xs bg-zinc-900 border border-zinc-700 rounded text-white placeholder:text-zinc-500 outline-none focus:border-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 transition"
              >
                Add
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition ${
        active ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}
