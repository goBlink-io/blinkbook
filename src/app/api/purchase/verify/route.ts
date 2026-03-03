import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { page_id, wallet_address } = body as {
    page_id?: string;
    wallet_address?: string;
  };

  if (!page_id || !wallet_address) {
    return NextResponse.json({ error: 'Missing page_id or wallet_address' }, { status: 400 });
  }

  // Stub: always returns no access
  // In production, this would verify the wallet's purchase on-chain
  return NextResponse.json({ hasAccess: false });
}
