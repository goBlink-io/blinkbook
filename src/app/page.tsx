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
  Type,
  GripVertical,
  Slash,
  Image,
  Table,
} from "lucide-react";
import {
  Section,
  FeatureCard,
  SmoothScrollHandler,
  GrainOverlay,
} from "@/components/landing/client-parts";

/* ─── Features data ─── */
const features = [
  {
    icon: <Blocks className="w-5 h-5" />,
    title: "Block Editor",
    desc: "Tiptap-powered block editor with slash commands, drag-and-drop, and 20+ content blocks.",
  },
  {
    icon: <Search className="w-5 h-5" />,
    title: "Instant Search",
    desc: "Client-side full-text search. Fast, zero-cost, works offline.",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Custom Domains",
    desc: "Connect your own domain with automatic SSL. Your docs, your brand.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Team Collaboration",
    desc: "Invite team members with role-based access. Admin, Editor, and Viewer roles.",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Analytics",
    desc: "Track page views, popular docs, and reader engagement. No third-party scripts.",
  },
  {
    icon: <Palette className="w-5 h-5" />,
    title: "6 Themes",
    desc: "Pick from Midnight, Ocean, Forest, Sunset, Lavender, or Arctic. Or customize your own.",
  },
  {
    icon: <Code2 className="w-5 h-5" />,
    title: "Code Blocks",
    desc: "Syntax-highlighted code with copy button, multi-language tabs, and inline formatting.",
  },
  {
    icon: <DollarSign className="w-5 h-5" />,
    title: "Flat Pricing",
    desc: "No per-seat fees. One price covers your whole team. Start free, upgrade when ready.",
  },
];

/* ─── How it works ─── */
const steps = [
  { step: "1", title: "Sign up", desc: "Create your free account in seconds. No credit card required." },
  { step: "2", title: "Create your space", desc: "Pick a template, choose a theme, and start writing with our block editor." },
  { step: "3", title: "Publish", desc: "Hit publish and your docs are live. Add a custom domain when you're ready." },
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
  { feature: "Block editor", blinkbook: CHECK, gitbook: CHECK, mintlify: CHECK, docusaurus: CROSS },
  { feature: "Custom domains", blinkbook: CHECK, gitbook: CHECK, mintlify: CHECK, docusaurus: CHECK },
  { feature: "Instant search", blinkbook: CHECK, gitbook: CHECK, mintlify: CHECK, docusaurus: CHECK },
  { feature: "Team collaboration", blinkbook: CHECK, gitbook: CHECK, mintlify: CHECK, docusaurus: CROSS },
  { feature: "Analytics", blinkbook: CHECK, gitbook: CHECK, mintlify: CHECK, docusaurus: CROSS },
  { feature: "Themes", blinkbook: "6 built-in", gitbook: "Limited", mintlify: "Limited", docusaurus: "Custom only" },
  { feature: "Flat pricing", blinkbook: CHECK, gitbook: CROSS, mintlify: CROSS, docusaurus: "N/A" },
  { feature: "Starting price", blinkbook: "Free", gitbook: "$10/user/mo", mintlify: "$300/mo", docusaurus: "Free (DIY)" },
  { feature: "No per-seat fees", blinkbook: CHECK, gitbook: CROSS, mintlify: CHECK, docusaurus: "N/A" },
  { feature: "AI-ready (llms.txt)", blinkbook: CHECK, gitbook: CROSS, mintlify: CROSS, docusaurus: CROSS },
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
    cta: "Go Pro",
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
    cta: "Go Team",
    ctaHref: "/signup?plan=team",
    highlighted: false,
    features: [
      "10 spaces, 10 team members",
      "250K pageviews/mo",
      "Role-based access",
      "Token-gated pages (coming soon)",
      "Content monetization (coming soon)",
    ],
  },
  {
    name: "Business",
    price: "$99",
    period: "/mo",
    description: "Scale, control, and white-label.",
    cta: "Go Business",
    ctaHref: "/signup?plan=business",
    highlighted: false,
    badge: "Best Value",
    features: [
      "Unlimited spaces & pages",
      "1M pageviews/mo",
      "25 team members",
      "White-label rebrand",
      "Priority support",
    ],
  },
];

function ComparisonCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-4 h-4 text-green-400 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-slate-600 mx-auto" />;
  return <span className="text-slate-400 text-xs">{value}</span>;
}

function BlinkBookCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-4 h-4 text-green-400 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-red-400 mx-auto" />;
  return <span className="text-blue-400 text-xs font-medium">{value}</span>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      <SmoothScrollHandler />
      <GrainOverlay />

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
          <Link href="/" className="text-lg font-bold tracking-tight text-white">
            goBlink Book
          </Link>
          <div className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
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
              className="text-sm text-slate-400 hover:text-white transition-colors"
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
          <h1
            className="font-bold tracking-tight mb-6 leading-[1.1] text-white"
            style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}
          >
            Documentation that{" "}
            <span className="font-extrabold">ships with you</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
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
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800/60 hover:border-slate-600 transition-all"
            >
              See Demo
            </a>
          </div>
        </Section>

        {/* Editor mockup */}
        <Section className="max-w-4xl mx-auto mt-16" delay={200}>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 shadow-2xl shadow-blue-900/10 overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-900">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
              <span className="text-xs text-slate-500 ml-2">my-docs.book.goblink.io</span>
            </div>
            {/* Editor body */}
            <div className="flex min-h-[280px]">
              {/* Sidebar */}
              <div className="w-48 border-r border-slate-800 p-4 hidden sm:block">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
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
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {page}
                      </div>
                    )
                  )}
                </div>
              </div>
              {/* Content — real formatted text, not skeleton bars */}
              <div className="flex-1 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-300 mb-3">Getting Started</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-1">
                  Welcome to your documentation space. This guide walks you through
                </p>
                <p className="text-sm text-slate-500 leading-relaxed mb-5">
                  setup, configuration, and publishing your first page.
                </p>
                <div className="rounded-lg border-l-2 border-blue-500 bg-blue-500/5 p-3 mb-5">
                  <p className="text-sm text-blue-300/80">
                    Tip: Use the block editor to drag and drop content, or type{" "}
                    <code className="px-1 py-0.5 text-xs rounded bg-slate-800 border border-slate-700 text-slate-300">/</code>{" "}
                    for slash commands.
                  </p>
                </div>
                <div className="rounded-lg bg-[#0d1117] p-3 font-mono text-xs">
                  <div className="text-slate-500 mb-1">bash</div>
                  <div className="text-blue-400">npm install @goblink/sdk</div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </header>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section className="border-y border-slate-800/50 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm text-slate-500">
          <span>
            A{" "}
            <a
              href="https://goblink.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              goBlink
            </a>{" "}
            product
          </span>
          <span className="hidden sm:block text-slate-700">·</span>
          <span>Free to start</span>
          <span className="hidden sm:block text-slate-700">·</span>
          <span>No credit card required</span>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24 sm:py-32">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            Everything you need to ship great docs
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            A complete documentation platform — editor, hosting, search, analytics — all in one place.
          </p>
        </Section>
        {/* Hero features — top row, 2 large cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {features.slice(0, 2).map((f, i) => (
            <Section key={f.title} delay={i * 50}>
              <FeatureCard icon={f.icon} title={f.title} desc={f.desc} />
            </Section>
          ))}
        </div>
        {/* Remaining features — 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.slice(2).map((f, i) => (
            <Section key={f.title} delay={(i + 2) * 50}>
              <FeatureCard icon={f.icon} title={f.title} desc={f.desc} />
            </Section>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="max-w-4xl mx-auto px-6 py-24 sm:py-32">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            Up and running in minutes
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-xl mx-auto">
            Three steps from zero to published docs.
          </p>
        </Section>

        {/* Desktop: horizontal connected steps */}
        <Section>
          <div className="hidden md:grid grid-cols-3 gap-0 relative">
            {/* Connecting line */}
            <div className="absolute top-7 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] border-t-2 border-dashed border-slate-800" />
            {steps.map((s) => (
              <div key={s.title} className="flex flex-col items-center text-center px-6">
                <div className="w-14 h-14 rounded-full border-2 border-slate-800 bg-slate-950 flex items-center justify-center text-lg font-bold text-white mb-4 relative z-10">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed text-left">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Mobile: vertical timeline */}
          <div className="md:hidden relative pl-10">
            {/* Vertical connecting line */}
            <div className="absolute top-7 bottom-7 left-[18px] border-l-2 border-dashed border-slate-800" />
            <div className="space-y-10">
              {steps.map((s) => (
                <div key={s.title} className="relative">
                  <div className="absolute -left-10 top-0 w-9 h-9 rounded-full border-2 border-slate-800 bg-slate-950 flex items-center justify-center text-sm font-bold text-white">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </section>

      {/* ═══ EDITOR SHOWCASE ═══ */}
      <section className="max-w-5xl mx-auto px-6 py-24 sm:py-32">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            A block editor you&apos;ll actually enjoy
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Powered by Tiptap. Slash commands, drag-and-drop, rich embeds — write docs the way you write notes.
          </p>
        </Section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Editor mock */}
          <Section delay={0}>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                </div>
                <span className="text-[11px] text-slate-600 ml-2">Editor</span>
              </div>
              <div className="p-5 space-y-4 min-h-[320px]">
                {/* Heading block */}
                <div className="flex items-start gap-2 group">
                  <GripVertical className="w-4 h-4 text-slate-700 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  <div className="text-xl font-bold text-white">Getting Started</div>
                </div>
                {/* Paragraph block */}
                <div className="flex items-start gap-2 group">
                  <GripVertical className="w-4 h-4 text-slate-700 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Welcome to your documentation space. Use{" "}
                    <kbd className="px-1.5 py-0.5 text-xs rounded bg-slate-800 border border-slate-700 text-slate-300">
                      /
                    </kbd>{" "}
                    to insert blocks.
                  </p>
                </div>
                {/* Callout block */}
                <div className="flex items-start gap-2 group">
                  <GripVertical className="w-4 h-4 text-slate-700 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  <div className="flex-1 rounded-lg border-l-2 border-blue-500 bg-blue-500/5 p-3">
                    <p className="text-sm text-blue-300/80">
                      Pro tip: Drag blocks to reorder them, or use keyboard shortcuts.
                    </p>
                  </div>
                </div>
                {/* Code block */}
                <div className="flex items-start gap-2 group">
                  <GripVertical className="w-4 h-4 text-slate-700 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  <div className="flex-1 rounded-lg bg-[#0d1117] p-3 font-mono text-xs">
                    <div className="text-slate-500 mb-1">javascript</div>
                    <div>
                      <span className="text-violet-400">const</span>{" "}
                      <span className="text-blue-300">config</span>{" "}
                      <span className="text-slate-500">=</span>{" "}
                      <span className="text-slate-400">{"{"}</span>{" "}
                      <span className="text-green-400">theme</span>
                      <span className="text-slate-500">:</span>{" "}
                      <span className="text-amber-300">&quot;midnight&quot;</span>{" "}
                      <span className="text-slate-400">{"}"}</span>
                    </div>
                  </div>
                </div>
                {/* Slash command hint */}
                <div className="flex items-center gap-2 text-slate-600 text-sm">
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
                  <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-colors">
                    <Icon className="w-5 h-5 text-slate-500 mb-3" />
                    <div className="text-sm font-medium mb-1">{block.label}</div>
                    <div className="text-xs text-slate-400">{block.desc}</div>
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
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            The best of hosted and self-hosted, without the trade-offs.
          </p>
        </Section>
        <Section>
          <div className="relative">
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800">
                    <th className="text-left px-5 py-4 font-semibold text-slate-300 w-[180px]">
                      Feature
                    </th>
                    <th className="px-5 py-4 font-semibold text-center text-blue-400">
                      goBlink Book
                    </th>
                    <th className="px-5 py-4 font-semibold text-slate-500 text-center">GitBook</th>
                    <th className="px-5 py-4 font-semibold text-slate-500 text-center">Mintlify</th>
                    <th className="px-5 py-4 font-semibold text-slate-500 text-center">Docusaurus</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={`border-b border-slate-800/50 ${
                        i % 2 === 0 ? "bg-slate-900/20" : ""
                      }`}
                    >
                      <td className="px-5 py-3 font-medium text-slate-300">{row.feature}</td>
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
            {/* Scroll fade hint on right edge — mobile only */}
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none rounded-r-xl md:hidden" />
          </div>
          <p className="text-center text-xs text-slate-600 mt-3 md:hidden">
            Swipe to compare &rarr;
          </p>
        </Section>
      </section>

      {/* ═══ PRICING PREVIEW ═══ */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-24 sm:py-32">
        <Section>
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            Simple, flat pricing
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-xl mx-auto">
            No per-seat charges. One price covers your entire team.
          </p>
        </Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier, i) => (
            <Section key={tier.name} delay={i * 80}>
              <div
                className={`relative rounded-2xl border p-7 flex flex-col h-full ${
                  tier.highlighted
                    ? "border-blue-400/30 bg-slate-900 shadow-lg shadow-blue-500/10"
                    : "border-slate-800 bg-slate-900/50"
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
                  <span className="text-slate-500 text-sm">{tier.period}</span>
                </div>
                <p className="text-sm text-slate-400 mb-6">{tier.description}</p>

                <Link
                  href={tier.ctaHref}
                  className={`block text-center py-2.5 px-4 rounded-lg font-medium text-sm transition mb-6 ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  {tier.cta}
                </Link>

                <div className="space-y-2.5 flex-1">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-400/70 mt-0.5 shrink-0" />
                      <span className="text-sm text-slate-400">{f}</span>
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
              className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
            >
              View full pricing & comparison
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Section>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-24 sm:py-32">
        <Section className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5">
            Your docs deserve better.
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
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
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800/60 hover:border-slate-600 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </Section>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-sm font-bold text-white">
                goBlink Book
              </span>
              <span className="text-sm text-slate-600 ml-2">
                A{" "}
                <a
                  href="https://goblink.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-white transition-colors"
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
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                goblink.io
              </a>
              <a
                href="https://merchant.goblink.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                merchant.goblink.io
              </a>
              <a
                href="https://github.com/goBlink-io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="text-center mt-8 text-xs text-slate-700">
            &copy; {new Date().getFullYear()} goBlink. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
