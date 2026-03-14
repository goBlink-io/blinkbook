import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { teamInviteHtml } from '@/lib/email/templates/team-invite';
import { welcomeHtml } from '@/lib/email/templates/welcome';
import { z } from 'zod';

const teamInviteDataSchema = z.object({
  spaceName: z.string(),
  inviterName: z.string(),
  role: z.string(),
  acceptUrl: z.string().url(),
});

const welcomeDataSchema = z.object({
  name: z.string(),
  dashboardUrl: z.string().url(),
  docsUrl: z.string().url(),
});

const emailSchema = z.discriminatedUnion('template', [
  z.object({
    to: z.string().email(),
    subject: z.string().min(1).max(500),
    template: z.literal('team-invite'),
    data: teamInviteDataSchema,
  }),
  z.object({
    to: z.string().email(),
    subject: z.string().min(1).max(500),
    template: z.literal('welcome'),
    data: welcomeDataSchema,
  }),
]);

// Simple email send endpoint using Resend or fallback to console logging
export async function POST(request: Request) {
  // Require authenticated user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = emailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
  }

  const { to, subject, template, data } = parsed.data;

  let html = '';
  if (template === 'team-invite') {
    html = teamInviteHtml(data);
  } else if (template === 'welcome') {
    html = welcomeHtml(data);
  }

  // Try Resend if API key is available
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL ?? 'BlinkBook <noreply@blinkbook.goblink.io>',
          to,
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Resend error:', err);
        return NextResponse.json({ error: 'Email send failed' }, { status: 500 });
      }

      return NextResponse.json({ sent: true });
    } catch (err) {
      console.error('Email error:', err);
    }
  }

  // Fallback: log to console in development
  console.log(`[Email] To: ${to} | Subject: ${subject}`);
  return NextResponse.json({ sent: true, fallback: true });
}
