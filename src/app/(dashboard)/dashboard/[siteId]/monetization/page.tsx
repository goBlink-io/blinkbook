'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DollarSign, Plus, Trash2, ToggleLeft, ToggleRight, Wallet } from 'lucide-react';
import type { BBPaidContent, BBPurchase, BBPage } from '@/types/database';

interface MonetizationData {
  monetization_enabled: boolean;
  payout_wallet: string | null;
  paid_content: BBPaidContent[];
}

export default function MonetizationPage() {
  const params = useParams<{ siteId: string }>();
  const [data, setData] = useState<MonetizationData | null>(null);
  const [purchases, setPurchases] = useState<BBPurchase[]>([]);
  const [pages, setPages] = useState<BBPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [formPageId, setFormPageId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formTokens, setFormTokens] = useState('');

  // Wallet input
  const [walletInput, setWalletInput] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [monetRes, purchRes, pagesRes] = await Promise.all([
      fetch(`/api/spaces/${params.siteId}/monetization`),
      fetch(`/api/spaces/${params.siteId}/purchases`),
      fetch(`/api/spaces/${params.siteId}/pages`),
    ]);

    if (monetRes.ok) {
      const d = await monetRes.json() as MonetizationData;
      setData(d);
      setWalletInput(d.payout_wallet ?? '');
    }
    if (purchRes.ok) {
      const p = await purchRes.json() as { purchases: BBPurchase[] };
      setPurchases(p.purchases);
    }
    if (pagesRes.ok) {
      setPages(await pagesRes.json());
    }
    setLoading(false);
  }, [params.siteId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleMonetization = async () => {
    if (!data) return;
    setSaving(true);
    await fetch(`/api/spaces/${params.siteId}/monetization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monetization_enabled: !data.monetization_enabled }),
    });
    await fetchData();
    setSaving(false);
  };

  const saveWallet = async () => {
    setSaving(true);
    await fetch(`/api/spaces/${params.siteId}/monetization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payout_wallet: walletInput || null }),
    });
    await fetchData();
    setSaving(false);
  };

  const addPaidContent = async () => {
    const price = parseFloat(formPrice);
    if (isNaN(price) || price <= 0) return;

    setSaving(true);
    const tokens = formTokens
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await fetch(`/api/spaces/${params.siteId}/monetization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_id: formPageId || undefined,
        price_usd: price,
        accepted_tokens: tokens,
      }),
    });

    setFormPageId('');
    setFormPrice('');
    setFormTokens('');
    setShowForm(false);
    await fetchData();
    setSaving(false);
  };

  const deletePaidContent = async (contentId: string) => {
    setSaving(true);
    await fetch(`/api/spaces/${params.siteId}/monetization/${contentId}`, {
      method: 'DELETE',
    });
    await fetchData();
    setSaving(false);
  };

  const totalRevenue = purchases
    .filter((p) => p.status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.amount_usd), 0);

  const pageTitle = (pageId: string | null) => {
    if (!pageId) return 'All pages (space-wide)';
    return pages.find((p) => p.id === pageId)?.title ?? pageId;
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Monetization
        </h1>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500">Loading monetization settings...</div>
      ) : !data ? (
        <div className="text-center py-20 text-zinc-500">Failed to load settings</div>
      ) : (
        <div className="space-y-6">
          {/* Revenue Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Purchases</p>
              <p className="text-2xl font-bold text-white">{purchases.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Premium Content</p>
              <p className="text-2xl font-bold text-white">{data.paid_content.length}</p>
            </div>
          </div>

          {/* Toggle & Wallet */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Enable Monetization</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Allow premium content gating with crypto payments</p>
              </div>
              <button
                type="button"
                onClick={toggleMonetization}
                disabled={saving}
                className="text-zinc-400 hover:text-white transition disabled:opacity-50"
              >
                {data.monetization_enabled ? (
                  <ToggleRight className="w-8 h-8 text-blue-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8" />
                )}
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <label className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4" /> Payout Wallet
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  placeholder="0x... or SOL address"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={saveWallet}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Premium Content List */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Premium Content</h2>
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {showForm && (
              <div className="mb-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Page (optional)</label>
                  <select
                    value={formPageId}
                    onChange={(e) => setFormPageId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All pages (space-wide)</option>
                    {pages.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="9.99"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1">Accepted Tokens (comma-separated)</label>
                  <input
                    type="text"
                    value={formTokens}
                    onChange={(e) => setFormTokens(e.target.value)}
                    placeholder="USDC, SOL, ETH"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addPaidContent}
                    disabled={saving || !formPrice}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {data.paid_content.length === 0 ? (
              <p className="text-sm text-zinc-600">No premium content configured yet</p>
            ) : (
              <div className="space-y-2">
                {data.paid_content.map((pc) => (
                  <div key={pc.id} className="flex items-center justify-between py-2 px-3 bg-zinc-800/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300 truncate">{pageTitle(pc.page_id)}</p>
                      <p className="text-xs text-zinc-500">
                        ${Number(pc.price_usd).toFixed(2)}
                        {pc.accepted_tokens.length > 0 && ` · ${pc.accepted_tokens.join(', ')}`}
                        {!pc.is_active && ' · Inactive'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deletePaidContent(pc.id)}
                      disabled={saving}
                      className="text-zinc-500 hover:text-red-400 transition p-1 disabled:opacity-50"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
