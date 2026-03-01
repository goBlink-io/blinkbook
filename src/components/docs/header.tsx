"use client";

import { Zap, Search, Github, Menu, X } from "lucide-react";
import Link from "next/link";

export function Header({
  onMenuToggle,
  menuOpen,
  onSearchOpen,
}: {
  onMenuToggle: () => void;
  menuOpen: boolean;
  onSearchOpen: () => void;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-full items-center px-4 gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md hover:bg-surface"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link href="/docs" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-violet">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-semibold text-sm">goBlink Docs</span>
        </Link>

        <div className="flex-1" />

        <button
          onClick={onSearchOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface text-muted text-sm hover:bg-surface-hover transition-colors"
        >
          <Search size={14} />
          <span className="hidden sm:inline">Search docs…</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background border border-border text-[11px] font-mono">
            ⌘K
          </kbd>
        </button>

        <a
          href="https://github.com/goBlink"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md hover:bg-surface text-muted hover:text-foreground transition-colors"
        >
          <Github size={18} />
        </a>
      </div>
    </header>
  );
}
