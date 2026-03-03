import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { reviewReminderHtml } from '@/lib/email/templates/review-reminder';

const MAX_SPACES_PER_RUN = 20;
const MAX_PAGES_PER_EMAIL = 50;
const REMINDER_COOLDOWN_DAYS = 30;

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? 'goBlink Book <noreply@blinkbook.goblink.io>',
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      console.error('[review-reminders] Resend error:', err);
      return false;
    }
    return true;
  }
  console.log(`[review-reminders] Email (dev) → ${to} | ${subject}`);
  return true;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.blinkbook.goblink.io';

  // Fetch spaces with reminders enabled (capped per run)
  const { data: spaces, error: spacesError } = await supabase
    .from('bb_spaces')
    .select('id, name, user_id, review_reminder_days')
    .eq('review_reminder_enabled', true)
    .limit(MAX_SPACES_PER_RUN);

  if (spacesError) {
    console.error('[review-reminders] Failed to fetch spaces:', spacesError);
    return NextResponse.json({ error: spacesError.message }, { status: 500 });
  }

  if (!spaces || spaces.length === 0) {
    return NextResponse.json({ ok: true, processed: 0 });
  }

  let totalEmailsSent = 0;
  let totalPagesLogged = 0;

  for (const space of spaces) {
    // Get owner email from auth.users via service role
    const { data: ownerData, error: ownerError } = await supabase.auth.admin.getUserById(space.user_id);
    if (ownerError || !ownerData.user?.email) {
      console.warn(`[review-reminders] Cannot get owner email for space ${space.id}`);
      continue;
    }
    const ownerEmail = ownerData.user.email;

    const staleCutoff = new Date();
    staleCutoff.setDate(staleCutoff.getDate() - (space.review_reminder_days ?? 90));

    const cooldownCutoff = new Date();
    cooldownCutoff.setDate(cooldownCutoff.getDate() - REMINDER_COOLDOWN_DAYS);

    // Find stale pages
    const { data: stalePages, error: pagesError } = await supabase
      .from('bb_pages')
      .select('id, title, slug, updated_at')
      .eq('space_id', space.id)
      .lt('updated_at', staleCutoff.toISOString())
      .limit(MAX_PAGES_PER_EMAIL);

    if (pagesError || !stalePages || stalePages.length === 0) {
      continue;
    }

    // Filter out pages reminded within cooldown window
    const { data: recentLogs } = await supabase
      .from('bb_review_logs')
      .select('page_id')
      .eq('space_id', space.id)
      .gte('sent_at', cooldownCutoff.toISOString());

    const recentlyRemindedPageIds = new Set((recentLogs ?? []).map((l: { page_id: string }) => l.page_id));
    const pagesToRemind = stalePages.filter((p: { id: string }) => !recentlyRemindedPageIds.has(p.id));

    if (pagesToRemind.length === 0) {
      continue;
    }

    // Send email
    const subject = `[goBlink Book] ${pagesToRemind.length} ${pagesToRemind.length === 1 ? 'page needs' : 'pages need'} review in ${space.name}`;
    const html = reviewReminderHtml({
      spaceName: space.name,
      reviewDays: space.review_reminder_days ?? 90,
      stalePages: pagesToRemind.map((p: { id: string; title: string; updated_at: string }) => ({
        title: p.title,
        updatedAt: p.updated_at,
        editorUrl: `${baseUrl}/dashboard/${space.id}/editor/${p.id}`,
      })),
    });

    const sent = await sendEmail(ownerEmail, subject, html);
    if (!sent) continue;

    // Log each page reminder
    const logRows = pagesToRemind.map((p: { id: string }) => ({
      page_id: p.id,
      space_id: space.id,
      sent_to: ownerEmail,
    }));

    const { error: logError } = await supabase.from('bb_review_logs').insert(logRows);
    if (logError) {
      console.error(`[review-reminders] Failed to log for space ${space.id}:`, logError);
    }

    totalEmailsSent++;
    totalPagesLogged += pagesToRemind.length;
  }

  return NextResponse.json({
    ok: true,
    spacesProcessed: spaces.length,
    emailsSent: totalEmailsSent,
    pagesLogged: totalPagesLogged,
  });
}
