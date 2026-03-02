export function EditorSkeleton() {
  return (
    <div className="flex flex-col h-full animate-pulse">
      {/* Toolbar area */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 bg-zinc-800 rounded" />
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-4 w-px bg-zinc-800" />
          <div className="h-4 w-32 bg-zinc-800 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-zinc-800 rounded" />
          <div className="h-7 w-7 bg-zinc-800 rounded" />
          <div className="w-px h-5 bg-zinc-800" />
          <div className="h-7 w-20 bg-zinc-800 rounded-md" />
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 px-12 py-10 max-w-3xl mx-auto w-full">
        {/* Heading block */}
        <div className="h-9 w-1/3 bg-zinc-800 rounded mb-8" />

        {/* Paragraph block 1 */}
        <div className="space-y-3 mb-6">
          <div className="h-4 w-full bg-zinc-800 rounded" />
          <div className="h-4 w-11/12 bg-zinc-800 rounded" />
          <div className="h-4 w-4/5 bg-zinc-800 rounded" />
          <div className="h-4 w-full bg-zinc-800 rounded" />
          <div className="h-4 w-2/3 bg-zinc-800 rounded" />
        </div>

        {/* Paragraph block 2 */}
        <div className="space-y-3 mb-6">
          <div className="h-4 w-full bg-zinc-800 rounded" />
          <div className="h-4 w-5/6 bg-zinc-800 rounded" />
          <div className="h-4 w-3/4 bg-zinc-800 rounded" />
        </div>

        {/* Sub-heading */}
        <div className="h-7 w-1/4 bg-zinc-800 rounded mb-5" />

        {/* Paragraph block 3 */}
        <div className="space-y-3">
          <div className="h-4 w-full bg-zinc-800 rounded" />
          <div className="h-4 w-11/12 bg-zinc-800 rounded" />
          <div className="h-4 w-4/5 bg-zinc-800 rounded" />
          <div className="h-4 w-full bg-zinc-800 rounded" />
        </div>
      </div>
    </div>
  );
}
