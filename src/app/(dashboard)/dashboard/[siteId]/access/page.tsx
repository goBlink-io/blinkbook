import { Shield } from 'lucide-react';

export default function AccessRulesPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold text-white">Token-Gated Access</h1>
        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full font-medium">
          Coming Soon
        </span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
        <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Token-Gated Access</h2>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">
          Control who can access your documentation using token ownership. This feature is coming soon.
        </p>
      </div>
    </div>
  );
}
