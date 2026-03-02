import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const templates = [
  {
    id: 'developer-docs',
    name: 'Developer Docs',
    theme: 'midnight',
    description: 'Clean, dark docs for APIs and SDKs',
    gradient: 'from-blue-600 to-violet-600',
  },
  {
    id: 'product-guide',
    name: 'Product Guide',
    theme: 'ocean',
    description: 'User-friendly guides for SaaS products',
    gradient: 'from-cyan-600 to-blue-600',
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    theme: 'forest',
    description: 'Help center for customer support',
    gradient: 'from-green-600 to-emerald-600',
  },
  {
    id: 'api-reference',
    name: 'API Reference',
    theme: 'lavender',
    description: 'Interactive API documentation',
    gradient: 'from-violet-600 to-purple-600',
  },
  {
    id: 'open-source',
    name: 'Open Source',
    theme: 'arctic',
    description: 'Light, readable docs for OSS projects',
    gradient: 'from-slate-300 to-blue-300',
  },
  {
    id: 'startup',
    name: 'Startup',
    theme: 'sunset',
    description: 'Bold, warm docs for early-stage products',
    gradient: 'from-orange-500 to-red-500',
  },
];

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center h-14 px-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Start with a template
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto">
          Choose a template to get started quickly. Each comes with a pre-configured theme and layout.
        </p>
      </section>

      {/* Templates Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden hover:border-zinc-700 transition-colors"
            >
              {/* Thumbnail */}
              <div className={`h-36 bg-gradient-to-br ${template.gradient} relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-20 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex">
                    <div className="w-1/4 border-r border-white/10 p-2">
                      <div className="space-y-1.5">
                        <div className="h-1.5 w-full bg-white/30 rounded" />
                        <div className="h-1.5 w-3/4 bg-white/20 rounded" />
                        <div className="h-1.5 w-5/6 bg-white/20 rounded" />
                      </div>
                    </div>
                    <div className="flex-1 p-2">
                      <div className="h-2 w-1/2 bg-white/30 rounded mb-2" />
                      <div className="space-y-1">
                        <div className="h-1 w-full bg-white/15 rounded" />
                        <div className="h-1 w-5/6 bg-white/15 rounded" />
                        <div className="h-1 w-4/6 bg-white/15 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-white">{template.name}</h3>
                  <span className="text-xs text-zinc-500 capitalize bg-zinc-800 px-2 py-0.5 rounded">
                    {template.theme}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 mb-4">{template.description}</p>
                <Link
                  href={`/dashboard/new?template=${template.theme}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
                >
                  Use Template
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center">
        <p className="text-xs text-zinc-600">
          Built with{' '}
          <a href="/" className="text-zinc-400 hover:text-white transition">
            BlinkBook
          </a>
        </p>
      </footer>
    </div>
  );
}
