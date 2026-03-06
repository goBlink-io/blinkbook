import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { signCookiePayload } from '@/lib/cookie-signing';

export async function POST(request: Request) {
  const body = await request.json();
  const { paid_content_id, buyer_wallet, buyer_chain, tx_hash, amount_usd } = body as {
    paid_content_id: string;
    buyer_wallet: string;
    buyer_chain: string;
    tx_hash: string;
    amount_usd: number;
  };

  if (!paid_content_id || !buyer_wallet || !buyer_chain || !tx_hash) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createClient();

  // Verify the paid content exists
  const { data: content } = await supabase
    .from('bb_paid_content')
    .select('id, price_usd, space_id')
    .eq('id', paid_content_id)
    .eq('is_active', true)
    .single();

  if (!content) {
    return NextResponse.json({ error: 'Paid content not found' }, { status: 404 });
  }

  // Record the purchase
  const { data: purchase, error } = await supabase
    .from('bb_purchases')
    .insert({
      paid_content_id,
      buyer_wallet,
      buyer_chain,
      tx_hash,
      amount_usd: amount_usd ?? Number(content.price_usd),
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Set a signed purchase proof cookie
  const cookieStore = await cookies();
  const proof = signCookiePayload({
    purchase_id: purchase.id,
    wallet: buyer_wallet,
    content_id: paid_content_id,
    ts: Date.now(),
  });

  cookieStore.set(`bb_purchase_${paid_content_id}`, proof, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  });

  return NextResponse.json(purchase, { status: 201 });
}
