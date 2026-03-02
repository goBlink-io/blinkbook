const BASE_URL = 'https://merchant.goblink.io/api/v1';

interface CreatePaymentRequest {
  amount: number;
  currency: string;
  chain: string;
  metadata?: Record<string, string>;
  webhookUrl?: string;
}

interface MerchantPayment {
  id: string;
  depositAddress: string;
  amount: number;
  currency: string;
  chain: string;
  status: 'pending' | 'confirming' | 'confirmed' | 'expired';
  expiresAt: string;
  qrCodeUrl: string;
}

export async function createMerchantPayment(req: CreatePaymentRequest): Promise<MerchantPayment> {
  const res = await fetch(`${BASE_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GOBLINK_API_KEY}`,
      'X-Merchant-Id': process.env.GOBLINK_MERCHANT_ID!,
    },
    body: JSON.stringify({
      amount: req.amount,
      currency: req.currency,
      chain: req.chain,
      webhook_url: req.webhookUrl,
      metadata: req.metadata,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create payment');
  }

  return res.json();
}

export async function getPaymentStatus(paymentId: string): Promise<MerchantPayment> {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${process.env.GOBLINK_API_KEY}`,
      'X-Merchant-Id': process.env.GOBLINK_MERCHANT_ID!,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to get payment status');
  }

  return res.json();
}
