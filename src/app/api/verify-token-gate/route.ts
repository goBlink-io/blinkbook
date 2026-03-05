import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface RulePayload {
  id: string;
  chain: string;
  contract_address: string;
  token_type: string;
  min_amount: number;
  token_id: string | null;
}

const EVM_CHAINS: Record<string, string> = {
  ethereum: 'https://eth.llamarpc.com',
  polygon: 'https://polygon-rpc.com',
  base: 'https://mainnet.base.org',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
};

// ERC-20 balanceOf(address) selector
const BALANCE_OF_SELECTOR = '0x70a08231';
// ERC-721 balanceOf(address) selector — same as ERC-20
// ERC-1155 balanceOf(address, uint256) selector
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

    const balance = BigInt(json.result);
    return balance >= BigInt(minAmount);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { wallet_address, wallet_chain, rules } = body as {
    wallet_address: string;
    wallet_chain: string;
    rules: RulePayload[];
  };

  if (!wallet_address || !rules || rules.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check each rule — user needs to satisfy at least one rule
  for (const rule of rules) {
    let satisfied = false;

    // EVM verification
    const rpcUrl = EVM_CHAINS[rule.chain];
    if (rpcUrl && ['ERC-20', 'ERC-721', 'ERC-1155'].includes(rule.token_type)) {
      if (wallet_chain !== 'evm') continue;
      satisfied = await checkEvmBalance(
        rpcUrl,
        rule.contract_address,
        wallet_address,
        rule.token_type,
        rule.min_amount,
        rule.token_id
      );
    }

    // TODO: Solana SPL token verification
    // TODO: Sui token verification
    // TODO: NEAR token verification

    if (satisfied) {
      // Set an access cookie valid for 24 hours
      const cookieStore = await cookies();
      const proof = Buffer.from(
        JSON.stringify({
          wallet: wallet_address,
          rule_id: rule.id,
          verified_at: Date.now(),
        })
      ).toString('base64');

      cookieStore.set('bb_access_proof', proof, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });

      return NextResponse.json({ granted: true, rule_id: rule.id });
    }
  }

  return NextResponse.json({
    granted: false,
    reason: 'You do not hold the required tokens for any of the access rules.',
  });
}
