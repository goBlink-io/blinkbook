'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import {
  Type, Heading1, Heading2, Heading3, Heading4, Code2, Info,
  Image as ImageIcon, Table as TableIcon, Minus, Quote, List, ListOrdered,
} from 'lucide-react';

interface SlashItem {
  title: string;
  description: string;
  icon: typeof Type;
  command: (editor: Editor) => void;
}

const slashItems: SlashItem[] = [
  {
    title: 'Paragraph',
    description: 'Plain text block',
    icon: Type,
    command: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    title: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: 'Heading 4',
    description: 'Subsection heading',
    icon: Heading4,
    command: (editor) => editor.chain().focus().toggleHeading({ level: 4 }).run(),
  },
  {
    title: 'Code Block',
    description: 'Add a code snippet with syntax highlighting',
    icon: Code2,
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: 'Callout',
    description: 'Highlight important information',
    icon: Info,
    command: (editor) => {
      editor.chain().focus().wrapIn('callout', { type: 'info' }).run();
    },
  },
  {
    title: 'Image',
    description: 'Embed an image from URL',
    icon: ImageIcon,
    command: (editor) => {
      const url = window.prompt('Image URL');
      if (url) editor.chain().focus().setImage({ src: url }).run();
    },
  },
  {
    title: 'Table',
    description: 'Insert a table with rows and columns',
    icon: TableIcon,
    command: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    title: 'Horizontal Rule',
    description: 'Visual divider between sections',
    icon: Minus,
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: 'Blockquote',
    description: 'Capture a quotation',
    icon: Quote,
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: 'Bullet List',
    description: 'Create an unordered list',
    icon: List,
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Ordered List',
    description: 'Create a numbered list',
    icon: ListOrdered,
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
];

interface SlashCommandProps {
  editor: Editor;
  position: { top: number; left: number };
  query: string;
  onClose: () => void;
  onSelect: (range: { from: number; to: number }) => void;
  range: { from: number; to: number };
}

export function SlashCommandMenu({ editor, position, query, onClose, onSelect, range }: SlashCommandProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = slashItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback((index: number) => {
    const item = filtered[index];
    if (!item) return;
    editor.chain().focus().deleteRange(range).run();
    item.command(editor);
    onClose();
  }, [editor, filtered, range, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(selectedIndex);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filtered.length, handleSelect, onClose]);

  useEffect(() => {
    const selected = menuRef.current?.querySelector('[data-selected="true"]');
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (filtered.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 max-h-80 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl py-1"
      style={{ top: position.top, left: position.left }}
    >
      {filtered.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={item.title}
            type="button"
            data-selected={index === selectedIndex}
            onClick={() => handleSelect(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`flex items-center gap-3 w-full px-3 py-2 text-left transition ${
              index === selectedIndex ? 'bg-zinc-700 text-white' : 'text-zinc-300 hover:bg-zinc-700/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              index === selectedIndex ? 'bg-zinc-600' : 'bg-zinc-700/50'
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-zinc-500 truncate">{item.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
