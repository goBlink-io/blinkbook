/**
 * BlinkBook Configuration
 * 
 * Customize your documentation site by editing this file.
 * All branding, navigation, and content settings are controlled here.
 */

export const config = {
  /** Site name — shown in header, tab title, and footer */
  name: "goBlink",

  /** Tagline — shown on the docs landing page */
  tagline: "Documentation",

  /** Full site title for SEO */
  title: "goBlink Documentation",

  /** Site description for SEO */
  description: "Everything you need to build with goBlink — guides, API reference, and SDK documentation.",

  /** Base URL of the deployed docs site */
  url: "https://docs.goblink.io",

  /** Logo configuration */
  logo: {
    /** Use a Lucide icon name, or set to null to use logoUrl instead */
    icon: "Zap",
    /** Gradient colors for the icon background */
    gradient: { from: "#2563eb", to: "#7c3aed" },
    /** URL to a custom logo image (used if icon is null) */
    logoUrl: null as string | null,
  },

  /** Theme colors */
  theme: {
    /** Primary accent color (buttons, links, active states) */
    primary: "#2563eb",
    /** Secondary accent color (gradients, highlights) */
    secondary: "#7c3aed",
    /** Background color */
    background: "#09090b",
    /** Surface color (cards, sidebar) */
    surface: "#18181b",
    /** Border color */
    border: "#27272a",
    /** Text colors */
    text: {
      primary: "#fafafa",
      secondary: "#a1a1aa",
      muted: "#71717a",
    },
  },

  /** Header links — shown in the top navigation */
  header: {
    links: [
      { label: "Website", href: "https://goblink.io" },
      { label: "Merchant", href: "https://merchant.goblink.io" },
    ],
    /** GitHub repo link (shows icon in header). Set to null to hide. */
    github: "https://github.com/Urban-Blazer/goblink" as string | null,
    /** Show search button in header */
    search: true,
  },

  /** Footer configuration */
  footer: {
    text: "Built with BlinkBook",
    links: [
      { label: "goBlink", href: "https://goblink.io" },
      { label: "Merchant", href: "https://merchant.goblink.io" },
      { label: "GitHub", href: "https://github.com/Urban-Blazer" },
    ],
  },

  /** Content directory (relative to project root) */
  contentDir: "src/content",

  /** Default code block theme (shiki theme name) */
  codeTheme: "github-dark-default",

  /** Enable/disable features */
  features: {
    /** Full-text search via FlexSearch */
    search: true,
    /** Table of contents on right sidebar */
    toc: true,
    /** Previous/Next page navigation */
    pagination: true,
    /** Breadcrumb navigation */
    breadcrumbs: true,
    /** "Edit this page on GitHub" link */
    editOnGithub: false,
    /** Copy button on code blocks */
    copyCode: true,
    /** Multi-language code tabs */
    codeTabs: true,
  },

  /** Analytics (future) */
  analytics: {
    /** Google Analytics ID */
    gaId: null as string | null,
    /** Plausible domain */
    plausible: null as string | null,
  },
} as const;

export type BlinkBookConfig = typeof config;
