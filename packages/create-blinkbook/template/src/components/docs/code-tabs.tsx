"use client";

import { useState, type ReactNode } from "react";

interface Tab {
  label: string;
  children: ReactNode;
}

export function CodeTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="my-6 border border-border rounded-lg overflow-hidden">
      <div className="flex border-b border-border bg-surface">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              i === active
                ? "text-accent-blue border-b-2 border-accent-blue bg-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active].children}</div>
    </div>
  );
}
