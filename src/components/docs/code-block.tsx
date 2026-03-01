"use client";

import { useState, useRef, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const lang = className?.replace("language-", "") || "";

  const copy = () => {
    const text = preRef.current?.textContent || "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group my-6">
      {lang && (
        <div className="absolute top-0 left-4 px-2.5 py-0.5 text-[11px] font-mono text-muted bg-surface border border-border border-b-0 rounded-t-md">
          {lang}
        </div>
      )}
      <button
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-surface/80 border border-border text-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-all"
        aria-label="Copy code"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <pre
        ref={preRef}
        className={`bg-[#0d1117] border border-border rounded-lg p-4 ${lang ? "pt-8" : ""} overflow-x-auto text-sm leading-relaxed ${className || ""}`}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
