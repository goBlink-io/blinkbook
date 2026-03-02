'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
      <div className="text-center px-6 max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          Something went wrong
        </h1>

        <p className="text-zinc-400 text-sm mb-2">
          An unexpected error occurred. Please try again or return to the
          dashboard.
        </p>

        {error.digest && (
          <p className="text-zinc-600 text-xs mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {!error.digest && <div className="mb-6" />}

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
          >
            Try again
          </button>

          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition border border-zinc-700"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
