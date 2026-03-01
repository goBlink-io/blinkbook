"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { config } from "@/../blinkbook.config";

export function VersionSwitcher() {
  const versions = config.versions;

  if (versions.available.length <= 1) return null;

  return <VersionDropdown />;
}

function VersionDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { current, available } = config.versions;

  const currentVersion = available.find((v) => v.value === current);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-md border border-border text-xs text-muted hover:text-foreground hover:bg-surface transition-colors min-h-[44px] sm:min-h-0"
      >
        {currentVersion?.label || current}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-50">
          {available.map((v) => (
            <button
              key={v.value}
              onClick={() => {
                setOpen(false);
                if (v.value !== current) {
                  router.push(v.path);
                }
              }}
              className="flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-surface-hover transition-colors"
            >
              <span className={v.value === current ? "text-foreground font-medium" : "text-muted"}>
                {v.label}
              </span>
              {v.value === current && <Check size={14} className="text-accent-blue" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
