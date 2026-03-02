'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight, GripVertical, FileText, FolderOpen,
  Eye, EyeOff, MoreHorizontal, Pencil, Copy, ArrowUp, Trash2,
} from 'lucide-react';
import type { BBPage } from '@/types/database';

export interface TreeNode extends BBPage {
  children: TreeNode[];
  depth: number;
}

interface PageTreeItemProps {
  node: TreeNode;
  activePageId?: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDuplicate: (id: string) => void;
  onMoveToTop: (id: string) => void;
  onDelete: (id: string) => void;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}

export function PageTreeItem({
  node,
  activePageId,
  expandedIds,
  onToggleExpand,
  onRename,
  onDuplicate,
  onMoveToTop,
  onDelete,
  dragHandleProps,
  isDragging,
}: PageTreeItemProps) {
  const params = useParams<{ siteId: string }>();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isActive = node.id === activePageId;

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditTitle(node.title);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleRenameSubmit = () => {
    if (editTitle.trim() && editTitle !== node.title) {
      onRename(node.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div
        className={`group flex items-center gap-1 px-2 py-1 rounded-md text-sm transition cursor-pointer ${
          isActive
            ? 'bg-zinc-800 text-white'
            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
        }`}
        style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
      >
        {/* Drag handle */}
        <span
          className="opacity-0 group-hover:opacity-100 transition cursor-grab text-zinc-600 hover:text-zinc-400"
          {...dragHandleProps}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </span>

        {/* Expand/collapse */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggleExpand(node.id); }}
          className={`p-0.5 transition ${hasChildren ? 'text-zinc-500 hover:text-zinc-300' : 'invisible'}`}
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        {/* Icon */}
        {hasChildren ? (
          <FolderOpen className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
        )}

        {/* Title */}
        {isEditing ? (
          <input
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameSubmit();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="flex-1 bg-zinc-700 text-white text-sm px-1 py-0 rounded outline-none min-w-0"
            autoFocus
          />
        ) : (
          <Link
            href={`/dashboard/${params.siteId}/editor/${node.id}`}
            className="flex-1 truncate min-w-0"
            onDoubleClick={handleDoubleClick}
          >
            {node.title}
          </Link>
        )}

        {/* Status badge */}
        <span title={node.is_published ? 'Published' : 'Draft'} className="shrink-0">
          {node.is_published ? (
            <Eye className="w-3 h-3 text-green-400/60" />
          ) : (
            <EyeOff className="w-3 h-3 text-zinc-600" />
          )}
        </span>

        {/* Action menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-0.5 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-6 z-50 w-44 bg-zinc-800 border border-zinc-700 rounded-lg py-1 shadow-xl">
                <MenuButton icon={Pencil} label="Rename" onClick={() => { setShowMenu(false); handleDoubleClick(); }} />
                <MenuButton icon={Copy} label="Duplicate" onClick={() => { setShowMenu(false); onDuplicate(node.id); }} />
                <MenuButton icon={ArrowUp} label="Move to top" onClick={() => { setShowMenu(false); onMoveToTop(node.id); }} />
                <div className="my-1 border-t border-zinc-700" />
                <MenuButton icon={Trash2} label="Delete" onClick={() => { setShowMenu(false); onDelete(node.id); }} danger />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <PageTreeItem
              key={child.id}
              node={child}
              activePageId={activePageId}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onRename={onRename}
              onDuplicate={onDuplicate}
              onMoveToTop={onMoveToTop}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm transition ${
        danger ? 'text-red-400 hover:bg-red-500/10' : 'text-zinc-300 hover:bg-zinc-700'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
