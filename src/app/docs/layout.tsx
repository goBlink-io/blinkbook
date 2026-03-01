"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/docs/header";
import { Sidebar } from "@/components/docs/sidebar";
import { TableOfContents } from "@/components/docs/toc";
import { SearchDialog } from "@/components/docs/search";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
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
    <div className="min-h-screen">
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        menuOpen={sidebarOpen}
        onSearchOpen={() => setSearchOpen(true)}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />

      <main className="pt-14 lg:pl-64 xl:pr-56">
        <div className="max-w-3xl mx-auto px-6 py-10">{children}</div>
      </main>

      <TableOfContents />
    </div>
  );
}
