"use client";

import * as LucideIcons from "lucide-react";
import { Search, Github, Menu, X } from "lucide-react";
import Link from "next/link";
import { config } from "@/../blinkbook.config";
import { VersionSwitcher } from "./version-switcher";

function LogoIcon() {
  if (config.logo.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={config.logo.logoUrl} alt={config.name} className="w-7 h-7 rounded-lg" />
    );
  }

  const iconName = config.logo.icon as keyof typeof LucideIcons;
  const Icon = (LucideIcons[iconName] as LucideIcons.LucideIcon) || LucideIcons.Zap;

  return (
    <div
      className="flex items-center justify-center w-7 h-7 rounded-lg"
      style={{ background: `linear-gradient(to bottom right, var(--bb-gradient-from), var(--bb-gradient-to))` }}
    >
      <Icon size={16} className="text-white" />
    </div>
  );
}

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
          className="lg:hidden p-2 rounded-md hover:bg-surface min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link href="/docs" className="flex items-center gap-2 shrink-0">
          <LogoIcon />
          <span className="font-semibold text-sm">
            {config.name} <span className="text-muted font-normal">{config.tagline}</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-4">
          {config.header.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 text-sm text-muted hover:text-foreground transition-colors rounded-md hover:bg-surface"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex-1" />

        <VersionSwitcher />

        {config.features.search && config.header.search && (
          <button
            onClick={onSearchOpen}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface text-muted text-sm hover:bg-surface-hover transition-colors min-h-[44px] sm:min-h-0"
          >
            <Search size={14} />
            <span className="hidden sm:inline">Search docs…</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-background border border-border text-[11px] font-mono">
              ⌘K
            </kbd>
          </button>
        )}

        {config.header.github && (
          <a
            href={config.header.github}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md hover:bg-surface text-muted hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Github size={18} />
          </a>
        )}
      </div>
    </header>
  );
}
