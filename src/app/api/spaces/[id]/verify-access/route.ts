import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { BBAccessRule } from '@/types/database';

const EVM_CHAINS: Record<string, string> = {
  ethereum: 'https://eth.llamarpc.com',
  polygon: 'https://polygon-rpc.com',
  base: 'https://mainnet.base.org',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
};

const BALANCE_OF_SELECTOR = '0x70a08231';
const BALANCE_OF_1155_SELECTOR = '0x00fdd58e';

async function checkEvmBalance(
  rpcUrl: string,
  contractAddress: string,
  walletAddress: string,
  tokenType: string,
  minAmount: number,
  tokenId: string | null
): Promise<boolean> {
  const paddedAddress = walletAddress.toLowerCase().replace('0x', '').padStart(64, '0');

  let data: string;
  if (tokenType === 'ERC-1155' && tokenId) {
    const paddedTokenId = BigInt(tokenId).toString(16).padStart(64, '0');
    data = `${BALANCE_OF_1155_SELECTOR}${paddedAddress}${paddedTokenId}`;
  } else {
    data = `${BALANCE_OF_SELECTOR}${paddedAddress}`;
  }

  try {
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to: contractAddress, data }, 'latest'],
      }),
    });

    const json = await res.json();
    if (json.error || !json.result) return false;
    return BigInt(json.result) >= BigInt(minAmount);
  } catch {
    return false;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { wallet_address, wallet_chain } = body as {
    wallet_address: string;
    wallet_chain: string;
  };

  if (!wallet_address) {
    return NextResponse.json({ error: 'wallet_address required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: rules } = await supabase
    .from('bb_access_rules')
    .select('*')
    .eq('space_id', id)
    .eq('is_active', true);

  if (!rules || rules.length === 0) {
    return NextResponse.json({ granted: true, reason: 'No active rules' });
  }

  const typedRules = rules as BBAccessRule[];

  for (const rule of typedRules) {
    const rpcUrl = EVM_CHAINS[rule.chain];
    if (rpcUrl && ['ERC-20', 'ERC-721', 'ERC-1155'].includes(rule.token_type)) {
      if (wallet_chain !== 'evm') continue;
      const satisfied = await checkEvmBalance(
        rpcUrl,
        rule.contract_address,
        wallet_address,
        rule.token_type,
        rule.min_amount,
        rule.token_id
      );
      if (satisfied) {
        return NextResponse.json({ granted: true, rule_id: rule.id });
      }
    }
    // TODO: Solana SPL token verification
    // TODO: Sui token verification
    // TODO: NEAR token verification
  }

  return NextResponse.json({
    granted: false,
    reason: 'Wallet does not satisfy any access rule.',
  });
}
