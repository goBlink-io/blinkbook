import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center relative overflow-hidden">
      {/* Animated background circles */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          animation: 'float-1 12s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
          animation: 'float-2 15s ease-in-out infinite',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-5 blur-3xl"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
          animation: 'float-3 10s ease-in-out infinite',
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes float-1 {
              0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.10; }
              50% { transform: translate(40px, -30px) scale(1.1); opacity: 0.15; }
            }
            @keyframes float-2 {
              0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.10; }
              50% { transform: translate(-30px, 20px) scale(1.15); opacity: 0.12; }
            }
            @keyframes float-3 {
              0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.05; }
              50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.08; }
            }
          `,
        }}
      />

      <div className="relative z-10 text-center px-6">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
          404 &mdash; Page not found
        </h1>

        <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
