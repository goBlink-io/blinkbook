"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/docs/header";
import { Sidebar } from "@/components/docs/sidebar";
import { TableOfContents } from "@/components/docs/toc";
import { SearchDialog } from "@/components/docs/search";
import { config } from "@/../blinkbook.config";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!config.features.search) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        menuOpen={sidebarOpen}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {config.features.search && (
        <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      )}

      <main className="flex-1 pt-14 lg:pl-64 xl:pr-56">
        <div className="max-w-3xl mx-auto px-6 py-10">{children}</div>
      </main>

      {config.features.toc && <TableOfContents />}

      <footer className="lg:pl-64 border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span>{config.footer.text}</span>
          <div className="flex items-center gap-4">
            {config.footer.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
