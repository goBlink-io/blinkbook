import Link from 'next/link';
import { Plus } from 'lucide-react';

export function EmptySpaces() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Document / book illustration */}
      <div className="mb-8">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-zinc-700"
        >
          {/* Book back cover */}
          <rect
            x="24"
            y="20"
            width="72"
            height="84"
            rx="4"
            className="fill-zinc-800 stroke-zinc-700"
            strokeWidth="1.5"
          />
          {/* Book front cover */}
          <rect
            x="20"
            y="16"
            width="72"
            height="84"
            rx="4"
            className="fill-zinc-900 stroke-zinc-700"
            strokeWidth="1.5"
          />
          {/* Spine line */}
          <line
            x1="32"
            y1="16"
            x2="32"
            y2="100"
            className="stroke-zinc-700"
            strokeWidth="1.5"
          />
          {/* Title line */}
          <rect x="40" y="36" width="40" height="4" rx="2" className="fill-zinc-700" />
          {/* Subtitle line */}
          <rect x="40" y="46" width="28" height="3" rx="1.5" className="fill-zinc-800" />
          {/* Content lines */}
          <rect x="40" y="60" width="44" height="2.5" rx="1.25" className="fill-zinc-800" />
          <rect x="40" y="67" width="36" height="2.5" rx="1.25" className="fill-zinc-800" />
          <rect x="40" y="74" width="40" height="2.5" rx="1.25" className="fill-zinc-800" />
          {/* Plus badge */}
          <circle cx="82" cy="90" r="14" className="fill-blue-600" />
          <line x1="76" y1="90" x2="88" y2="90" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="82" y1="84" x2="82" y2="96" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
        Create your first docs site
      </h2>

      <p className="text-zinc-400 text-sm mb-8">
        Get up and running in under 2 minutes
      </p>

      <Link
        href="/dashboard/new"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
      >
        <Plus className="w-4 h-4" />
        Create Space
      </Link>
    </div>
  );
}
