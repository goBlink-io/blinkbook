"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Blocks,
  Search,
  Globe,
  Users,
  BarChart3,
  Palette,
  Code2,
  DollarSign,
  ArrowRight,
  Check,
  X,
  Sparkles,
  Type,
  GripVertical,
  Slash,
  Image,
  Table,
  ChevronRight,
  Zap,
  BookOpen,
  Rocket,
} from "lucide-react";

/* ─── Scroll animation hook ─── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Section({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.7s cubic-bezier(.16,1,.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Features data ─── */
const features = [
  {
    icon: Blocks,
    title: "Block Editor",
    desc: "Tiptap-powered block editor with slash commands, drag-and-drop, and 20+ content blocks.",
  },
  {
    icon: Search,
    title: "Instant Search",
    desc: "Client-side full-text search. Fast, zero-cost, works offline.",
  },
  {
    icon: Globe,
    title: "Custom Domains",
    desc: "Connect your own domain with automatic SSL. Your docs, your brand.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Invite team members with role-based access. Admin, Editor, and Viewer roles.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Track page views, popular docs, and reader engagement. No third-party scripts.",
  },
  {
    icon: Palette,
    title: "6 Themes",
    desc: "Pick from Midnight, Ocean, Forest, Sunset, Lavender, or Arctic. Or customize your own.",
  },
  {
    icon: Code2,
    title: "API Playground",
    desc: "Interactive API explorer built in. Let developers test endpoints right from your docs.",
  },
  {
    icon: DollarSign,
    title: "Flat Pricing",
    desc: "No per-seat fees. One price covers your whole team. Start free, upgrade when ready.",
  },
];

/* ─── How it works ─── */
const steps = [
  {
    icon: Zap,
    step: "1",
    title: "Sign up",
    desc: "Create your free account in seconds. No credit card required.",
  },
  {
    icon: BookOpen,
    step: "2",
    title: "Create your space",
    desc: "Pick a template, choose a theme, and start writing with our block editor.",
  },
  {
    icon: Rocket,
    step: "3",
    title: "Publish",
    desc: "Hit publish and your docs are live. Add a custom domain when you're ready.",
  },
];

/* ─── Editor blocks for showcase ─── */
const editorBlocks = [
  { icon: Slash, label: "Slash commands", desc: "Type / to insert any block" },
  { icon: GripVertical, label: "Drag & drop", desc: "Reorder blocks visually" },
  { icon: Type, label: "Rich text", desc: "Headings, lists, callouts" },
  { icon: Code2, label: "Code blocks", desc: "Syntax-highlighted code" },
  { icon: Image, label: "Media", desc: "Images, videos, embeds" },
  { icon: Table, label: "Tables", desc: "Full table support" },
];

/* ─── Comparison table ─── */
const CHECK = true;
const CROSS = false;
const comparison: {
  feature: string;
  blinkbook: string | boolean;
  gitbook: string | boolean;
  mintlify: string | boolean;
  docusaurus: string | boolean;
}[] = [
  { feature: "Block editor", blinkbook: CHECK, gitbook: CHECK, mintlify: CROSS, docusaurus: CROSS },
  { feature: "Custom domains", blinkbook: CHECK, gitbook: CHECK, mintlify: CHECK, docusaurus: CHECK },
  { feature: "Instant search", blinkbook: CHECK, gitbook: CHECK, mintlify: CHECK, docusaurus: CHECK },
  { feature: "API playground", blinkbook: CHECK, gitbook: CROSS, mintlify: CHECK, docusaurus: CROSS },
  { feature: "Team collaboration", blinkbook: CHECK, gitbook: CHECK, mintlify: CHECK, docusaurus: CROSS },
  { feature: "Analytics", blinkbook: CHECK, gitbook: CHECK, mintlify: CHECK, docusaurus: CROSS },
  { feature: "Themes", blinkbook: "6 built-in", gitbook: "Limited", mintlify: "Limited", docusaurus: "Custom only" },
  { feature: "Flat pricing", blinkbook: CHECK, gitbook: CROSS, mintlify: CROSS, docusaurus: "N/A" },
  { feature: "Starting price", blinkbook: "Free", gitbook: "Freemium", mintlify: "$150/mo", docusaurus: "Free (DIY)" },
  { feature: "No per-seat fees", blinkbook: CHECK, gitbook: CROSS, mintlify: CROSS, docusaurus: "N/A" },
];

/* ─── Pricing tiers ─── */
const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for personal projects and getting started.",
    cta: "Get Started Free",
    ctaHref: "/signup",
    highlighted: false,
    features: ["1 space, 20 pages", "1,000 pageviews/mo", "Subdomain hosting", "Full-text search", "Community support"],
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "For creators shipping polished docs.",
    cta: "Start Pro Trial",
    ctaHref: "/signup?plan=pro",
    highlighted: true,
    badge: "Most Popular",
    features: [
      "3 spaces, unlimited pages",
      "50K pageviews/mo",
      "Custom domain + SSL",
      "Full analytics",
      "Remove branding",
    ],
  },
  {
    name: "Team",
    price: "$49",
    period: "/mo",
    description: "For organizations needing collaboration.",
    cta: "Start Team Trial",
    ctaHref: "/signup?plan=team",
    highlighted: false,
    features: [
      "10 spaces, 10 team members",
      "250K pageviews/mo",
      "Role-based access",
      "Token-gated pages",
      "Content monetization",
    ],
  },
  {
    name: "Business",
    price: "$99",
    period: "/mo",
    description: "Scale, control, and white-label.",
    cta: "Start Business Trial",
    ctaHref: "/signup?plan=business",
    highlighted: false,
    badge: "Best Value",
    features: [
      "Unlimited spaces & pages",
      "1M pageviews/mo",
      "25 team members",
      "White-label rebrand",
      "SSO/SAML (coming soon)",
    ],
  },
];

function ComparisonCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-4 h-4 text-green-400 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-zinc-600 mx-auto" />;
  return <span className="text-zinc-400 text-xs">{value}</span>;
}

function BlinkBookCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-4 h-4 text-green-400 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-red-400 mx-auto" />;
  return <span className="text-blue-400 text-xs font-medium">{value}</span>;
}

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (anchor?.hash) {
        const el = document.querySelector(anchor.hash);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
        }
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
            background:
              "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(37,99,235,0.12), transparent 70%), radial-gradient(ellipse 60% 50% at 80% 50%, rgba(124,58,237,0.06), transparent 60%)",
            animation: "drift 20s ease-in-out infinite alternate",
          }}
        />
        <style>{`@keyframes drift { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }`}</style>
      </div>

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              goBlink Book
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <Link href="/templates" className="hover:text-white transition-colors">
              Templates
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:from-blue-500 hover:to-violet-500 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <header className="relative pt-32 sm:pt-40 pb-20 px-6">
        <Section className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 mb-8">
            <Sparkles className="w-3 h-3 text-blue-400" />
            The modern GitBook alternative
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Documentation that
            <br />
            <span className="bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
              ships with you
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            A hosted documentation platform with a powerful block editor, instant search,
            custom domains, and flat pricing. No per-seat fees. No surprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="/docs"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800/60 hover:border-zinc-600 transition-all"
            >
              See Demo
            </a>
          </div>
        </Section>

        {/* Editor mockup */}
        <Section className="max-w-4xl mx-auto mt-16" delay={200}>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-blue-900/10 overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
              </div>
              <span className="text-xs text-zinc-500 ml-2">my-docs.book.goblink.io</span>
            </div>
            {/* Editor body */}
            <div className="flex min-h-[280px]">
              {/* Sidebar */}
              <div className="w-48 border-r border-zinc-800 p-4 hidden sm:block">
                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                  Pages
                </div>
                <div className="space-y-1">
                  {["Getting Started", "Installation", "Configuration", "API Reference", "Deployment"].map(
                    (page, i) => (
                      <div
                        key={page}
                        className={`text-sm px-2 py-1.5 rounded ${
                          i === 0
                            ? "bg-blue-600/10 text-blue-400 font-medium"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {page}
                      </div>
                    )
                  )}
                </div>
              </div>
              {/* Content */}
              <div className="flex-1 p-6 sm:p-8">
                <div className="h-5 w-48 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded mb-4" />
                <div className="space-y-2.5 mb-6">
                  <div className="h-3 w-full bg-zinc-800 rounded" />
                  <div className="h-3 w-5/6 bg-zinc-800 rounded" />
                  <div className="h-3 w-4/6 bg-zinc-800 rounded" />
                </div>
                <div className="rounded-lg bg-zinc-800/50 border border-zinc-700/50 p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    <div className="h-2.5 w-16 bg-blue-400/20 rounded" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-full bg-zinc-700/50 rounded" />
                    <div className="h-2 w-3/4 bg-zinc-700/50 rounded" />
                  </div>
                </div>
                <div className="rounded-lg bg-[#0d1117] p-3 font-mono text-xs">
                  <div className="text-zinc-500">
                    {"// "}
                    <span className="text-green-400">Install BlinkBook SDK</span>
                  </div>
                  <div className="text-blue-400">npm install @blinkbook/sdk</div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </header>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section className="border-y border-zinc-800/50 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm text-zinc-500">
          <span>
            Built by the team behind{" "}
            <a
              href="https://goblink.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              goBlink
            </a>
          </span>
          <span className="hidden sm:block text-zinc-700">|</span>
          <span>Flat pricing — no per-seat fees</span>
          <span className="hidden sm:block text-zinc-700">|</span>
          <span>Free tier available</span>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 sm:py-32">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            Everything you need to ship great docs
          </h2>
          <p className="text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
            A complete documentation platform — editor, hosting, search, analytics — all in one place.
          </p>
        </Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Section key={f.title} delay={i * 50}>
                <div
                  className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all h-full cursor-default"
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4 transition-colors ${
                      hoveredFeature === i
                        ? "bg-blue-600/20 text-blue-400"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Section>
            );
          })}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="max-w-4xl mx-auto px-6 py-24 sm:py-32">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            Up and running in minutes
          </h2>
          <p className="text-zinc-400 text-center mb-16 max-w-xl mx-auto">
            Three steps from zero to published docs.
          </p>
        </Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <Section key={s.title} delay={i * 100}>
                <div className="relative text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 border border-blue-500/20 mb-5">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight className="hidden md:block absolute top-7 -right-4 w-5 h-5 text-zinc-700" />
                  )}
                  <div className="text-xs font-mono text-blue-400/60 mb-2">Step {s.step}</div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </Section>
            );
          })}
        </div>
      </section>

      {/* ═══ EDITOR SHOWCASE ═══ */}
      <section className="max-w-5xl mx-auto px-6 py-24 sm:py-32">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            A block editor you&apos;ll actually enjoy
          </h2>
          <p className="text-zinc-400 text-center mb-16 max-w-2xl mx-auto">
            Powered by Tiptap. Slash commands, drag-and-drop, rich embeds — write docs the way you write notes.
          </p>
        </Section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Editor mock */}
          <Section delay={0}>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <span className="text-[11px] text-zinc-600 ml-2">Editor</span>
              </div>
              <div className="p-5 space-y-4 min-h-[320px]">
                {/* Heading block */}
                <div className="flex items-start gap-2 group">
                  <GripVertical className="w-4 h-4 text-zinc-700 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  <div>
                    <div className="text-xl font-bold text-white">Getting Started</div>
                  </div>
                </div>
                {/* Paragraph block */}
                <div className="flex items-start gap-2 group">
                  <GripVertical className="w-4 h-4 text-zinc-700 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Welcome to your documentation space. Use{" "}
                    <kbd className="px-1.5 py-0.5 text-xs rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                      /
                    </kbd>{" "}
                    to insert blocks.
                  </p>
                </div>
                {/* Callout block */}
                <div className="flex items-start gap-2 group">
                  <GripVertical className="w-4 h-4 text-zinc-700 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  <div className="flex-1 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-blue-300/80">
                        Pro tip: Drag blocks to reorder them, or use keyboard shortcuts.
                      </p>
                    </div>
                  </div>
                </div>
                {/* Code block */}
                <div className="flex items-start gap-2 group">
                  <GripVertical className="w-4 h-4 text-zinc-700 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  <div className="flex-1 rounded-lg bg-[#0d1117] p-3 font-mono text-xs">
                    <div className="text-zinc-500 mb-1">typescript</div>
                    <div>
                      <span className="text-violet-400">const</span>{" "}
                      <span className="text-blue-300">sdk</span>{" "}
                      <span className="text-zinc-500">=</span>{" "}
                      <span className="text-yellow-300">new</span>{" "}
                      <span className="text-green-400">goBlink Book</span>
                      <span className="text-zinc-400">()</span>
                    </div>
                  </div>
                </div>
                {/* Slash command hint */}
                <div className="flex items-center gap-2 text-zinc-600 text-sm">
                  <Slash className="w-3.5 h-3.5" />
                  <span>Type / for commands...</span>
                </div>
              </div>
            </div>
          </Section>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {editorBlocks.map((block, i) => {
              const Icon = block.icon;
              return (
                <Section key={block.label} delay={i * 60}>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-700 transition-colors">
                    <Icon className="w-5 h-5 text-zinc-500 mb-3" />
                    <div className="text-sm font-medium mb-1">{block.label}</div>
                    <div className="text-xs text-zinc-500">{block.desc}</div>
                  </div>
                </Section>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ COMPARISON TABLE ═══ */}
      <section className="max-w-5xl mx-auto px-6 py-24 sm:py-32">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            How goBlink Book compares
          </h2>
          <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
            The best of hosted and self-hosted, without the trade-offs.
          </p>
        </Section>
        <Section>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-900/80 border-b border-zinc-800">
                  <th className="text-left px-5 py-4 font-semibold text-zinc-300 w-[180px]">
                    Feature
                  </th>
                  <th className="px-5 py-4 font-semibold text-center">
                    <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                      goBlink Book
                    </span>
                  </th>
                  <th className="px-5 py-4 font-semibold text-zinc-500 text-center">GitBook</th>
                  <th className="px-5 py-4 font-semibold text-zinc-500 text-center">Mintlify</th>
                  <th className="px-5 py-4 font-semibold text-zinc-500 text-center">Docusaurus</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-zinc-800/50 ${
                      i % 2 === 0 ? "bg-zinc-900/20" : ""
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-zinc-300">{row.feature}</td>
                    <td className="px-5 py-3 text-center">
                      <BlinkBookCell value={row.blinkbook} />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <ComparisonCell value={row.gitbook} />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <ComparisonCell value={row.mintlify} />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <ComparisonCell value={row.docusaurus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </section>

      {/* ═══ PRICING PREVIEW ═══ */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24 sm:py-32">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            Simple, flat pricing
          </h2>
          <p className="text-zinc-400 text-center mb-16 max-w-xl mx-auto">
            No per-seat charges. One price covers your entire team.
          </p>
        </Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier, i) => (
            <Section key={tier.name} delay={i * 80}>
              <div
                className={`relative rounded-2xl border p-7 flex flex-col h-full ${
                  tier.highlighted
                    ? "border-blue-500/50 bg-zinc-900 shadow-lg shadow-blue-600/5"
                    : "border-zinc-800 bg-zinc-900/50"
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-full">
                      {tier.badge}
                    </span>
                  </div>
                )}
                <h3 className="text-base font-semibold text-white mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-zinc-500 text-sm">{tier.period}</span>
                </div>
                <p className="text-sm text-zinc-500 mb-6">{tier.description}</p>

                <Link
                  href={tier.ctaHref}
                  className={`block text-center py-2.5 px-4 rounded-lg font-medium text-sm transition mb-6 ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                  }`}
                >
                  {tier.cta}
                </Link>

                <div className="space-y-2.5 flex-1">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-400/70 mt-0.5 shrink-0" />
                      <span className="text-sm text-zinc-400">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          ))}
        </div>
        <Section delay={300}>
          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              View full pricing & comparison
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Section>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/5 to-transparent pointer-events-none" />
        <Section className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5">
            Ready to ship better docs?
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            Join goBlink Book and get your documentation live in minutes. Free to start, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800/60 hover:border-zinc-600 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </Section>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-zinc-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
                goBlink Book
              </span>
              <span className="text-sm text-zinc-600 ml-2">
                A{" "}
                <a
                  href="https://goblink.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  goBlink
                </a>{" "}
                product
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="https://goblink.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                goblink.io
              </a>
              <a
                href="https://merchant.goblink.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                merchant.goblink.io
              </a>
              <a
                href="https://github.com/Urban-Blazer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="text-center mt-8 text-xs text-zinc-700">
            &copy; {new Date().getFullYear()} goBlink. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
