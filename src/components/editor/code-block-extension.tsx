'use client';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { common, createLowlight } from 'lowlight';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

const lowlight = createLowlight(common);

const languages = [
  'plaintext', 'javascript', 'typescript', 'python', 'bash', 'json',
  'html', 'css', 'go', 'rust', 'sql', 'yaml', 'markdown',
  'java', 'csharp', 'cpp', 'ruby', 'php', 'swift', 'kotlin',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CodeBlockView({ node, updateAttributes }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper>
      <div className="relative my-3 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden group">
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800/80 border-b border-zinc-700">
          <select
            value={node.attrs.language || 'plaintext'}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="bg-transparent text-xs text-zinc-400 hover:text-zinc-200 outline-none cursor-pointer"
            contentEditable={false}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang} className="bg-zinc-800 text-zinc-200">
                {lang}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCopy}
            className="text-zinc-500 hover:text-zinc-200 transition p-1"
            contentEditable={false}
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
          <NodeViewContent className={`language-${node.attrs.language || 'plaintext'}`} />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}

export const EnhancedCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
}).configure({
  lowlight,
  defaultLanguage: 'plaintext',
});
