import { DollarSign } from 'lucide-react';

export default function MonetizationPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <DollarSign className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold text-white">Content Monetization</h1>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full font-medium">
          Coming Soon
        </span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
        <DollarSign className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Content Monetization</h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Monetize your documentation with token-gated premium content. This feature is coming soon.
        </p>
      </div>
    </div>
  );
}
