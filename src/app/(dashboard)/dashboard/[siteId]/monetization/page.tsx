'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  DollarSign,
  Plus,
  Trash2,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Wallet,
  Check,
} from 'lucide-react';
import { useWallet, ConnectButton, ConnectModal } from '@goblink/connect/react';
import type { BBPaidContent, BBPage, BBPurchase } from '@/types/database';

const ACCEPTED_TOKEN_OPTIONS = [
  'ETH', 'USDC', 'USDT', 'DAI', 'MATIC', 'SOL', 'SUI',
];

interface NewContentForm {
  page_id: string;
  price_usd: string;
  accepted_tokens: string[];
}

const emptyForm: NewContentForm = {
  page_id: '',
  price_usd: '',
  accepted_tokens: ['USDC'],
};

export default function MonetizationPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const { address, isConnected } = useWallet();

  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [payoutWallet, setPayoutWallet] = useState('');
  const [paidContent, setPaidContent] = useState<BBPaidContent[]>([]);
  const [purchases, setPurchases] = useState<BBPurchase[]>([]);
  const [pages, setPages] = useState<BBPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewContentForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const fetchData = useCallback(async () => {
    const [monRes, pagesRes, purchasesRes] = await Promise.all([
      fetch(`/api/spaces/${siteId}/monetization`),
      fetch(`/api/spaces/${siteId}/pages`),
      fetch(`/api/spaces/${siteId}/purchases`),
    ]);
    if (monRes.ok) {
      const data = await monRes.json();
      setMonetizationEnabled(data.monetization_enabled ?? false);
      setPayoutWallet(data.payout_wallet ?? '');
      setPaidContent(data.paid_content ?? []);
    }
    if (pagesRes.ok) setPages(await pagesRes.json());
    if (purchasesRes.ok) {
      const data = await purchasesRes.json();
      setPurchases(data.purchases ?? []);
    }
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveSettings = async (updates: { monetization_enabled?: boolean; payout_wallet?: string }) => {
    setSaving(true);
    setSettingsSaved(false);
    try {
      const res = await fetch(`/api/spaces/${siteId}/monetization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        if (updates.monetization_enabled !== undefined) setMonetizationEnabled(updates.monetization_enabled);
        if (updates.payout_wallet !== undefined) setPayoutWallet(updates.payout_wallet);
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUseConnectedWallet = () => {
    if (address) {
      setPayoutWallet(address);
      saveSettings({ payout_wallet: address });
    }
  };

  const handleCreateContent = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/spaces/${siteId}/monetization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_id: form.page_id || undefined,
          price_usd: Number(form.price_usd),
          accepted_tokens: form.accepted_tokens,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create paid content');
        return;
      }
      const newContent = await res.json();
      setPaidContent((prev) => [newContent, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleContent = async (content: BBPaidContent) => {
    const res = await fetch(`/api/spaces/${siteId}/monetization/${content.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !content.is_active }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPaidContent((prev) => prev.map((c) => (c.id === content.id ? updated : c)));
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    const res = await fetch(`/api/spaces/${siteId}/monetization/${contentId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setPaidContent((prev) => prev.filter((c) => c.id !== contentId));
    }
  };

  const toggleToken = (token: string) => {
    setForm((prev) => ({
      ...prev,
      accepted_tokens: prev.accepted_tokens.includes(token)
        ? prev.accepted_tokens.filter((t) => t !== token)
        : [...prev.accepted_tokens, token],
    }));
  };

  const totalRevenue = purchases
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.amount_usd), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Content Monetization</h1>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Settings</h3>

        <div className="space-y-4">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Enable Monetization</p>
              <p className="text-xs text-zinc-500">Allow paid content on your documentation</p>
            </div>
            <button
              type="button"
              onClick={() => saveSettings({ monetization_enabled: !monetizationEnabled })}
              disabled={saving}
            >
              {monetizationEnabled ? (
                <ToggleRight className="w-8 h-8 text-blue-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-zinc-600" />
              )}
            </button>
          </div>

          {/* Payout Wallet */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">Payout Wallet</label>
            <p className="text-xs text-zinc-500 mb-2">Payments will be sent to this address</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={payoutWallet}
                onChange={(e) => setPayoutWallet(e.target.value)}
                placeholder="0x... or wallet address"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {isConnected ? (
                <button
                  type="button"
                  onClick={handleUseConnectedWallet}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm rounded-lg transition"
                  title="Use connected wallet address"
                >
                  <Wallet className="w-4 h-4" />
                  Use Wallet
                </button>
              ) : (
                <ConnectButton
                  label="Connect"
                  theme="dark"
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm rounded-lg transition"
                />
              )}
              <button
                type="button"
                onClick={() => saveSettings({ payout_wallet: payoutWallet })}
                disabled={saving}
                className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition"
              >
                {settingsSaved ? <Check className="w-4 h-4" /> : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      {purchases.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">Total Purchases</p>
            <p className="text-xl font-bold text-white">{purchases.length}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">Confirmed</p>
            <p className="text-xl font-bold text-white">
              {purchases.filter((p) => p.status === 'confirmed').length}
            </p>
          </div>
        </div>
      )}

      {/* Paid Content Section */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Paid Content</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add Pricing
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-base font-semibold text-white mb-4">New Paid Content</h3>

          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Page</label>
              <select
                value={form.page_id}
                onChange={(e) => setForm({ ...form, page_id: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Pages (space-level)</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Price (USD)</label>
              <input
                type="number"
                value={form.price_usd}
                onChange={(e) => setForm({ ...form, price_usd: e.target.value })}
                min="0.01"
                step="0.01"
                placeholder="9.99"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-2">Accepted Tokens</label>
            <div className="flex flex-wrap gap-2">
              {ACCEPTED_TOKEN_OPTIONS.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => toggleToken(token)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition ${
                    form.accepted_tokens.includes(token)
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCreateContent}
              disabled={saving || !form.price_usd || form.accepted_tokens.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {paidContent.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <DollarSign className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No Paid Content</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Set up pricing for your documentation pages to monetize premium content.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paidContent.map((content) => {
            const page = pages.find((p) => p.id === content.page_id);
            return (
              <div
                key={content.id}
                className={`bg-zinc-900 border rounded-xl px-5 py-4 ${
                  content.is_active ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleContent(content)}
                      className="shrink-0"
                      title={content.is_active ? 'Disable' : 'Enable'}
                    >
                      {content.is_active ? (
                        <ToggleRight className="w-6 h-6 text-blue-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-600" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          ${Number(content.price_usd).toFixed(2)}
                        </span>
                        {page ? (
                          <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                            {page.title}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                            All pages
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        Accepts: {content.accepted_tokens.join(', ')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteContent(content.id)}
                    className="shrink-0 p-2 text-zinc-500 hover:text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Purchases */}
      {purchases.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Purchases</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-zinc-500 font-medium px-4 py-3">Wallet</th>
                  <th className="text-left text-zinc-500 font-medium px-4 py-3">Chain</th>
                  <th className="text-left text-zinc-500 font-medium px-4 py-3">Amount</th>
                  <th className="text-left text-zinc-500 font-medium px-4 py-3">Status</th>
                  <th className="text-left text-zinc-500 font-medium px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.slice(0, 20).map((purchase) => (
                  <tr key={purchase.id} className="border-b border-zinc-800/50 last:border-0">
                    <td className="px-4 py-3 text-zinc-300 font-mono text-xs truncate max-w-[140px]">
                      {purchase.buyer_wallet}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{purchase.buyer_chain}</td>
                    <td className="px-4 py-3 text-white font-medium">
                      ${Number(purchase.amount_usd).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          purchase.status === 'confirmed'
                            ? 'bg-green-500/10 text-green-400'
                            : purchase.status === 'pending'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConnectModal theme="dark" accentColor="#3b82f6" />
    </div>
  );
}
