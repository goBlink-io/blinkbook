import Link from 'next/link';
import { Check, X, ArrowLeft } from 'lucide-react';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for personal projects and getting started.',
    cta: 'Get Started Free',
    ctaHref: '/signup',
    highlighted: false,
    features: [
      { text: '1 space', included: true },
      { text: '20 pages', included: true },
      { text: 'Subdomain (slug.blinkbook.goblink.io)', included: true },
      { text: 'Community support', included: true },
      { text: "'Built with BlinkBook' footer badge", included: true },
      { text: 'Custom domain', included: false },
      { text: 'Analytics dashboard', included: false },
      { text: 'Remove branding', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/mo',
    description: 'For teams shipping products that need polished docs.',
    cta: 'Start Pro Trial',
    ctaHref: '/signup?plan=pro',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      { text: 'Unlimited spaces', included: true },
      { text: 'Unlimited pages', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Analytics dashboard', included: true },
      { text: "Remove 'Built with BlinkBook' badge", included: true },
      { text: 'Priority email support', included: true },
      { text: 'Team members', included: false },
      { text: 'Role-based access', included: false },
    ],
  },
  {
    name: 'Team',
    price: '$29',
    period: '/mo',
    description: 'For organizations needing collaboration and control.',
    cta: 'Start Team Trial',
    ctaHref: '/signup?plan=team',
    highlighted: false,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: '5 team members', included: true },
      { text: 'Role-based access (Admin/Editor/Viewer)', included: true },
      { text: 'Collaboration features', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom branding', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'SSO (coming soon)', included: true },
    ],
  },
];

const comparisonFeatures = [
  { feature: 'Spaces', free: '1', pro: 'Unlimited', team: 'Unlimited' },
  { feature: 'Pages', free: '20', pro: 'Unlimited', team: 'Unlimited' },
  { feature: 'Custom domain', free: false, pro: true, team: true },
  { feature: 'Analytics', free: false, pro: true, team: true },
  { feature: 'Remove branding', free: false, pro: true, team: true },
  { feature: 'Team members', free: '1', pro: '1', team: '5' },
  { feature: 'Role-based access', free: false, pro: false, team: true },
  { feature: 'Priority support', free: false, pro: true, team: true },
  { feature: 'Search', free: true, pro: true, team: true },
  { feature: 'SEO optimization', free: true, pro: true, team: true },
];

const faqs = [
  {
    q: 'Can I switch plans later?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.',
  },
  {
    q: 'Is there a free trial for paid plans?',
    a: 'Yes, both Pro and Team plans come with a 14-day free trial. No credit card required to start.',
  },
  {
    q: 'What happens if I exceed the free plan limits?',
    a: "You'll be prompted to upgrade to Pro when you hit the limits. Your existing content won't be affected.",
  },
  {
    q: 'Do you offer annual billing?',
    a: 'Yes, annual billing gives you 2 months free. Contact us for annual pricing.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. You can cancel your subscription at any time from your account settings. No questions asked.',
  },
];

function CompValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-green-400 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-zinc-600 mx-auto" />;
  return <span className="text-zinc-300">{value}</span>;
}

export default function PricingPage() {
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
      <section className="pt-20 pb-16 px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-zinc-400 max-w-xl mx-auto">
          Start free and scale as your docs grow. No hidden fees.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
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
                  <span className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
                    {tier.badge}
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-white mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                <span className="text-zinc-500 text-sm">{tier.period}</span>
              </div>
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
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Feature comparison</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900">
                <th className="text-left px-6 py-4 font-semibold text-zinc-300">Feature</th>
                <th className="px-6 py-4 font-semibold text-zinc-400 text-center">Free</th>
                <th className="px-6 py-4 font-semibold text-blue-400 text-center">Pro</th>
                <th className="px-6 py-4 font-semibold text-zinc-400 text-center">Team</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-zinc-900/30' : ''}>
                  <td className="px-6 py-3 font-medium text-zinc-200">{row.feature}</td>
                  <td className="px-6 py-3 text-center"><CompValue value={row.free} /></td>
                  <td className="px-6 py-3 text-center"><CompValue value={row.pro} /></td>
                  <td className="px-6 py-3 text-center"><CompValue value={row.team} /></td>
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
