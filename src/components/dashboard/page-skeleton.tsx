export function PageSkeleton() {
  return (
    <div className="animate-pulse max-w-3xl mx-auto py-8 px-6">
      {/* Heading block */}
      <div className="h-8 w-2/5 bg-zinc-800 rounded mb-8" />

      {/* Paragraph lines */}
      <div className="space-y-3 mb-6">
        <div className="h-3.5 w-full bg-zinc-800 rounded" />
        <div className="h-3.5 w-11/12 bg-zinc-800 rounded" />
        <div className="h-3.5 w-4/5 bg-zinc-800 rounded" />
        <div className="h-3.5 w-full bg-zinc-800 rounded" />
        <div className="h-3.5 w-3/4 bg-zinc-800 rounded" />
      </div>

      {/* Second paragraph */}
      <div className="space-y-3 mb-6">
        <div className="h-3.5 w-full bg-zinc-800 rounded" />
        <div className="h-3.5 w-5/6 bg-zinc-800 rounded" />
        <div className="h-3.5 w-full bg-zinc-800 rounded" />
        <div className="h-3.5 w-2/3 bg-zinc-800 rounded" />
      </div>

      {/* Sub-heading */}
      <div className="h-6 w-1/3 bg-zinc-800 rounded mb-5" />

      {/* Third paragraph */}
      <div className="space-y-3">
        <div className="h-3.5 w-full bg-zinc-800 rounded" />
        <div className="h-3.5 w-4/5 bg-zinc-800 rounded" />
        <div className="h-3.5 w-11/12 bg-zinc-800 rounded" />
      </div>
    </div>
  );
}
