'use client';

import Link from 'next/link';
import { BookOpen, Zap, Users, Shield } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-violet-600/10" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">BlinkBook</span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">
            Beautiful docs,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
              shipped fast
            </span>
          </h1>
          <p className="text-lg text-zinc-400 mb-12">
            Create stunning documentation sites in minutes, not days.
          </p>
          <div className="space-y-6">
            <Feature
              icon={<Zap className="w-5 h-5" />}
              title="Instant setup"
              description="Go from zero to published docs in under 5 minutes"
            />
            <Feature
              icon={<Users className="w-5 h-5" />}
              title="Team collaboration"
              description="Invite editors and manage roles with ease"
            />
            <Feature
              icon={<Shield className="w-5 h-5" />}
              title="Custom branding"
              description="Your domain, your logo, your colors — fully white-label"
            />
          </div>
        </div>
        <p className="relative z-10 text-sm text-zinc-600">
          &copy; {new Date().getFullYear()} BlinkBook. All rights reserved.
        </p>
      </div>

      {/* Right auth card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-blue-400 shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-medium">{title}</h3>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
