'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const calloutStyles: Record<string, { border: string; bg: string; icon: typeof Info; iconColor: string }> = {
  info: { border: 'border-l-blue-500', bg: 'bg-blue-500/10', icon: Info, iconColor: 'text-blue-400' },
  warning: { border: 'border-l-amber-500', bg: 'bg-amber-500/10', icon: AlertTriangle, iconColor: 'text-amber-400' },
  danger: { border: 'border-l-red-500', bg: 'bg-red-500/10', icon: AlertCircle, iconColor: 'text-red-400' },
  success: { border: 'border-l-green-500', bg: 'bg-green-500/10', icon: CheckCircle, iconColor: 'text-green-400' },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CalloutView({ node, updateAttributes }: any) {
  const [showPicker, setShowPicker] = useState(false);
  const type = node.attrs.type || 'info';
  const style = calloutStyles[type] || calloutStyles.info;
  const Icon = style.icon;

  return (
    <NodeViewWrapper>
      <div className={`relative my-3 rounded-lg border-l-4 ${style.border} ${style.bg} p-4`}>
        <div className="flex gap-3">
          <div className="relative shrink-0 pt-0.5">
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className={`${style.iconColor} hover:opacity-80 transition`}
              title="Change callout type"
            >
              <Icon className="w-5 h-5" />
            </button>
            {showPicker && (
              <div className="absolute top-8 left-0 z-20 bg-zinc-800 border border-zinc-700 rounded-lg py-1 shadow-xl min-w-[140px]">
                {Object.entries(calloutStyles).map(([key, s]) => {
                  const ItemIcon = s.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { updateAttributes({ type: key }); setShowPicker(false); }}
                      className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-zinc-700 transition ${type === key ? 'text-white' : 'text-zinc-300'}`}
                    >
                      <ItemIcon className={`w-4 h-4 ${s.iconColor}`} />
                      <span className="capitalize">{key}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <NodeViewContent className="callout-content" />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-callout-type') || 'info',
        renderHTML: (attributes: Record<string, string>) => ({ 'data-callout-type': attributes.type }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, string> }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },

  addCommands() {
    return {
      setCallout: (attrs?: { type?: string }) => ({ commands }: { commands: { wrapIn: (name: string, attrs?: Record<string, unknown>) => boolean } }) => {
        return commands.wrapIn(this.name, attrs);
      },
    } as Record<string, (...args: unknown[]) => unknown>;
  },
});
