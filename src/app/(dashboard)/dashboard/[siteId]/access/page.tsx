'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Shield, Plus, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { BBAccessRule, BBPage } from '@/types/database';

const CHAINS = [
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'polygon', label: 'Polygon' },
  { value: 'base', label: 'Base' },
  { value: 'arbitrum', label: 'Arbitrum' },
  { value: 'solana', label: 'Solana' },
  { value: 'sui', label: 'Sui' },
  { value: 'near', label: 'NEAR' },
];

const TOKEN_TYPES = [
  { value: 'ERC-20', label: 'ERC-20', chains: ['ethereum', 'polygon', 'base', 'arbitrum'] },
  { value: 'ERC-721', label: 'ERC-721', chains: ['ethereum', 'polygon', 'base', 'arbitrum'] },
  { value: 'ERC-1155', label: 'ERC-1155', chains: ['ethereum', 'polygon', 'base', 'arbitrum'] },
  { value: 'SPL', label: 'SPL Token', chains: ['solana'] },
  { value: 'SUI', label: 'SUI Token', chains: ['sui'] },
];

interface NewRuleForm {
  chain: string;
  contract_address: string;
  token_type: string;
  min_amount: string;
  token_id: string;
  page_id: string;
}

const emptyForm: NewRuleForm = {
  chain: 'ethereum',
  contract_address: '',
  token_type: 'ERC-20',
  min_amount: '1',
  token_id: '',
  page_id: '',
};

export default function AccessRulesPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const [rules, setRules] = useState<BBAccessRule[]>([]);
  const [pages, setPages] = useState<BBPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewRuleForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [rulesRes, pagesRes] = await Promise.all([
      fetch(`/api/spaces/${siteId}/access-rules`),
      fetch(`/api/spaces/${siteId}/pages`),
    ]);
    if (rulesRes.ok) setRules(await rulesRes.json());
    if (pagesRes.ok) setPages(await pagesRes.json());
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const availableTokenTypes = TOKEN_TYPES.filter((t) => t.chains.includes(form.chain));

  const handleCreate = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/spaces/${siteId}/access-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chain: form.chain,
          contract_address: form.contract_address,
          token_type: form.token_type,
          min_amount: Number(form.min_amount) || 1,
          token_id: form.token_id || null,
          page_id: form.page_id || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create rule');
        return;
      }
      const newRule = await res.json();
      setRules((prev) => [newRule, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: BBAccessRule) => {
    const res = await fetch(`/api/spaces/${siteId}/access-rules/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !rule.is_active }),
    });
    if (res.ok) {
      const updated = await res.json();
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
    }
  };

  const handleDelete = async (ruleId: string) => {
    const res = await fetch(`/api/spaces/${siteId}/access-rules/${ruleId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
    }
  };

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
          <Shield className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Token-Gated Access</h1>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">New Access Rule</h3>

          {error && (
            <p className="text-sm text-red-400 mb-4">{error}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Scope</label>
              <select
                value={form.page_id}
                onChange={(e) => setForm({ ...form, page_id: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Entire Space</option>
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Chain</label>
              <select
                value={form.chain}
                onChange={(e) => {
                  const chain = e.target.value;
                  const validTypes = TOKEN_TYPES.filter((t) => t.chains.includes(chain));
                  setForm({
                    ...form,
                    chain,
                    token_type: validTypes[0]?.value ?? form.token_type,
                  });
                }}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CHAINS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Token Type</label>
              <select
                value={form.token_type}
                onChange={(e) => setForm({ ...form, token_type: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableTokenTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Contract Address</label>
              <input
                type="text"
                value={form.contract_address}
                onChange={(e) => setForm({ ...form, contract_address: e.target.value })}
                placeholder="0x..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Minimum Amount</label>
              <input
                type="number"
                value={form.min_amount}
                onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
                min="1"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">Token ID (optional, for NFTs)</label>
              <input
                type="text"
                value={form.token_id}
                onChange={(e) => setForm({ ...form, token_id: e.target.value })}
                placeholder="e.g. 1234"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving || !form.contract_address}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Rule
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

      {rules.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No Access Rules</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Add token-gated access rules to restrict who can view your documentation based on token ownership.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => {
            const page = pages.find((p) => p.id === rule.page_id);
            return (
              <div
                key={rule.id}
                className={`bg-zinc-900 border rounded-xl px-5 py-4 ${
                  rule.is_active ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(rule)}
                      className="shrink-0"
                      title={rule.is_active ? 'Disable rule' : 'Enable rule'}
                    >
                      {rule.is_active ? (
                        <ToggleRight className="w-6 h-6 text-blue-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-600" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{rule.token_type}</span>
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                          {rule.chain.charAt(0).toUpperCase() + rule.chain.slice(1)}
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
                      <p className="text-xs text-zinc-500 font-mono mt-1 truncate">
                        {rule.contract_address}
                      </p>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Min: {rule.min_amount}
                        {rule.token_id ? ` · Token #${rule.token_id}` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(rule.id)}
                    className="shrink-0 p-2 text-zinc-500 hover:text-red-400 transition"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
