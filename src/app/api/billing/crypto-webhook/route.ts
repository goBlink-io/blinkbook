import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import crypto from 'crypto';

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-goblink-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Verify HMAC-SHA256 signature
  const expected = crypto
    .createHmac('sha256', process.env.GOBLINK_API_KEY!)
    .update(body)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.type !== 'payment.confirmed') {
    return NextResponse.json({ received: true });
  }

  const { metadata, id: paymentId } = event.payment;
  const { userId, plan } = metadata;

  if (!userId || !plan) {
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
  }

  const supabase = createServiceClient();

  await supabase.from('bb_subscriptions').upsert({
    user_id: userId,
    plan,
    status: 'active',
    payment_method: 'crypto',
    goblink_payment_id: paymentId,
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }, { onConflict: 'user_id' });

  return NextResponse.json({ received: true });
}
