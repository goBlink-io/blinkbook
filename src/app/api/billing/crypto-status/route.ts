import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPaymentStatus } from '@/lib/goblink/merchant';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get('id');

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 });
  }

  const status = await getPaymentStatus(paymentId);
  return NextResponse.json(status);
}
