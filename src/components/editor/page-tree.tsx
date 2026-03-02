'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { PageTreeItem, type TreeNode } from './page-tree-item';
import type { BBPage } from '@/types/database';

interface PageTreeProps {
  pages: BBPage[];
  activePageId?: string;
  onPagesChange: () => void;
}

function buildTree(pages: BBPage[], parentId: string | null = null, depth: number = 0): TreeNode[] {
  return pages
    .filter((p) => p.parent_id === parentId)
    .sort((a, b) => a.position - b.position)
    .map((page) => ({
      ...page,
      depth,
      children: buildTree(pages, page.id, depth + 1),
    }));
}

function flattenTree(nodes: TreeNode[]): TreeNode[] {
  return nodes.reduce<TreeNode[]>((acc, node) => {
    acc.push(node);
    if (node.children.length > 0) {
      acc.push(...flattenTree(node.children));
    }
    return acc;
  }, []);
}

function SortablePageItem({
  node,
  activePageId,
  expandedIds,
  onToggleExpand,
  onRename,
  onDuplicate,
  onMoveToTop,
  onDelete,
}: {
  node: TreeNode;
  activePageId?: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDuplicate: (id: string) => void;
  onMoveToTop: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <PageTreeItem
        node={node}
        activePageId={activePageId}
        expandedIds={expandedIds}
        onToggleExpand={onToggleExpand}
        onRename={onRename}
        onDuplicate={onDuplicate}
        onMoveToTop={onMoveToTop}
        onDelete={onDelete}
        dragHandleProps={listeners}
        isDragging={isDragging}
      />
    </div>
  );
}

export function PageTree({ pages, activePageId, onPagesChange }: PageTreeProps) {
  const params = useParams<{ siteId: string }>();
  const router = useRouter();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  const tree = useMemo(() => buildTree(pages), [pages]);
  const flatList = useMemo(() => flattenTree(tree), [tree]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCreatePage = async () => {
    setCreating(true);
    try {
      const res = await fetch(`/api/spaces/${params.siteId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled' }),
      });
      if (res.ok) {
        const page = await res.json();
        onPagesChange();
        router.push(`/dashboard/${params.siteId}/editor/${page.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (id: string, title: string) => {
    await fetch(`/api/spaces/${params.siteId}/pages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    onPagesChange();
  };

  const handleDuplicate = async (id: string) => {
    const page = pages.find((p) => p.id === id);
    if (!page) return;
    await fetch(`/api/spaces/${params.siteId}/pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${page.title} (copy)`,
        parent_id: page.parent_id,
        content: page.content,
      }),
    });
    onPagesChange();
  };

  const handleMoveToTop = async (id: string) => {
    const reordered = pages.map((p) => ({
      id: p.id,
      parent_id: p.id === id ? null : p.parent_id,
      position: p.id === id ? -1 : p.position,
    }));
    // Renumber
    reordered.sort((a, b) => a.position - b.position);
    reordered.forEach((p, i) => { p.position = i; });

    await fetch(`/api/spaces/${params.siteId}/pages/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages: reordered }),
    });
    onPagesChange();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page and all its children?')) return;
    await fetch(`/api/spaces/${params.siteId}/pages/${id}`, { method: 'DELETE' });
    onPagesChange();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = flatList.findIndex((n) => n.id === active.id);
    const newIndex = flatList.findIndex((n) => n.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Build new order
    const ids = flatList.map((n) => n.id);
    ids.splice(oldIndex, 1);
    ids.splice(newIndex, 0, active.id as string);

    const updates = ids.map((id, i) => {
      const original = pages.find((p) => p.id === id)!;
      return { id, parent_id: original.parent_id, position: i };
    });

    await fetch(`/api/spaces/${params.siteId}/pages/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages: updates }),
    });
    onPagesChange();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pages</span>
        <button
          type="button"
          onClick={handleCreatePage}
          disabled={creating}
          className="p-1 text-zinc-500 hover:text-white transition rounded hover:bg-zinc-800"
          title="New page"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {pages.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-zinc-500 mb-2">No pages yet</p>
            <button
              type="button"
              onClick={handleCreatePage}
              className="text-xs text-blue-400 hover:text-blue-300 transition"
            >
              Create your first page
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={flatList.map((n) => n.id)} strategy={verticalListSortingStrategy}>
              {tree.map((node) => (
                <SortablePageItem
                  key={node.id}
                  node={node}
                  activePageId={activePageId}
                  expandedIds={expandedIds}
                  onToggleExpand={toggleExpand}
                  onRename={handleRename}
                  onDuplicate={handleDuplicate}
                  onMoveToTop={handleMoveToTop}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
