'use client';

import { Check } from 'lucide-react';

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '1 space',
      '20 pages',
      'Subdomain hosting',
      'Community support',
    ],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$12',
    period: '/mo',
    badge: 'Most Popular',
    features: [
      'Unlimited spaces',
      'Unlimited pages',
      'Custom domain',
      'Analytics dashboard',
      'Remove branding',
      'Priority support',
    ],
  },
  {
    id: 'team' as const,
    name: 'Team',
    price: '$29',
    period: '/mo',
    features: [
      'Everything in Pro',
      '5 team members',
      'Role-based access',
      'Collaboration features',
      'Advanced analytics',
    ],
  },
];

interface PlanSelectorProps {
  currentPlan: 'free' | 'pro' | 'team';
  onSelectPlan: (plan: 'pro' | 'team') => void;
}

export function PlanSelector({ currentPlan, onSelectPlan }: PlanSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlan;
        const isHighlighted = plan.id === 'pro';

        return (
          <div
            key={plan.id}
            className={`relative rounded-xl border p-6 flex flex-col ${
              isHighlighted
                ? 'border-blue-500 bg-zinc-900'
                : 'border-zinc-800 bg-zinc-900/50'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-full">
                  {plan.badge}
                </span>
              </div>
            )}

            <h3 className="text-base font-semibold text-white mb-1">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              <span className="text-zinc-500 text-sm">{plan.period}</span>
            </div>

            <div className="space-y-2 flex-1 mb-6">
              {plan.features.map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-zinc-300">{f}</span>
                </div>
              ))}
            </div>

            {isCurrent ? (
              <div className="text-center py-2 px-4 rounded-lg text-sm font-medium bg-zinc-800 text-zinc-400">
                Current Plan
              </div>
            ) : plan.id === 'free' ? (
              <div className="text-center py-2 px-4 rounded-lg text-sm font-medium text-zinc-600">
                {currentPlan === 'free' ? '' : 'Downgrade via portal'}
              </div>
            ) : (
              <button
                onClick={() => onSelectPlan(plan.id)}
                className={`py-2 px-4 rounded-lg font-medium text-sm transition ${
                  isHighlighted
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                }`}
              >
                {currentPlan === 'free' ? 'Upgrade' : plan.id === 'team' ? 'Upgrade' : 'Switch'}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
