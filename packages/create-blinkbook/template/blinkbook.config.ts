/**
 * BlinkBook Configuration
 *
 * Customize your documentation site by editing this file.
 * All branding, navigation, and content settings are controlled here.
 */

export const config = {
  /** Site name — shown in header, tab title, and footer */
  name: "My Docs",

  /** Tagline — shown on the docs landing page */
  tagline: "Documentation",

  /** Full site title for SEO */
  title: "My Docs",

  /** Site description for SEO */
  description: "Documentation powered by BlinkBook.",

  /** Base URL of the deployed docs site */
  url: "https://example.com",

  /** Logo configuration */
  logo: {
    /** Use a Lucide icon name, or set to null to use logoUrl instead */
    icon: "BookOpen",
    /** Gradient colors for the icon background */
    gradient: { from: "#2563eb", to: "#7c3aed" },
    /** URL to a custom logo image (used if icon is null) */
    logoUrl: null as string | null,
  },

  // Use a preset name ('midnight' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'arctic') or a custom object
  theme: "midnight" as string | {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    border: string;
    text: { primary: string; secondary: string; muted: string };
  },

  /** Header links — shown in the top navigation */
  header: {
    links: [] as { label: string; href: string }[],
    /** GitHub repo link (shows icon in header). Set to null to hide. */
    github: null as string | null,
    /** Show search button in header */
    search: true,
  },

  /** Footer configuration */
  footer: {
    text: "Built with BlinkBook",
    links: [] as { label: string; href: string }[],
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

  /** Version switcher */
  versions: {
    current: "v1.0",
    available: [
      { label: "v1.0 (Latest)", value: "v1.0", path: "/docs" },
    ],
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
