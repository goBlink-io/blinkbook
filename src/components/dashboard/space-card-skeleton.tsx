export function SpaceCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 animate-pulse">
      {/* Title line */}
      <div className="h-5 w-2/3 bg-zinc-800 rounded mb-3" />

      {/* Subtitle line */}
      <div className="h-3.5 w-1/2 bg-zinc-800 rounded mb-4" />

      {/* Description block */}
      <div className="space-y-2 mb-5">
        <div className="h-3 w-full bg-zinc-800 rounded" />
        <div className="h-3 w-4/5 bg-zinc-800 rounded" />
      </div>

      {/* Stats line */}
      <div className="flex items-center gap-4 mb-5">
        <div className="h-3 w-16 bg-zinc-800 rounded" />
        <div className="h-3 w-20 bg-zinc-800 rounded" />
        <div className="h-3 w-14 bg-zinc-800 rounded" />
      </div>

      {/* Action buttons row */}
      <div className="flex items-center gap-2 pt-4 border-t border-zinc-800">
        <div className="h-8 w-20 bg-zinc-800 rounded-md" />
        <div className="h-8 w-16 bg-zinc-800 rounded-md" />
        <div className="ml-auto h-8 w-8 bg-zinc-800 rounded-md" />
      </div>
    </div>
  );
}
