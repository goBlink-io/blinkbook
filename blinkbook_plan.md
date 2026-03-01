# BlinkBook — Product Plan

## Vision
GitBook alternative. Open-source, self-hosted, white-label documentation framework. Faster, more customizable, zero vendor lock-in.

## Deployment Models

### Model 1: Template (Phase 1)
Clone → edit `blinkbook.config.ts` → drop MDX → deploy to Vercel. One-time purchase or free/open-source.

### Model 2: Hosted SaaS (Phase 2)
blinkbook.io — sign up, connect GitHub repo, deploy. Monthly subscription.

## Competitive Advantages

| Feature | GitBook | BlinkBook |
|---|---|---|
| Speed | 1-3s loads | <200ms (static + ISR) |
| Search | Basic | Instant fuzzy (FlexSearch) + AI (future) |
| Customization | Shallow | Full — it's your Next.js app |
| Pricing | Per-seat ($8-30/user/mo) | Flat rate or self-hosted free |
| Self-hosted | No | Yes |
| API Playground | No | Interactive "Try it" blocks |
| AI Search | No | RAG over your docs (future) |
| Code blocks | Basic | Multi-lang tabs, copy, run |
| Analytics | Basic | Plausible/PostHog built-in |
| Export | Painful | It's already markdown files |
| Vendor lock-in | High | Zero — you own the repo |

## Config System

```
blinkbook.config.ts → controls everything
├── Branding (name, logo, colors, fonts)
├── Navigation (sidebar tree, header links)
├── Features (search, TOC, analytics, AI)
├── Domain (custom domain mapping)
├── Auth (public/private/password-protected)
├── Integrations (GitHub sync, webhook on publish)
└── Monetization (gated content, paywall pages)
```

## Killer Features (vs GitBook)

1. **AI-powered search** — synthesized answers, not just links
2. **Interactive API playground** — type params, hit Send, see response
3. **Component library** — callouts, tabs, accordions, embeds, Mermaid diagrams, KaTeX math
4. **Version switcher** — dropdown to switch between API versions
5. **Feedback widget** — "Was this helpful?" on every page → analytics
6. **i18n** — multi-language docs out of the box
7. **CLI** — `npx blinkbook init` scaffolds a new docs site in 30 seconds

## Phase 1: Template Product (Build Now)

- [ ] Wire `blinkbook.config.ts` into all components (branding, theme, features)
- [ ] Interactive API playground component
- [ ] Feedback widget ("Was this helpful?")
- [ ] Version switcher component
- [ ] Mermaid diagram support
- [ ] Enhanced mobile experience
- [ ] CLI: `npx blinkbook init`
- [ ] Killer README with screenshots
- [ ] Deploy docs.goblink.io using BlinkBook (dogfood)

## Phase 2: Hosted SaaS (Build Later)

- [ ] blinkbook.io landing page + marketing
- [ ] GitHub OAuth → connect repo → auto-deploy
- [ ] Custom domain management (CNAME)
- [ ] Stripe billing integration
- [ ] Dashboard (analytics, team management, settings)
- [ ] Multi-tenant architecture
- [ ] Team collaboration (roles: admin, editor, viewer)
- [ ] AI search (RAG over docs content)
- [ ] Gated/paywalled content support

## Monetization Strategy

### Template (Phase 1)
- Free/open-source core
- Premium templates/themes ($49-99 one-time)
- Sell on Gumroad, GitHub Sponsors

### SaaS (Phase 2)
- Free: 1 space, basic features
- Pro ($12/mo flat): custom domain, analytics, branding, unlimited editors
- Team ($29/mo flat): multiple spaces, team roles, priority support
- Enterprise: SSO, audit logs, SLA, dedicated support

Key differentiator: **flat pricing, not per-seat.** This alone kills GitBook for teams.

## Tech Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- MDX (@next/mdx)
- Shiki (syntax highlighting)
- FlexSearch (client-side search)
- Vercel (recommended deploy target)

## First Customer: goBlink
Deploy as docs.goblink.io. Every pain point we hit becomes a product improvement.
