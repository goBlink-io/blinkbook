# BlinkBook SaaS — Full Build Plan

## Architecture

**URL:** blinkbook.goblink.io
**Stack:** Next.js 14+ (App Router), TypeScript, Tailwind, Supabase (Auth + DB + Storage + Realtime)
**Editor:** Tiptap (block-based, extensible, MIT licensed)

## Route Structure

### Public
- `/` — Landing page + marketing
- `/pricing` — Plans & billing comparison
- `/templates` — Browse theme gallery
- `/login` — Sign in (email, Google, GitHub)
- `/signup` — Create account

### Dashboard (authenticated)
- `/dashboard` — Your spaces (docs sites)
- `/dashboard/new` — Create new space wizard
- `/dashboard/[siteId]` — Space overview (pages, analytics summary)
- `/dashboard/[siteId]/editor/[pageId]` — Block editor
- `/dashboard/[siteId]/pages` — Page list + drag-to-reorder nav tree
- `/dashboard/[siteId]/settings` — Branding, theme, custom domain, SEO
- `/dashboard/[siteId]/analytics` — Page views, search queries, feedback
- `/dashboard/account` — Profile, password, API keys
- `/dashboard/billing` — Subscription, invoices, upgrade/downgrade
- `/dashboard/team` — Members, invitations, roles

### Published Sites
- `[slug].blinkbook.goblink.io` — Published docs site
- Custom domains via CNAME mapping

## Database Schema (Supabase)

### Tables
- **users** — id, email, name, avatar_url, plan, created_at
- **spaces** — id, user_id, name, slug, description, theme (jsonb), logo_url, custom_domain, is_published, created_at, updated_at
- **pages** — id, space_id, title, slug, content (jsonb — Tiptap doc), parent_id (nullable, for nesting), position (int, for ordering), is_published, created_at, updated_at
- **page_versions** — id, page_id, content (jsonb), created_at (auto-save history)
- **team_members** — id, space_id, user_id, role (admin/editor/viewer), invited_at, accepted_at
- **invitations** — id, space_id, email, role, token, expires_at, accepted
- **feedback** — id, space_id, page_id, helpful (bool), comment, visitor_id, created_at
- **analytics** — id, space_id, page_id, event (pageview/search), metadata (jsonb), created_at
- **subscriptions** — id, user_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end, created_at

### RLS Policies
- Users can only access their own spaces + spaces they're team members of
- Viewers can read, editors can read+write pages, admins can manage settings+team
- Published pages are publicly readable

## Phase A: Auth + Dashboard + Spaces (2-3 days)

### Supabase Setup
- Init Supabase project (or use existing goBlink Supabase)
- Migration 00001: users, spaces, pages, team_members tables
- RLS policies for all tables
- Supabase Auth: email + Google + GitHub providers

### Auth Pages
- `/login` — email/password + OAuth buttons (Google, GitHub)
- `/signup` — create account form
- `/auth/callback` — OAuth callback handler
- Middleware: protect /dashboard/* routes

### Dashboard
- `/dashboard` — grid of space cards (name, page count, status, last edited)
- Empty state: "Create your first docs site" CTA
- `/dashboard/new` — wizard:
  1. Site name + slug (auto-generate slug from name)
  2. Pick theme preset (6 visual cards)
  3. Optional: upload logo
  4. Create → redirects to space overview

### Space Settings
- `/dashboard/[siteId]/settings` — tabs:
  - General: name, slug, description
  - Branding: theme picker, logo upload, favicon
  - Domain: custom domain instructions + CNAME verification
  - Danger zone: delete space

## Phase B: Block Editor + Navigation (3-4 days)

### Editor Stack
- **Tiptap** — headless, extensible block editor (MIT)
- Custom extensions for docs-specific blocks

### Block Types
- Paragraph (default)
- Headings (H1-H4)
- Code Block (language selector, syntax highlighting via Shiki)
- Callout (info/warning/danger/success — colored sidebar blocks)
- API Playground (method, endpoint, headers, body fields, try-it)
- Image (upload to Supabase Storage, drag to resize)
- Table (basic rows/cols)
- Mermaid Diagram (code input → rendered preview)
- Tabs (named tab groups with content per tab)
- Divider (horizontal rule)
- Blockquote

### Slash Command Menu
- Type `/` anywhere → dropdown of all block types
- Search/filter by typing

### Markdown Shortcuts
- `##` → H2, `###` → H3
- `>` → blockquote
- ``` → code block
- `---` → divider
- `- ` → bullet list
- `1. ` → ordered list

### Navigation Builder
- `/dashboard/[siteId]/pages` — tree view of all pages
- Drag-and-drop to reorder + nest (parent/child)
- Click to rename, right-click context menu (duplicate, delete, move)
- "New Page" button at top + inline between items
- Tree structure maps to sidebar navigation on published site

### Auto-Save
- Debounced save (500ms after last keystroke)
- Save indicator: "Saved" / "Saving..." in editor toolbar
- Page versions table for history (keep last 50 versions per page)

## Phase C: Publishing Pipeline (2-3 days)

### Publish Flow
- "Publish" button in space settings or editor toolbar
- On publish:
  1. Fetch all published pages from Supabase
  2. Render each page's Tiptap JSON → HTML using server-side Tiptap renderer
  3. Wrap in BlinkBook layout (sidebar from page tree, theme from space config)
  4. Deploy as static pages (or ISR via Next.js)
  5. Available at [slug].blinkbook.goblink.io

### Published Site Rendering
- `/sites/[slug]/[[...path]]` — catch-all route
- Looks up space by slug, fetches page tree + content
- Renders with BlinkBook components (sidebar, TOC, search, etc.)
- Caches aggressively (revalidate on publish)

### Custom Domains
- Settings UI: enter domain, shows CNAME record to add
- Verify CNAME via DNS lookup
- Vercel handles SSL + routing for custom domains

### Search Index
- On publish, build FlexSearch index from all page content
- Serve as JSON, loaded client-side on published site

## Phase D: Billing + Teams (1-2 days)

### Stripe Integration
- Products:
  - Free: 1 space, 20 pages, blinkbook.goblink.io subdomain
  - Pro ($12/mo): unlimited spaces, unlimited pages, custom domain, analytics, remove "Built with BlinkBook"
  - Team ($29/mo): everything in Pro + 5 team members, roles, priority support
- Checkout via Stripe Checkout Sessions
- Webhook handler for subscription events
- Billing portal for managing subscription

### Team Management
- Invite by email → sends invitation link
- Roles: Admin (full access), Editor (create/edit pages), Viewer (read-only)
- Team members see shared spaces in their dashboard

## Phase E: Polish + Launch (1-2 days)

### Analytics Dashboard
- Page views over time (chart)
- Most viewed pages (table)
- Search queries (what are people looking for?)
- Feedback summary (helpful vs not helpful per page)

### SEO
- Auto-generate sitemap.xml for published sites
- Open Graph tags per page
- JSON-LD structured data

### Misc
- Email notifications (welcome, invitation, publish confirmation)
- Onboarding tour for new users
- Keyboard shortcuts in editor
- Export space as MDX/markdown zip
- Import from GitBook/Notion/Markdown
