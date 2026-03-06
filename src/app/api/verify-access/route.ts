import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyCookiePayload } from '@/lib/cookie-signing';

const verifySchema = z.object({
  wallet_address: z.string().min(1),
  space_id: z.string().uuid(),
  page_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = verifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
  }

  const { wallet_address, page_id } = parsed.data;
  const cookieStore = await cookies();

  // Check token-gate access proof cookie
  const accessProof = cookieStore.get('bb_access_proof');
  if (accessProof?.value) {
    const payload = verifyCookiePayload<{ wallet: string }>(accessProof.value);
    if (payload && payload.wallet === wallet_address) {
      return NextResponse.json({ hasAccess: true });
    }
  }

  // Check purchase proof cookie for specific paid content
  if (page_id) {
    // Look for any purchase cookie matching this page's paid content
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.startsWith('bb_purchase_')) {
        const payload = verifyCookiePayload<{ wallet: string; content_id: string }>(cookie.value);
        if (payload && payload.wallet === wallet_address) {
          return NextResponse.json({ hasAccess: true });
        }
      }
    }
  }

  return NextResponse.json({ hasAccess: false });
}
