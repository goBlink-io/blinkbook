'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, ArrowLeft } from 'lucide-react';

type BillingPeriod = 'monthly' | 'annual';

const tiers = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Perfect for personal projects and getting started.',
    cta: 'Get Started Free',
    ctaHref: '/signup',
    highlighted: false,
    features: [
      { text: '1 space, 20 pages', included: true },
      { text: '1,000 pageviews/mo', included: true },
      { text: 'Subdomain hosting', included: true },
      { text: 'Full-text search', included: true },
      { text: 'Feedback widget', included: true },
      { text: "'Built with BlinkBook' badge", included: true },
      { text: 'Community support', included: true },
      { text: 'Custom domain', included: false },
      { text: 'Remove branding', included: false },
    ],
  },
  {
    name: 'Pro',
    monthlyPrice: 19,
    annualPrice: 15,
    description: 'For creators shipping products that need polished docs.',
    cta: 'Start Pro Trial',
    ctaHref: '/signup?plan=pro',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      { text: '3 spaces, unlimited pages', included: true },
      { text: '50,000 pageviews/mo', included: true },
      { text: 'Custom domain + SSL', included: true },
      { text: 'Full analytics dashboard', included: true },
      { text: 'Remove branding', included: true },
      { text: 'llms.txt (AI-ready docs)', included: true },
      { text: 'Version history (30 days)', included: true },
      { text: 'Review reminders', included: true },
      { text: 'Broken link checks', included: true },
      { text: 'Priority email support', included: true },
    ],
  },
  {
    name: 'Team',
    monthlyPrice: 49,
    annualPrice: 39,
    description: 'For organizations needing collaboration and control.',
    cta: 'Start Team Trial',
    ctaHref: '/signup?plan=team',
    highlighted: false,
    features: [
      { text: '10 spaces, unlimited pages', included: true },
      { text: '250,000 pageviews/mo', included: true },
      { text: '10 team members', included: true },
      { text: 'Role-based access (Admin/Editor/Viewer)', included: true },
      { text: 'Full custom branding (colors, fonts, CSS)', included: true },
      { text: 'Token-gated pages (Web3)', included: true },
      { text: 'Content monetization (5% platform fee)', included: true },
      { text: 'Version history (90 days)', included: true },
      { text: 'Advanced analytics + exports', included: true },
      { text: 'Email + chat support', included: true },
    ],
  },
  {
    name: 'Business',
    monthlyPrice: 99,
    annualPrice: 79,
    description: 'For companies that need scale, control, and white-label.',
    cta: 'Start Business Trial',
    ctaHref: '/signup?plan=business',
    highlighted: false,
    badge: 'Best Value',
    features: [
      { text: 'Unlimited spaces & pages', included: true },
      { text: '1M pageviews/mo (then $5/100K)', included: true },
      { text: '25 team members', included: true },
      { text: 'White-label (full rebrand)', included: true },
      { text: 'Token-gated pages (Web3)', included: true },
      { text: 'Content monetization (2% platform fee)', included: true },
      { text: 'Unlimited version history', included: true },
      { text: 'Full analytics + API access', included: true },
      { text: 'SSO/SAML (coming soon)', included: true },
      { text: 'Dedicated support', included: true },
    ],
  },
];

const comparisonFeatures: {
  feature: string;
  free: boolean | string;
  pro: boolean | string;
  team: boolean | string;
  business: boolean | string;
}[] = [
  { feature: 'Spaces', free: '1', pro: '3', team: '10', business: 'Unlimited' },
  { feature: 'Pages', free: '20', pro: 'Unlimited', team: 'Unlimited', business: 'Unlimited' },
  { feature: 'Pageviews/mo', free: '1,000', pro: '50,000', team: '250,000', business: '1,000,000' },
  { feature: 'Custom domain', free: false, pro: true, team: true, business: true },
  { feature: 'Analytics', free: 'Basic', pro: 'Full', team: 'Full + exports', business: 'Full + API' },
  { feature: 'Remove branding', free: false, pro: true, team: true, business: true },
  { feature: 'llms.txt', free: false, pro: true, team: true, business: true },
  { feature: 'Team members', free: '0', pro: '0', team: '10', business: '25' },
  { feature: 'Role-based access', free: false, pro: false, team: true, business: true },
  { feature: 'Version history', free: false, pro: '30 days', team: '90 days', business: 'Unlimited' },
  { feature: 'Review reminders', free: false, pro: true, team: true, business: true },
  { feature: 'Broken link checks', free: false, pro: true, team: true, business: true },
  { feature: 'Token-gated pages', free: false, pro: false, team: true, business: true },
  { feature: 'Content monetization', free: false, pro: false, team: '5% fee', business: '2% fee' },
  { feature: 'Custom branding', free: false, pro: 'Logo', team: 'Full', business: 'Full' },
  { feature: 'White-label', free: false, pro: false, team: false, business: true },
  { feature: 'SSO/SAML', free: false, pro: false, team: false, business: 'Coming soon' },
  { feature: 'Search', free: true, pro: true, team: true, business: true },
  { feature: 'Feedback widget', free: true, pro: true, team: true, business: true },
];

const faqs = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'Yes, Pro, Team, and Business plans come with a 14-day free trial. No credit card required to start.',
  },
  {
    q: 'What happens if I exceed the free plan limits?',
    a: "You'll be prompted to upgrade when you hit your plan's limits. Your existing content won't be affected.",
  },
  {
    q: 'What happens when I exceed my pageview limit?',
    a: "On Free and Pro plans, your site remains live but a soft upgrade prompt appears. On Team plans, excess pageviews are billed at $5 per 100K. Business plans include overage billing at $5 per 100K above the 1M monthly allowance.",
  },
  {
    q: 'Do you offer annual billing?',
    a: 'Yes! Annual billing saves you ~20%. Pro is $15/mo, Team is $39/mo, and Business is $79/mo when billed annually.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. You can cancel your subscription at any time from your account settings. No questions asked.',
  },
  {
    q: "What's the difference between Team and Business?",
    a: 'Business includes white-label branding, SSO/SAML, higher pageview limits, lower monetization fees (2% vs 5%), 25 team members, unlimited version history, and API access for analytics.',
  },
];

function CompValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-green-400 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-zinc-600 mx-auto" />;
  return <span className="text-zinc-300">{value}</span>;
}

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingPeriod>('monthly');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center h-14 px-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-8 px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10">
          Start free and scale as your docs grow. No hidden fees.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center rounded-lg bg-zinc-900 border border-zinc-800 p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billing === 'monthly'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billing === 'annual'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Annual <span className="text-green-400 text-xs ml-1">Save ~20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-24 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const price = billing === 'annual' ? tier.annualPrice : tier.monthlyPrice;
            const isFree = tier.monthlyPrice === 0;

            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  tier.highlighted
                    ? 'border-blue-500 bg-zinc-900 shadow-lg shadow-blue-500/10'
                    : 'border-zinc-800 bg-zinc-900/50'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className={`px-3 py-1 text-xs font-semibold text-white rounded-full whitespace-nowrap ${
                        tier.name === 'Business'
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600'
                          : 'bg-blue-600'
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-white mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-white">${price}</span>
                  <span className="text-zinc-500 text-sm">{isFree ? 'forever' : '/mo'}</span>
                </div>
                {!isFree && billing === 'monthly' && (
                  <p className="text-xs text-zinc-500 mb-2">
                    ${tier.annualPrice}/mo billed annually
                  </p>
                )}
                {!isFree && billing === 'annual' && (
                  <p className="text-xs text-green-400/70 mb-2">Billed annually</p>
                )}
                {isFree && <div className="mb-2" />}
                <p className="text-sm text-zinc-400 mb-6">{tier.description}</p>

                <Link
                  href={tier.ctaHref}
                  className={`block text-center py-2.5 px-4 rounded-lg font-medium text-sm transition mb-8 ${
                    tier.highlighted
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  }`}
                >
                  {tier.cta}
                </Link>

                <div className="space-y-3 flex-1">
                  {tier.features.map((f) => (
                    <div key={f.text} className="flex items-start gap-2.5">
                      {f.included ? (
                        <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
                      )}
                      <span className={`text-sm ${f.included ? 'text-zinc-300' : 'text-zinc-600'}`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Feature comparison</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900">
                <th className="text-left px-6 py-4 font-semibold text-zinc-300">Feature</th>
                <th className="px-6 py-4 font-semibold text-zinc-400 text-center">Free</th>
                <th className="px-6 py-4 font-semibold text-blue-400 text-center">Pro</th>
                <th className="px-6 py-4 font-semibold text-zinc-400 text-center">Team</th>
                <th className="px-6 py-4 font-semibold text-zinc-400 text-center">Business</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-zinc-900/30' : ''}>
                  <td className="px-6 py-3 font-medium text-zinc-200">{row.feature}</td>
                  <td className="px-6 py-3 text-center"><CompValue value={row.free} /></td>
                  <td className="px-6 py-3 text-center"><CompValue value={row.pro} /></td>
                  <td className="px-6 py-3 text-center"><CompValue value={row.team} /></td>
                  <td className="px-6 py-3 text-center"><CompValue value={row.business} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-white mb-2">{faq.q}</h3>
              <p className="text-sm text-zinc-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center">
        <p className="text-xs text-zinc-600">
          Built with{' '}
          <a href="/" className="text-zinc-400 hover:text-white transition">
            BlinkBook
          </a>
        </p>
      </footer>
    </div>
  );
}
