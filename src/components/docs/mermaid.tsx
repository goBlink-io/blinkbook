"use client";

import { useEffect, useRef, useState } from "react";

export function Mermaid({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#2563eb",
            primaryTextColor: "#fafafa",
            primaryBorderColor: "#3b82f6",
            lineColor: "#a1a1aa",
            secondaryColor: "#7c3aed",
            tertiaryColor: "#18181b",
            fontFamily: "var(--font-geist-sans), sans-serif",
          },
        });

        const { svg: renderedSvg } = await mermaid.render(idRef.current, chart.trim());
        if (!cancelled) {
          setSvg(renderedSvg);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="my-6 p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-sm text-red-400">
        <p className="font-medium mb-1">Mermaid Error</p>
        <pre className="text-xs whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-6 p-4 rounded-lg border border-border bg-surface overflow-x-auto flex justify-center [&>svg]:max-w-full"
      dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
    />
  );
}
