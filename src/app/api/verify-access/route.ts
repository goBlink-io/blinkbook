import { NextResponse } from 'next/server';
import { z } from 'zod';

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

  // STUB: always grant access — replace with on-chain verification later
  return NextResponse.json({ hasAccess: true });
}
