<div align="center">
  <h1>BlinkBook</h1>
  <p><strong>Beautiful documentation sites in minutes, not months.</strong></p>
  <p>A white-label documentation framework built with Next.js 14+, TypeScript, Tailwind CSS, and MDX.<br/>The open-source alternative to GitBook, Mintlify, and Docusaurus.</p>
</div>

---

## Features

- **Single Config File** — Brand colors, logo, features, and navigation all controlled from `blinkbook.config.ts`
- **MDX Powered** — Write docs in Markdown with JSX components (callouts, code tabs, API playgrounds, Mermaid diagrams)
- **Full-Text Search** — Instant client-side search powered by FlexSearch with keyboard navigation
- **Syntax Highlighting** — Beautiful code blocks via Shiki with 100+ language support and copy button
- **Interactive API Playground** — Let users test API endpoints directly from your docs
- **Mermaid Diagrams** — Render flowcharts, sequence diagrams, and more from code blocks
- **Feedback Widget** — "Was this helpful?" on every page with localStorage persistence
- **Version Switcher** — Dropdown version selector in the header for multi-version docs
- **Dark Theme** — Stunning dark mode UI with fully customizable color system via CSS variables
- **Mobile First** — Responsive sidebar drawer, full-screen search, touch-friendly targets (44px min)
- **Static Generation** — Pre-rendered at build time for blazing-fast page loads
- **SEO Ready** — Auto-generated metadata, Open Graph tags, and semantic HTML

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-org/blinkbook.git my-docs
cd my-docs

# 2. Configure your brand
# Edit blinkbook.config.ts with your name, colors, logo, and links

# 3. Install & run
pnpm install
pnpm dev
```

Your docs site is now running at `http://localhost:3000`.

## Screenshots

> Add screenshots of your documentation site here.

## Project Structure

```
blinkbook/
├── blinkbook.config.ts          # All branding, theme, and feature settings
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (injects CSS variables from config)
│   │   ├── page.tsx             # Home page (redirects to /docs)
│   │   ├── globals.css          # Global styles + Tailwind theme
│   │   ├── docs/
│   │   │   ├── layout.tsx       # Docs layout (header, sidebar, TOC, footer)
│   │   │   └── [...slug]/page.tsx  # Dynamic doc page renderer
│   │   └── api/search/route.ts  # Search index API
│   ├── components/docs/
│   │   ├── header.tsx           # Top navigation bar
│   │   ├── sidebar.tsx          # Left navigation sidebar
│   │   ├── toc.tsx              # Table of contents (right sidebar)
│   │   ├── search.tsx           # Search dialog (Cmd+K)
│   │   ├── code-block.tsx       # Code block with copy button
│   │   ├── code-tabs.tsx        # Multi-language code tabs
│   │   ├── callout.tsx          # Info/Warning/Danger callouts
│   │   ├── breadcrumbs.tsx      # Breadcrumb navigation
│   │   ├── pagination.tsx       # Previous/Next page links
│   │   ├── api-playground.tsx   # Interactive API testing widget
│   │   ├── mermaid.tsx          # Mermaid diagram renderer
│   │   ├── feedback.tsx         # "Was this helpful?" widget
│   │   ├── version-switcher.tsx # Version dropdown
│   │   └── mdx-components.tsx   # MDX component registry
│   ├── config/navigation.ts     # Sidebar navigation structure
│   ├── lib/mdx.ts               # MDX compilation utilities
│   └── content/                 # Your MDX documentation files
└── package.json
```

## Configuration Reference

All configuration lives in `blinkbook.config.ts` at the project root.

### Site Settings

| Option | Type | Description |
|--------|------|-------------|
| `name` | `string` | Site name shown in header and footer |
| `tagline` | `string` | Shown next to the site name in the header |
| `title` | `string` | Full page title for SEO (`<title>` tag) |
| `description` | `string` | Site description for SEO meta tags |
| `url` | `string` | Base URL of the deployed site |

### Logo

| Option | Type | Description |
|--------|------|-------------|
| `logo.icon` | `string \| null` | Lucide icon name (e.g., `"Zap"`, `"Book"`) |
| `logo.gradient.from` | `string` | Gradient start color for icon background |
| `logo.gradient.to` | `string` | Gradient end color for icon background |
| `logo.logoUrl` | `string \| null` | Custom logo image URL (used if `icon` is null) |

### Theme

| Option | Type | Description |
|--------|------|-------------|
| `theme.primary` | `string` | Primary accent color (links, buttons, active states) |
| `theme.secondary` | `string` | Secondary accent color (gradients, highlights) |
| `theme.background` | `string` | Page background color |
| `theme.surface` | `string` | Surface color (cards, sidebar, inputs) |
| `theme.border` | `string` | Border color |
| `theme.text.primary` | `string` | Primary text color |
| `theme.text.secondary` | `string` | Secondary/muted text color |
| `theme.text.muted` | `string` | Muted text color |

### Header

| Option | Type | Description |
|--------|------|-------------|
| `header.links` | `{ label, href }[]` | Navigation links in the header |
| `header.github` | `string \| null` | GitHub repo URL (shows icon). `null` to hide |
| `header.search` | `boolean` | Show search button in header |

### Footer

| Option | Type | Description |
|--------|------|-------------|
| `footer.text` | `string` | Footer text (left side) |
| `footer.links` | `{ label, href }[]` | Footer links (right side) |

### Features

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `features.search` | `boolean` | `true` | Full-text search |
| `features.toc` | `boolean` | `true` | Table of contents sidebar |
| `features.pagination` | `boolean` | `true` | Previous/Next page navigation |
| `features.breadcrumbs` | `boolean` | `true` | Breadcrumb navigation |
| `features.editOnGithub` | `boolean` | `false` | "Edit on GitHub" link |
| `features.copyCode` | `boolean` | `true` | Copy button on code blocks |
| `features.codeTabs` | `boolean` | `true` | Multi-language code tabs |

### Versions

| Option | Type | Description |
|--------|------|-------------|
| `versions.current` | `string` | Current version identifier (e.g., `"v1.0"`) |
| `versions.available` | `{ label, value, path }[]` | Available versions for the switcher |

### Other

| Option | Type | Description |
|--------|------|-------------|
| `contentDir` | `string` | Path to MDX content directory |
| `codeTheme` | `string` | Shiki theme name for code blocks |
| `analytics.gaId` | `string \| null` | Google Analytics measurement ID |
| `analytics.plausible` | `string \| null` | Plausible Analytics domain |

## MDX Components

Use these components in any `.mdx` file:

### Callout

```mdx
<Callout type="info" title="Note">
  This is an informational callout.
</Callout>

<Callout type="warning">
  Be careful with this operation.
</Callout>

<Callout type="danger">
  This action is irreversible.
</Callout>
```

Types: `info` (blue), `warning` (amber), `danger` (red).

### CodeTabs

```mdx
<CodeTabs tabs={[
  { label: "JavaScript", children: <pre><code>console.log("hello")</code></pre> },
  { label: "Python", children: <pre><code>print("hello")</code></pre> },
]} />
```

### ApiPlayground

```mdx
<ApiPlayground
  method="POST"
  endpoint="/api/v1/payments"
  baseUrl="https://api.example.com"
  headers={{ "Authorization": "Bearer YOUR_API_KEY" }}
  bodySchema={[
    { name: "amount", type: "number", required: true, placeholder: "1000" },
    { name: "currency", type: "string", required: true, placeholder: "USD" },
    { name: "metadata", type: "json", placeholder: '{"order_id": "123"}' },
  ]}
/>
```

### Mermaid

```mdx
<Mermaid chart="graph TD; A[Start]-->B[Process]; B-->C[End];" />
```

## Comparison

| Feature | BlinkBook | GitBook | Mintlify | Docusaurus |
|---------|-----------|---------|----------|------------|
| Open Source | Yes | No | No | Yes |
| Self-Hosted | Yes | No | No | Yes |
| MDX Support | Yes | No | Yes | Yes |
| Single Config File | Yes | No | Yes | Partial |
| API Playground | Yes | No | Yes | Plugin |
| Mermaid Diagrams | Yes | Yes | Yes | Plugin |
| Full-Text Search | Yes | Yes | Yes | Plugin |
| Version Switcher | Yes | Yes | Yes | Yes |
| Feedback Widget | Yes | No | Yes | No |
| White-Label | Yes | Paid | Paid | Yes |
| Framework | Next.js 14+ | Proprietary | Next.js | React/Docusaurus |
| Styling | Tailwind CSS | Proprietary | Tailwind CSS | CSS Modules |

## Adding Content

1. Create `.mdx` files in `src/content/`
2. Add frontmatter with `title` and `description`
3. Update `src/config/navigation.ts` with the new page

```mdx
---
title: My New Page
description: A brief description of this page.
---

# My New Page

Content goes here. Use any MDX component listed above.
```

## Deployment

BlinkBook generates a static site that can be deployed anywhere:

```bash
pnpm build    # Build for production
pnpm start    # Preview the production build
```

Deploy to **Vercel**, **Netlify**, **Cloudflare Pages**, or any static hosting.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License. See [LICENSE](LICENSE) for details.
