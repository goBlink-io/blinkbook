'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, Zap, ExternalLink } from 'lucide-react';
import { PlanSelector } from '@/components/billing/plan-selector';
import { CheckoutModal } from '@/components/billing/checkout-modal';
import type { BBSubscription } from '@/types/database';

interface UsageData {
  spaces: number;
  pages: number;
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<BBSubscription | null>(null);
  const [usage, setUsage] = useState<UsageData>({ spaces: 0, pages: 0 });
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'team' | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/billing/subscription');
    if (res.ok) {
      const data = await res.json();
      setSubscription(data.subscription);
      setUsage(data.usage);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  const currentPlan = subscription?.plan ?? 'free';
  const isPaid = currentPlan !== 'free' && subscription?.status === 'active';

  const handleManageSubscription = async () => {
    if (subscription?.payment_method === 'stripe' && subscription.stripe_customer_id) {
      setPortalLoading(true);
      const res = await fetch('/api/billing/portal', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const limits = {
    free: { spaces: 1, pages: 20 },
    pro: { spaces: Infinity, pages: Infinity },
    team: { spaces: Infinity, pages: Infinity },
  };

  const planLimits = limits[currentPlan];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-zinc-400 mt-1">Manage your subscription and payment method.</p>
      </div>

      {showSuccess && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <p className="text-sm text-green-400 font-medium">Subscription activated successfully!</p>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Current Plan</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-white capitalize">{currentPlan}</span>
              {isPaid && subscription?.payment_method && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
                  {subscription.payment_method === 'stripe' ? (
                    <><CreditCard className="w-3 h-3" /> Card</>
                  ) : (
                    <><Zap className="w-3 h-3" /> Crypto</>
                  )}
                </span>
              )}
            </div>
          </div>
          {isPaid && subscription?.payment_method === 'stripe' && (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {portalLoading ? 'Loading...' : 'Manage Subscription'}
            </button>
          )}
        </div>

        {/* Usage bars */}
        {currentPlan === 'free' && (
          <div className="space-y-3">
            <UsageBar label="Spaces" used={usage.spaces} max={planLimits.spaces} />
            <UsageBar label="Pages" used={usage.pages} max={planLimits.pages} />
          </div>
        )}

        {isPaid && subscription?.current_period_end && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-sm text-zinc-400">
              {subscription.cancel_at_period_end ? 'Cancels' : 'Next billing date'}:{' '}
              <span className="text-zinc-300">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </span>
              {!subscription.cancel_at_period_end && (
                <span className="text-zinc-500 ml-1">
                  (${currentPlan === 'pro' ? '12' : '29'}/mo)
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Plan Selector */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Plans</h2>
        <PlanSelector
          currentPlan={currentPlan}
          onSelectPlan={setSelectedPlan}
        />
      </div>

      {selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => {
            setSelectedPlan(null);
            setShowSuccess(true);
            fetchData();
            setTimeout(() => setShowSuccess(false), 5000);
          }}
        />
      )}
    </div>
  );
}

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max === Infinity ? 0 : Math.min((used / max) * 100, 100);
  const isNearLimit = pct >= 80;

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className={isNearLimit ? 'text-amber-400' : 'text-zinc-500'}>
          {used} / {max === Infinity ? '∞' : max}
        </span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isNearLimit ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
