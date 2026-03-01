"use client";

import { useEffect, useRef, useState } from "react";
import { themes } from "@/config/themes";
import type { ThemeName } from "@/config/themes";

/* ─── Scroll animation hook ─── */
function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Copy button for code blocks ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="absolute top-3 right-3 px-2 py-1 text-xs rounded bg-zinc-700/60 hover:bg-zinc-600/80 text-zinc-300 transition-colors"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

/* ─── Features data ─── */
const features = [
  { icon: "⚡", title: "Blazing Fast", desc: "<200ms page loads. Static generation + ISR." },
  { icon: "🎨", title: "Fully Customizable", desc: "One config file controls everything. 6 built-in themes or bring your own." },
  { icon: "🔍", title: "Instant Search", desc: "Client-side full-text search. No external service. Zero cost." },
  { icon: "🧩", title: "Rich Components", desc: "API playground, code tabs, Mermaid diagrams, callouts, and more." },
  { icon: "📱", title: "Mobile Perfect", desc: "Responsive from day one. Touch-optimized navigation." },
  { icon: "🔓", title: "Zero Lock-in", desc: "Your content is MDX files in a git repo. Take it anywhere." },
];

/* ─── Comparison table ─── */
const CHECK = "✓";
const CROSS = "✗";
const comparison = [
  { feature: "Speed", blinkbook: "<200ms", gitbook: "~1s", mintlify: "~500ms", docusaurus: "~400ms" },
  { feature: "Self-hosted", blinkbook: CHECK, gitbook: CROSS, mintlify: CROSS, docusaurus: CHECK },
  { feature: "Pricing", blinkbook: "Free", gitbook: "Freemium", mintlify: "$150/mo+", docusaurus: "Free" },
  { feature: "Customization", blinkbook: "Full", gitbook: "Limited", mintlify: "Moderate", docusaurus: "Full" },
  { feature: "API Playground", blinkbook: CHECK, gitbook: CROSS, mintlify: CHECK, docusaurus: CROSS },
  { feature: "AI Search", blinkbook: "Coming soon", gitbook: CHECK, mintlify: CHECK, docusaurus: CROSS },
  { feature: "Lock-in", blinkbook: "None", gitbook: "High", mintlify: "High", docusaurus: "Low" },
];

/* ─── Theme showcase ─── */
const themeEntries = Object.entries(themes) as [ThemeName, (typeof themes)[ThemeName]][];

/* ─── Quickstart code ─── */
const quickstartCode = `# 1. Clone
npx create-blinkbook my-docs

# 2. Configure
Edit blinkbook.config.ts

# 3. Deploy
vercel deploy`;

function CellValue({ value }: { value: string }) {
  if (value === CHECK) return <span className="text-green-400 font-bold">{value}</span>;
  if (value === CROSS) return <span className="text-red-400">{value}</span>;
  return <span className="text-zinc-400">{value}</span>;
}

function BlinkBookCellValue({ value }: { value: string }) {
  if (value === CHECK) return <span className="text-green-400 font-bold">{value}</span>;
  if (value === CROSS) return <span className="text-red-400">{value}</span>;
  return <span className="text-blue-400 font-medium">{value}</span>;
}

export default function LandingPage() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor?.hash) {
        const el = document.querySelector(anchor.hash);
        if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth" }); }
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      {/* Animated gradient bg */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(37,99,235,0.15), transparent 70%), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(124,58,237,0.08), transparent 60%)",
            animation: "drift 20s ease-in-out infinite alternate",
          }}
        />
        <style>{`@keyframes drift { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }`}</style>
      </div>

      {/* ═══ HERO ═══ */}
      <header className="relative pt-32 pb-24 px-6 text-center">
        <Section>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              BlinkBook
            </span>
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-zinc-100 mb-3">
            Beautiful docs, zero lock-in.
          </p>
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto mb-10">
            The open-source documentation framework that makes GitBook jealous.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#quickstart"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Get Started
            </a>
            <a
              href="https://docs.goblink.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800/60 transition-colors"
            >
              View Demo
            </a>
          </div>
        </Section>
      </header>

      {/* ═══ FEATURES ═══ */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Everything you need</h2>
          <p className="text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
            A complete documentation platform out of the box.
          </p>
        </Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Section key={f.title}>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 transition-colors h-full">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </Section>
          ))}
        </div>
      </section>

      {/* ═══ COMPARISON ═══ */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">How we compare</h2>
          <p className="text-zinc-400 text-center mb-12 max-w-2xl mx-auto">BlinkBook vs the alternatives.</p>
        </Section>
        <Section>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80">
                  <th className="text-left px-6 py-4 font-semibold text-zinc-300">Feature</th>
                  <th className="px-6 py-4 font-semibold text-blue-400">BlinkBook</th>
                  <th className="px-6 py-4 font-semibold text-zinc-400">GitBook</th>
                  <th className="px-6 py-4 font-semibold text-zinc-400">Mintlify</th>
                  <th className="px-6 py-4 font-semibold text-zinc-400">Docusaurus</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-zinc-900/30" : ""}>
                    <td className="px-6 py-3 font-medium text-zinc-200">{row.feature}</td>
                    <td className="px-6 py-3 text-center"><BlinkBookCellValue value={row.blinkbook} /></td>
                    <td className="px-6 py-3 text-center"><CellValue value={row.gitbook} /></td>
                    <td className="px-6 py-3 text-center"><CellValue value={row.mintlify} /></td>
                    <td className="px-6 py-3 text-center"><CellValue value={row.docusaurus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </section>

      {/* ═══ THEME SHOWCASE ═══ */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">6 built-in themes</h2>
          <p className="text-zinc-400 text-center mb-12 max-w-2xl mx-auto">Pick a preset or bring your own colors.</p>
        </Section>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {themeEntries.map(([name, t]) => (
            <Section key={name}>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
                <div className="flex gap-1.5 mb-3">
                  <div className="w-5 h-5 rounded-full" style={{ background: t.primary }} />
                  <div className="w-5 h-5 rounded-full" style={{ background: t.secondary }} />
                  <div className="w-5 h-5 rounded-full" style={{ background: t.background }} />
                  <div className="w-5 h-5 rounded-full border border-zinc-700" style={{ background: t.surface }} />
                </div>
                <p className="text-sm font-medium capitalize">{name}</p>
              </div>
            </Section>
          ))}
        </div>
      </section>

      {/* ═══ QUICKSTART ═══ */}
      <section id="quickstart" className="max-w-3xl mx-auto px-6 py-24">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">Get started in 30 seconds</h2>
          <p className="text-zinc-400 text-center mb-12">Three commands. That&apos;s it.</p>
          <div className="relative rounded-xl border border-zinc-800 bg-[#0d1117] p-6 font-mono text-sm leading-relaxed overflow-x-auto">
            <CopyButton text={quickstartCode} />
            <pre className="text-zinc-300 whitespace-pre">{quickstartCode.split("\n").map((line, i) => (
              <span key={i}>
                {line.startsWith("#") ? <span className="text-zinc-500">{line}</span> : <span className="text-green-400">{line}</span>}
                {"\n"}
              </span>
            ))}</pre>
          </div>
        </Section>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-zinc-800 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-zinc-400 mb-4">
            <span className="font-semibold text-zinc-200">BlinkBook</span> is a{" "}
            <a href="https://goblink.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">goBlink</a>{" "}
            product
          </p>
          <div className="flex justify-center gap-6 mb-8 text-sm">
            <a href="https://goblink.io" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors">goblink.io</a>
            <a href="https://merchant.goblink.io" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors">merchant.goblink.io</a>
            <a href="https://github.com/Urban-Blazer" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors">GitHub</a>
          </div>
          <p className="text-zinc-600 text-sm">Built with ❤️ by the goBlink team</p>
        </div>
      </footer>
    </div>
  );
}
