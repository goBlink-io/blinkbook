"use client";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.querySelector(".docs-content");
    if (!article) return;

    const elements = article.querySelectorAll("h2, h3, h4");
    const items: TocItem[] = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent || "",
      level: parseInt(el.tagName[1]),
    }));
    setHeadings(items);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:block fixed top-14 right-0 w-56 h-[calc(100vh-3.5rem)] overflow-y-auto p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
        On this page
      </p>
      <nav className="space-y-1">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`block text-[13px] leading-relaxed transition-colors ${
              h.level === 3 ? "pl-3" : h.level === 4 ? "pl-6" : ""
            } ${
              activeId === h.id
                ? "text-accent-blue font-medium"
                : "text-muted hover:text-foreground"
            }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
