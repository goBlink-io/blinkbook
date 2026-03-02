'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, CreditCard, Zap, Copy, Check, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
  plan: 'pro' | 'team';
  onClose: () => void;
  onSuccess: () => void;
}

const PRICES = { pro: 12, team: 29 } as const;

const CRYPTO_OPTIONS = [
  { chain: 'base', currency: 'USDC', label: 'USDC on Base' },
  { chain: 'base', currency: 'ETH', label: 'ETH on Base' },
  { chain: 'ethereum', currency: 'USDC', label: 'USDC on Ethereum' },
];

export function CheckoutModal({ plan, onClose, onSuccess }: CheckoutModalProps) {
  const [tab, setTab] = useState<'card' | 'crypto'>('card');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">
            Upgrade to {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setTab('card')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
              tab === 'card'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Card
          </button>
          <button
            onClick={() => setTab('crypto')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${
              tab === 'crypto'
                ? 'text-white border-b-2 border-blue-500'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Zap className="w-4 h-4" />
            Crypto
          </button>
        </div>

        <div className="p-5">
          {tab === 'card' ? (
            <CardTab plan={plan} />
          ) : (
            <CryptoTab plan={plan} onSuccess={onSuccess} />
          )}
        </div>
      </div>
    </div>
  );
}

function CardTab({ plan }: { plan: 'pro' | 'team' }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <p className="text-sm text-zinc-400">You&apos;ll be redirected to Stripe&apos;s secure checkout</p>
        <p className="text-2xl font-bold text-white mt-1">
          ${PRICES[plan]}<span className="text-sm font-normal text-zinc-500">/mo</span>
        </p>
      </div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CreditCard className="w-4 h-4" />
        )}
        {loading ? 'Redirecting...' : 'Pay with Card'}
      </button>
    </div>
  );
}

function CryptoTab({ plan, onSuccess }: { plan: 'pro' | 'team'; onSuccess: () => void }) {
  const [selectedOption, setSelectedOption] = useState(0);
  const [payment, setPayment] = useState<{
    id: string;
    depositAddress: string;
    qrCodeUrl: string;
  } | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [copied, setCopied] = useState(false);

  const createPayment = async () => {
    setStatus('creating');
    const opt = CRYPTO_OPTIONS[selectedOption];
    try {
      const res = await fetch('/api/billing/create-crypto-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, chain: opt.chain, currency: opt.currency }),
      });
      const data = await res.json();
      if (data.id) {
        setPayment(data);
        setStatus('pending');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const pollStatus = useCallback(async () => {
    if (!payment?.id) return;
    try {
      const res = await fetch(`/api/billing/crypto-status?id=${payment.id}`);
      const data = await res.json();
      if (data.status === 'confirmed') {
        setStatus('confirmed');
        onSuccess();
      }
    } catch {
      // Silently retry
    }
  }, [payment?.id, onSuccess]);

  useEffect(() => {
    if (status !== 'pending') return;
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [status, pollStatus]);

  const handleCopy = () => {
    if (payment?.depositAddress) {
      navigator.clipboard.writeText(payment.depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === 'confirmed') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-semibold text-white mb-1">Payment Confirmed!</h3>
        <p className="text-sm text-zinc-400">Your subscription has been activated.</p>
      </div>
    );
  }

  if (payment && status === 'pending') {
    return (
      <div className="space-y-4">
        <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
          <p className="text-sm text-zinc-400 mb-2">
            Send ${PRICES[plan]} in {CRYPTO_OPTIONS[selectedOption].label}
          </p>
          {payment.qrCodeUrl && (
            <div className="flex justify-center mb-3">
              <img src={payment.qrCodeUrl} alt="QR Code" className="w-40 h-40 rounded-lg" />
            </div>
          )}
          <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-2">
            <code className="text-xs text-zinc-300 flex-1 truncate">{payment.depositAddress}</code>
            <button
              onClick={handleCopy}
              className="text-zinc-500 hover:text-white transition shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Waiting for payment...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-zinc-800/50 rounded-lg p-4">
        <p className="text-2xl font-bold text-white">
          ${PRICES[plan]}<span className="text-sm font-normal text-zinc-500"> in crypto</span>
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-400 block mb-1.5">Token & Chain</label>
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(Number(e.target.value))}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          {CRYPTO_OPTIONS.map((opt, i) => (
            <option key={i} value={i}>{opt.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={createPayment}
        disabled={status === 'creating'}
        className="w-full py-2.5 px-4 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {status === 'creating' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Zap className="w-4 h-4" />
        )}
        {status === 'creating' ? 'Generating address...' : 'Pay with Crypto'}
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-400 text-center">Failed to create payment. Please try again.</p>
      )}
    </div>
  );
}
