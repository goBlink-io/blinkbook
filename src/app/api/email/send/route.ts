import { NextResponse } from 'next/server';
import { teamInviteHtml } from '@/lib/email/templates/team-invite';

// Simple email send endpoint using Resend or fallback to console logging
export async function POST(request: Request) {
  const { to, subject, template, data } = await request.json();

  let html = '';
  if (template === 'team-invite') {
    html = teamInviteHtml(data);
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
