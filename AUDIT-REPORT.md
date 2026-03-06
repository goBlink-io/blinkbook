# BlinkBook Security & Code Quality Audit Report

**Date:** 2026-03-06
**Scope:** Full codebase (Next.js 16 + Supabase + Tiptap + Tailwind)
**Auditor:** Automated analysis (Claude Opus 4.6)

---

## Executive Summary

BlinkBook is a hosted documentation platform with Supabase for auth/data, Tiptap for rich text editing, Stripe/crypto for billing, and token-gating for access control. The codebase has **strong fundamentals** — TypeScript strict mode is enabled, Supabase RLS is active on all tables, and Zod validation is used in most write endpoints.

However, the audit found **5 critical vulnerabilities**, primarily in the monetization/paywall system and content rendering. The paywall can be completely bypassed via cookie forgery, and stored XSS is possible through the paywall teaser rendering. The email send endpoint is unauthenticated. These issues need immediate remediation.

**Summary of findings:**
| Severity | Count |
|----------|-------|
| Critical | 5 |
| High | 8 |
| Medium | 12 |
| Low | 10 |

---

## Important Context: RLS Mitigations

All dashboard API routes use `createClient()` (`src/lib/supabase/server.ts:4-25`) which creates a server client with the **anon key** and user session cookies. Supabase RLS policies are enforced, meaning:

- `bb_spaces`: Only the owner (`user_id = auth.uid()`) can read/write their spaces (`00001_blinkbook_init.sql:72`)
- `bb_pages`: Only the space owner or team members with appropriate roles can access pages (`00001_blinkbook_init.sql:78-86`)

This means many API routes that appear to lack ownership checks are actually protected by RLS. The findings below focus on **real, exploitable issues** that RLS does NOT mitigate.

---

## CRITICAL Findings

### C1. Paywall Bypass via Cookie Forgery

**Files:**
- `src/app/api/purchases/route.ts:52-68`
- `src/app/api/verify-token-gate/route.ts:101-117`
- `src/app/sites/[slug]/[[...path]]/page.tsx:310-311`

**Issue:** Access proof cookies are base64-encoded JSON with **no cryptographic signature**. The published site page (`page.tsx:310`) checks for cookie existence to determine paywall access:

```typescript
// purchases/route.ts:53-60 — cookie is just base64 JSON
const proof = Buffer.from(
  JSON.stringify({
    purchase_id: purchase.id,
    wallet: buyer_wallet,
    content_id: paid_content_id,
    ts: Date.now(),
  })
).toString('base64');
```

An attacker can forge this cookie by base64-encoding arbitrary JSON. No HMAC or JWT signature is verified. The same pattern exists in `verify-token-gate/route.ts:103-109`.

Additionally, the purchase cookie is set **immediately on insert** (status: `'pending'`), before any payment is actually confirmed. So even without forging, submitting a purchase request with a fake `tx_hash` grants instant access.

**Impact:** Complete paywall bypass. Any user can access premium content without paying.

**Fix:** Sign cookies with HMAC-SHA256 using a server secret. Only set access cookies after payment confirmation (status: `'confirmed'`). Verify signatures on read.

---

### C2. Stored XSS in Paywall Teaser

**Files:**
- `src/app/sites/[slug]/[[...path]]/page.tsx:318-320`
- `src/components/published/paywall.tsx:78`

**Issue:** The paywall teaser is built by extracting plain text from Tiptap content and injecting it into an HTML string without escaping:

```typescript
// page.tsx:318-320
const plainText = extractPlainText(currentPage.content as TiptapDoc);
const teaserText = plainText.slice(0, 200);
teaserHtml = `<p>${teaserText}${plainText.length > 200 ? '...' : ''}</p>`;
```

This HTML is then rendered via `dangerouslySetInnerHTML` in the Paywall component:

```typescript
// paywall.tsx:78
dangerouslySetInnerHTML={{ __html: teaser }}
```

If a doc author includes text like `<img src=x onerror="alert(document.cookie)">` in their page content, it will execute as JavaScript on the published site for all visitors.

**Impact:** Stored XSS on public-facing published sites. Can steal visitor cookies, redirect to phishing, or inject malicious content.

**Fix:** HTML-escape the teaser text before embedding:
```typescript
const escaped = teaserText
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
teaserHtml = `<p>${escaped}...</p>`;
```

---

### C3. Unauthenticated Email Send Endpoint

**File:** `src/app/api/email/send/route.ts:6-48`

**Issue:** The `/api/email/send` endpoint has **no authentication**, no rate limiting, and accepts arbitrary `to` addresses:

```typescript
export async function POST(request: Request) {
  const { to, subject, template, data } = await request.json();
  // No auth check — anyone can call this
  // No rate limiting
  // Sends to any email address
```

**Impact:** Spam/phishing relay. Attackers can use this endpoint to send emails from the BlinkBook domain (`noreply@blinkbook.goblink.io`) to any address, damaging domain reputation and potentially enabling phishing attacks.

**Fix:** Add authentication check (`supabase.auth.getUser()`). Restrict `to` field to team members of the caller's spaces. Add rate limiting.

---

### C4. Access Verification Stub Always Grants Access

**File:** `src/app/api/verify-access/route.ts:18-19`

**Issue:** The access verification endpoint is a stub that unconditionally returns `{ hasAccess: true }`:

```typescript
// STUB: always grant access — replace with on-chain verification later
return NextResponse.json({ hasAccess: true });
```

**Impact:** If any client-side code relies on this endpoint to verify token-gated access, all access controls are bypassed.

**Fix:** Implement actual on-chain verification or remove the endpoint. If it's not actively used, remove it to eliminate the attack surface.

---

### C5. Unrestricted Purchase Record Insertion (RLS)

**File:** `supabase/migrations/00013_monetization.sql:53-55`

**Issue:** The RLS policy allows anyone (including unauthenticated users) to insert purchase records:

```sql
create policy "Anyone can insert purchases" on public.bb_purchases
  for insert with check (true);
```

Combined with C1 (cookie forgery), an attacker can:
1. Insert a fake purchase with a fabricated `tx_hash`
2. The purchase cookie is set immediately (before payment confirmation)
3. Access premium content without payment

**Impact:** Financial fraud. Fake purchases pollute the database and bypass paywalls.

**Fix:** Restrict inserts to authenticated users and validate `tx_hash` against the blockchain before granting access. Consider requiring server-side payment verification via webhook instead of client-initiated purchase records.

---

## HIGH Priority Findings

### H1. JavaScript Protocol XSS in Links

**File:** `src/components/published/tiptap-renderer.tsx:29-32`

**Issue:** The `escapeHtml()` function (line 3-8) escapes `&`, `<`, `>`, `"` but does **not** validate URL protocols. A link with `href="javascript:alert('XSS')"` passes through because the `javascript:` protocol is untouched by HTML entity escaping:

```typescript
const href = escapeHtml(String(mark.attrs?.href ?? ''));
const target = mark.attrs?.target ?? '_blank';
result = `<a href="${href}" target="${target}" rel="noopener noreferrer">${result}</a>`;
```

The `target` attribute is also unsanitized — it accepts arbitrary values from the Tiptap document.

**Fix:** Validate href starts with safe protocols (`https:`, `http:`, `/`, `mailto:`, `#`). Whitelist target values to `['_blank', '_self']`.

---

### H2. Unsanitized Mermaid SVG Rendering

**File:** `src/components/docs/mermaid.tsx:60`

**Issue:** Mermaid-generated SVG is rendered via `dangerouslySetInnerHTML` without additional sanitization:

```typescript
dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
```

While Mermaid has built-in sanitization, it has had XSS bypass vulnerabilities in the past. If a malicious diagram bypasses Mermaid's sanitizer, arbitrary SVG with event handlers (`onload`, `onclick`) would execute.

**Fix:** Apply DOMPurify or similar sanitizer to the SVG output before rendering.

---

### H3. Missing Public Read RLS for Published Sites (Potential Functional Bug)

**Files:**
- `supabase/migrations/00001_blinkbook_init.sql:72-86`
- `src/app/sites/[slug]/[[...path]]/page.tsx:16-36`

**Issue:** There are no RLS policies allowing anonymous/public SELECT on `bb_spaces` or `bb_pages` for published content. The only read policies require `auth.uid() = user_id` or team membership.

The published site page (`page.tsx:16-36`) queries these tables using the anon client. For anonymous visitors, RLS would block these queries.

The app currently works because the publish flow creates a static bundle in Supabase Storage (public bucket) at `published-sites/{id}/static-bundle.json` (`publish/route.ts:76-101`). If this bundle is missing or corrupted, the fallback database queries will fail silently for anonymous users.

**Impact:** If the storage bundle is missing, published sites return 404 for anonymous visitors. No graceful fallback.

**Fix:** Add explicit public read policies for published spaces/pages:
```sql
create policy "public_read_published" on bb_spaces
  for select using (is_published = true);
create policy "public_read_published_pages" on bb_pages
  for select using (
    exists (select 1 from bb_spaces where id = space_id and is_published = true)
  );
```

---

### H4. No Rate Limiting on Public Endpoints

**Files:**
- `src/app/api/sites/[slug]/track/route.ts` — analytics tracking
- `src/app/api/feedback/route.ts` — feedback submission
- `src/app/api/verify-token-gate/route.ts` — token verification
- `src/app/api/email/send/route.ts` — email sending
- `src/app/api/verify-access/route.ts` — access verification

**Issue:** None of these public-facing endpoints have rate limiting. They can be called at any rate by any client.

**Impact:** Denial of service, analytics data pollution, spam feedback, email abuse, and resource exhaustion.

**Fix:** Add rate limiting middleware (e.g., Vercel Edge rate limiting, Upstash ratelimit, or custom IP-based throttling). Prioritize the email and tracking endpoints.

---

### H5. Overly Permissive Analytics Insert RLS

**File:** `supabase/migrations/00002_analytics.sql:21-22`

**Issue:**
```sql
create policy "Anyone can insert analytics" on bb_analytics
  for insert with check (true);
```

Any user (or bot) can insert arbitrary analytics records for any space, poisoning metrics.

**Fix:** Add a `with check` that validates `space_id` references a published space:
```sql
with check (space_id in (select id from bb_spaces where is_published = true))
```

---

### H6. Missing Foreign Key Indexes

**File:** `supabase/migrations/00001_blinkbook_init.sql`

**Issue:** Multiple foreign key columns used in RLS policy subqueries have no indexes:
- `bb_spaces.user_id` (line 14) — used in every RLS ownership check
- `bb_pages.space_id` (line 29) — used in page RLS policies
- `bb_team_members.space_id` + `user_id` (lines 44-45) — used in team RLS policies
- `bb_feedback.space_id` + `page_id` (lines 54-55)

**Impact:** Every RLS-protected query performs sequential scans on these tables. As data grows, all authenticated queries slow down significantly.

**Fix:** Add indexes:
```sql
create index idx_bb_spaces_user_id on bb_spaces(user_id);
create index idx_bb_pages_space_id on bb_pages(space_id);
create index idx_bb_team_members_space_user on bb_team_members(space_id, user_id);
create index idx_bb_feedback_space on bb_feedback(space_id);
```

---

### H7. Purchase Transaction Not Verified

**File:** `src/app/api/purchases/route.ts:33-45`

**Issue:** The purchase endpoint accepts any `tx_hash` without verifying it on-chain:

```typescript
const { data: purchase, error } = await supabase
  .from('bb_purchases')
  .insert({
    paid_content_id,
    buyer_wallet,
    buyer_chain,
    tx_hash,           // Never verified on-chain
    amount_usd: amount_usd ?? Number(content.price_usd),
    status: 'pending', // But cookie is set immediately
  })
```

Combined with the cookie being set before confirmation, this allows free access to paid content.

**Fix:** Do NOT set the access cookie in the purchase route. Only set it after the crypto webhook confirms the transaction (`/api/billing/crypto-webhook`).

---

### H8. Crypto Webhook HMAC Verification Could Accept Empty Key

**File:** `src/app/api/billing/crypto-webhook/route.ts:22-28`

**Issue:** HMAC verification uses `process.env.GOBLINK_API_KEY!` which could be `undefined`. The non-null assertion suppresses TypeScript errors, but if the key is empty/undefined, `crypto.createHmac('sha256', '')` will compute an HMAC with an empty key, potentially allowing forgery if the attacker knows the algorithm.

**Fix:** Validate that `GOBLINK_API_KEY` is defined before proceeding:
```typescript
const secret = process.env.GOBLINK_API_KEY;
if (!secret) return NextResponse.json({ error: 'Server config error' }, { status: 500 });
```

---

## MEDIUM Priority Findings

### M1. No CSRF Protection on State-Changing Endpoints

**Issue:** No CSRF tokens are used on POST/PATCH/DELETE endpoints. While Same-Origin policy and `SameSite=lax` cookies provide some protection, this doesn't fully prevent CSRF from top-level navigations or form submissions from attacker sites.

**Fix:** For critical actions (publish, delete space, payments), add CSRF token validation.

---

### M2. Error Messages Leak Database Details

**Files:**
- `src/app/api/spaces/[id]/route.ts:108,132`
- `src/app/api/spaces/[id]/pages/route.ts` (error responses)
- Multiple other API routes

**Issue:** Error responses return `error.message` from Supabase, which can include table names, constraint names, and SQL details:
```typescript
return NextResponse.json({ error: error.message }, { status: 500 });
```

**Fix:** Return generic error messages (`"An error occurred"`) and log details server-side.

---

### M3. Race Condition in Version Creation

**File:** `src/app/api/spaces/[id]/versions/route.ts:67-71`

**Issue:** When creating a new version, the route first sets all existing versions to `is_current = false`, then inserts the new one. If two concurrent requests hit this endpoint, both could set `is_current = false` and both create "current" versions, resulting in multiple active versions.

**Fix:** Use a database transaction or add a unique partial index `unique(space_id) where is_current = true`.

---

### M4. Tiptap Content Validation Accepts Arbitrary JSON

**Files:**
- `src/app/api/spaces/[id]/pages/[pageId]/route.ts:10`
- `src/app/api/spaces/[id]/pages/route.ts:11`

**Issue:** Tiptap content is validated with `z.array(z.any())`:
```typescript
content: z.object({
  type: z.literal('doc'),
  content: z.array(z.any()),  // Accepts any structure
}).optional()
```

While RLS prevents unauthorized writes, an authorized user could store malicious node types or attributes that the Tiptap renderer doesn't expect.

**Fix:** Add stricter validation of allowed Tiptap node types and mark attributes.

---

### M5. Cron Endpoints Use Simple Bearer Token

**Files:**
- `src/app/api/cron/analytics-rollup/route.ts`
- `src/app/api/cron/review-reminders/route.ts`

**Issue:** Cron endpoints authenticate using a bearer token compared to `CRON_SECRET`. If this secret is weak or leaked, anyone can trigger cron jobs (analytics rollup, sending review reminder emails).

**Fix:** Use Vercel's built-in cron authentication header (`x-vercel-cron-signature`) instead of a custom secret.

---

### M6. OG Image CSS Injection

**File:** `src/app/api/og/route.tsx:8-11,36,54`

**Issue:** The `theme` URL parameter is injected directly into CSS `background` and `color` properties without validation:
```typescript
const theme = searchParams.get('theme') ?? '#3B82F6';
// Used in: background: `linear-gradient(to bottom, ${theme}, ${theme}88)`
```

**Fix:** Validate `theme` matches hex color pattern: `/^#[0-9A-Fa-f]{6}$/`.

---

### M7. Missing NOT NULL on Team Member user_id (Recreated Table)

**File:** `supabase/migrations/00003_billing_teams.sql:30`

**Issue:** The recreated `bb_team_members` table has nullable `user_id`:
```sql
user_id uuid references public.bb_users on delete cascade,
```

This allows pending invites (with `email` but no `user_id`), but the RLS policy at line 53 uses `user_id = auth.uid()`, which will never match null. Pending invites are invisible to all users via RLS.

**Fix:** Add separate RLS policy for space owners to view pending invites, or use a separate invites table.

---

### M8. Missing CHECK Constraint on Purchase Status

**File:** `supabase/migrations/00013_monetization.sql:24`

**Issue:**
```sql
status text not null default 'pending',
```

No CHECK constraint limits values. The database accepts any string, allowing invalid states.

**Fix:** `alter table bb_purchases add constraint check_status check (status in ('pending','confirmed','failed'));`

---

### M9. Analytics In-Memory Processing

**File:** `src/app/api/spaces/[id]/analytics/route.ts:38-83`

**Issue:** Loads ALL analytics events for the time period into memory and processes with JavaScript loops. For 30-day windows on high-traffic sites, this could be thousands of events.

**Fix:** Use database GROUP BY aggregation instead of in-memory processing.

---

### M10. N+1 Query in Review Reminders Cron

**File:** `src/app/api/cron/review-reminders/route.ts:71-152`

**Issue:** For each space (up to 20), makes 3 separate database queries (user lookup, candidate pages, review logs) = 60 queries per cron invocation.

**Fix:** Batch fetch all users and use JOINs to consolidate queries.

---

### M11. Page Reorder N+1 Updates

**File:** `src/app/api/spaces/[id]/pages/reorder/route.ts:49-58`

**Issue:** Creates individual UPDATE queries for each page in a `Promise.all()`:
```typescript
const updates = parsed.data.pages.map((page) =>
  supabase.from('bb_pages').update({...}).eq('id', page.id)
);
```

For 50 pages, this sends 50 separate UPDATE queries.

**Fix:** Use a single RPC call with a batch update function, or use `unnest()` in a raw SQL query.

---

### M12. Feedback Insert RLS Allows Spam

**File:** `supabase/migrations/00009_feedback_widget.sql:4-5`

**Issue:**
```sql
create policy "Anyone can insert feedback" on public.bb_feedback
  for insert with check (true);
```

No validation that the space/page exists or is published.

**Fix:** Add check: `with check (page_id in (select id from bb_pages where space_id in (select id from bb_spaces where is_published = true)))`.

---

## LOW Priority / Code Quality

### L1. Hardcoded Domain in 19+ Locations

**Files:** `src/app/api/spaces/[id]/publish/route.ts:104`, `src/app/(dashboard)/dashboard/page.tsx:88,127`, `src/app/(dashboard)/dashboard/[siteId]/settings/page.tsx:365,702,915,1131`, and 15+ more locations.

**Issue:** `blinkbook.goblink.io` is hardcoded throughout the codebase instead of using `NEXT_PUBLIC_APP_URL`.

**Fix:** Use `process.env.NEXT_PUBLIC_APP_URL` or extract a shared constant.

---

### L2. Duplicated Space Ownership Verification Pattern

**Files:** ~15 API routes repeat the same ownership query pattern without a shared utility.

**Fix:** Extract to `src/lib/supabase/verify-ownership.ts`:
```typescript
export async function verifySpaceOwnership(supabase, spaceId) {
  const { data } = await supabase.from('bb_spaces').select('id').eq('id', spaceId).single();
  return data;
}
```

---

### L3. Duplicated Service Client Creation

**Files:**
- `src/app/api/billing/webhook/route.ts:7-13`
- `src/app/api/billing/crypto-webhook/route.ts:5-11`
- `src/app/api/cron/analytics-rollup/route.ts:4-10`
- `src/app/api/cron/review-reminders/route.ts:9-15`

**Fix:** Extract to `src/lib/supabase/service.ts`.

---

### L4. SELECT * Over-Fetching

**Files:** 11+ API routes use `.select('*')` when only specific columns are needed. Notably problematic for pages (large `content` JSONB) when only metadata is needed.

**Fix:** Specify column lists (e.g., `.select('id, title, slug, position')`).

---

### L5. Missing Index on Analytics (space_id, created_at)

**File:** `supabase/migrations/00002_analytics.sql:11`

**Issue:** Only index is `idx_bb_analytics_space_date on bb_analytics(space_id, created_at)` which is on the raw analytics table. The daily rollup table `bb_analytics_daily` (`00004_analytics_rollup.sql`) lacks a corresponding index.

**Fix:** Add index on `bb_analytics_daily(space_id, day)`.

---

### L6. Console Statements in Production Code

**Files:**
- `src/app/api/email/send/route.ts:35,41,46`
- `src/app/api/cron/review-reminders/route.ts:34,39,60,75,147`
- `src/app/api/cron/analytics-rollup/route.ts:23`

**Fix:** Use a structured logger or remove debug logging.

---

### L7. Missing Version Index

**File:** `supabase/migrations/00008_version_history.sql`

**Issue:** No indexes created. `bb_versions.space_id` is used in RLS policies but not indexed.

**Fix:** `create index idx_bb_versions_space on bb_versions(space_id);`

---

### L8. ISR Revalidation Too Aggressive

**File:** `src/app/sites/[slug]/[[...path]]/page.tsx:14`

**Issue:** `revalidate = 300` (5 minutes) for published content that only changes on explicit republish. Causes unnecessary revalidation.

**Fix:** Increase to `revalidate = 86400` (24 hours) and use on-demand revalidation via `revalidateTag()` on publish.

---

### L9. Invite Tokens Never Expire

**File:** `src/app/api/spaces/[id]/team/route.ts:90`

**Issue:** Invite tokens are generated with `crypto.randomBytes(32)` but have no expiration. A pending invite is valid indefinitely.

**Fix:** Add `expires_at` column to team_members and validate on acceptance.

---

### L10. Missing Team Member Visibility for Space Owners

**File:** `supabase/migrations/00003_billing_teams.sql:52-53`

**Issue:** The team member RLS policy only lets users see their own membership entry:
```sql
create policy "Team members can view" on bb_team_members
  for select using (user_id = auth.uid());
```

Space owners can't see their full team list unless a separate policy grants it.

**Fix:** Add policy: `for select using (space_id in (select id from bb_spaces where user_id = auth.uid()))`.

---

## Recommendations Summary (Priority Order)

1. **IMMEDIATE:** Fix paywall bypass — sign cookies with HMAC, verify tx before granting access (C1, C5, H7)
2. **IMMEDIATE:** HTML-escape paywall teaser text (C2)
3. **IMMEDIATE:** Add auth to email send endpoint (C3)
4. **IMMEDIATE:** Remove or implement verify-access stub (C4)
5. **HIGH:** Validate link href protocols and sanitize target attributes (H1)
6. **HIGH:** Add public read RLS policies for published content (H3)
7. **HIGH:** Add rate limiting on public endpoints (H4)
8. **HIGH:** Add missing database indexes on foreign keys (H6)
9. **HIGH:** Validate GOBLINK_API_KEY is defined before HMAC verification (H8)
10. **MEDIUM:** Tighten analytics/feedback insert RLS policies (H5, M12)
11. **MEDIUM:** Return generic error messages instead of DB details (M2)
12. **MEDIUM:** Centralize domain config and ownership verification (L1, L2)
