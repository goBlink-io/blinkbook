import Link from 'next/link';

export default function SiteNotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
      <div className="text-center px-6 max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-zinc-500"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3 tracking-tight">
          Page not found
        </h1>

        <p className="text-zinc-400 text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist in this
          documentation.
        </p>

        <Link
          href="."
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition border border-zinc-700"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
