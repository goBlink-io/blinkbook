import { FileText, Palette, Sparkles } from 'lucide-react';

export function SocialProof() {
  return (
    <div className="mt-8">
      <div className="border-t border-zinc-800 pt-6">
        <p className="text-xs text-zinc-500 text-center mb-4">
          Trusted by documentation teams
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <FileText className="w-3.5 h-3.5" />
            <span>100+ docs sites</span>
          </div>
          <div className="w-px h-3 bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Palette className="w-3.5 h-3.5" />
            <span>6 themes</span>
          </div>
          <div className="w-px h-3 bg-zinc-800" />
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free forever tier</span>
          </div>
        </div>
      </div>
    </div>
  );
}
