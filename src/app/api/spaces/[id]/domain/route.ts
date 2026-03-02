import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dns from 'dns/promises';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { domain, verify } = body as { domain?: string; verify?: boolean };

  if (verify) {
    // Verify existing custom_domain
    const { data: space } = await supabase
      .from('bb_spaces')
      .select('custom_domain')
      .eq('id', id)
      .single();

    if (!space?.custom_domain) {
      return NextResponse.json({ error: 'No custom domain set' }, { status: 400 });
    }

    try {
      const records = await dns.resolveCname(space.custom_domain);
      const verified = records.some((r) => r.includes('vercel-dns.com'));
      return NextResponse.json({
        domain: space.custom_domain,
        status: verified ? 'verified' : 'pending',
        cname_records: records,
      });
    } catch {
      return NextResponse.json({
        domain: space.custom_domain,
        status: 'pending',
        cname_records: [],
      });
    }
  }

  // Save custom domain
  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('bb_spaces')
    .update({ custom_domain: domain })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ domain, status: 'pending' });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('bb_spaces')
    .update({ custom_domain: null })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
