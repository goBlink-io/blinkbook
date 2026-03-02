'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Link from '@tiptap/extension-link';
import { Callout } from './callout-extension';
import { EnhancedCodeBlock } from './code-block-extension';
import { FloatingToolbar } from './floating-toolbar';
import { SlashCommandMenu } from './slash-command';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TiptapDoc } from '@/types/database';

interface BlockEditorProps {
  initialContent: TiptapDoc;
  onUpdate: (content: TiptapDoc) => void;
}

export function BlockEditor({ initialContent, onUpdate }: BlockEditorProps) {
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 });
  const [slashQuery, setSlashQuery] = useState('');
  const [slashRange, setSlashRange] = useState({ from: 0, to: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We use our enhanced code block
        heading: { levels: [1, 2, 3, 4] },
      }),
      Placeholder.configure({
        placeholder: 'Type / for commands...',
      }),
      Image.configure({ inline: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-400 underline' },
      }),
      Callout,
      EnhancedCodeBlock,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[500px] px-1',
      },
    },
    onUpdate: ({ editor }) => {
      onUpdate(editor.getJSON() as TiptapDoc);
      detectSlashCommand(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      // Close slash menu on selection change that's not from typing
      if (slashOpen) {
        const { $head } = editor.state.selection;
        const textBefore = $head.parent.textContent.slice(0, $head.parentOffset);
        if (!textBefore.match(/\/[a-zA-Z0-9 ]*$/)) {
          setSlashOpen(false);
        }
      }
    },
  });

  const detectSlashCommand = useCallback((editorInstance: NonNullable<typeof editor>) => {
    const { state } = editorInstance;
    const { $head } = state.selection;
    const textBefore = $head.parent.textContent.slice(0, $head.parentOffset);
    const match = textBefore.match(/\/([a-zA-Z0-9 ]*)$/);

    if (match) {
      const query = match[1];
      const from = $head.start() + $head.parentOffset - match[0].length;
      const to = $head.pos;

      const coords = editorInstance.view.coordsAtPos(from);
      setSlashPosition({ top: coords.bottom + 8, left: coords.left });
      setSlashQuery(query);
      setSlashRange({ from, to });
      setSlashOpen(true);
    } else {
      setSlashOpen(false);
    }
  }, []);

  // Close slash menu on click outside
  useEffect(() => {
    if (!slashOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-slash-menu]')) {
        setSlashOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [slashOpen]);

  if (!editor) return null;

  return (
    <div className="bb-editor">
      <FloatingToolbar editor={editor} />
      <EditorContent editor={editor} />
      {slashOpen && (
        <div data-slash-menu>
          <SlashCommandMenu
            editor={editor}
            position={slashPosition}
            query={slashQuery}
            range={slashRange}
            onClose={() => setSlashOpen(false)}
            onSelect={() => setSlashOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
