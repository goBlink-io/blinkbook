import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import dns from 'dns/promises';

// Valid domain: letters, digits, hyphens, dots. No IP addresses, no protocols.
const DOMAIN_REGEX = /^(?!-)([a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/;
const RESERVED_DOMAINS = ['localhost', '127.0.0.1', '0.0.0.0', 'blinkbook.goblink.io'];

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
      .eq('user_id', user.id)
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

  // Validate domain format
  if (!DOMAIN_REGEX.test(domain) || domain.length > 253) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
  }

  // Block reserved/internal domains
  if (RESERVED_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) {
    return NextResponse.json({ error: 'This domain is reserved' }, { status: 400 });
  }

  // Check domain is not already claimed by another space
  const { data: existingDomain } = await supabase
    .from('bb_spaces')
    .select('id')
    .eq('custom_domain', domain)
    .neq('id', id)
    .single();

  if (existingDomain) {
    return NextResponse.json({ error: 'This domain is already in use' }, { status: 409 });
  }

  const { error } = await supabase
    .from('bb_spaces')
    .update({ custom_domain: domain })
    .eq('id', id)
    .eq('user_id', user.id);

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
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
