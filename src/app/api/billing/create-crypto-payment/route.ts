import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createMerchantPayment } from '@/lib/goblink/merchant';
import { z } from 'zod';

const schema = z.object({
  plan: z.enum(['pro', 'team']),
  chain: z.string().min(1),
  currency: z.string().min(1),
});

const PRICES = { pro: 12, team: 29 } as const;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  const { plan, chain, currency } = parsed.data;

  const payment = await createMerchantPayment({
    amount: PRICES[plan],
    currency,
    chain,
    metadata: { userId: user.id, plan },
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/billing/crypto-webhook`,
  });

  return NextResponse.json(payment);
}
