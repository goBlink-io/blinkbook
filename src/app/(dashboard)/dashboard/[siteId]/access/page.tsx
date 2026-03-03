'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Shield, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { BBAccessRule } from '@/types/database';

const CHAINS = ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'solana'] as const;
const TOKEN_TYPES = ['ERC-20', 'ERC-721', 'ERC-1155', 'SPL'] as const;

interface RuleForm {
  chain: string;
  contract_address: string;
  token_type: string;
  min_amount: number;
  token_id: string;
}

const emptyForm: RuleForm = {
  chain: 'ethereum',
  contract_address: '',
  token_type: 'ERC-721',
  min_amount: 1,
  token_id: '',
};

export default function AccessRulesPage() {
  const params = useParams<{ siteId: string }>();
  const siteId = params.siteId;

  const [rules, setRules] = useState<BBAccessRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RuleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadRules = useCallback(async () => {
    const res = await fetch(`/api/spaces/${siteId}/access-rules`);
    if (res.ok) {
      const data: BBAccessRule[] = await res.json();
      setRules(data);
    }
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleCreate = async () => {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/spaces/${siteId}/access-rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        token_id: form.token_id || null,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setMessage({ type: 'error', text: err.error ?? 'Failed to create rule' });
    } else {
      setMessage({ type: 'success', text: 'Access rule created' });
      setForm(emptyForm);
      setShowForm(false);
      await loadRules();
    }
    setSaving(false);
  };

  const handleToggle = async (rule: BBAccessRule) => {
    const res = await fetch(`/api/spaces/${siteId}/access-rules/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !rule.is_active }),
    });

    if (res.ok) {
      await loadRules();
    }
  };

  const handleDelete = async (ruleId: string) => {
    const res = await fetch(`/api/spaces/${siteId}/access-rules/${ruleId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      setMessage({ type: 'success', text: 'Rule deleted' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Access Rules</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="mb-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">New Access Rule</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Chain</label>
              <select
                value={form.chain}
                onChange={(e) => setForm({ ...form, chain: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                {CHAINS.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Token Type</label>
              <select
                value={form.token_type}
                onChange={(e) => setForm({ ...form, token_type: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                {TOKEN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-zinc-400 mb-1">Contract Address</label>
              <input
                type="text"
                value={form.contract_address}
                onChange={(e) => setForm({ ...form, contract_address: e.target.value })}
                placeholder="0x..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Minimum Amount</label>
              <input
                type="number"
                value={form.min_amount}
                onChange={(e) => setForm({ ...form, min_amount: Number(e.target.value) })}
                min={1}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Token ID (optional)</label>
              <input
                type="text"
                value={form.token_id}
                onChange={(e) => setForm({ ...form, token_id: e.target.value })}
                placeholder="For ERC-1155"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCreate}
              disabled={saving || !form.contract_address}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
            >
              {saving ? 'Saving...' : 'Create Rule'}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm);
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
          <Shield className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 mb-1">No access rules yet</p>
          <p className="text-zinc-600 text-sm">
            Add a rule to gate this space behind NFT or token ownership.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`bg-zinc-900 border rounded-xl p-4 flex items-center gap-4 ${
                rule.is_active ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{rule.token_type}</span>
                  <span className="text-xs text-zinc-500">on</span>
                  <span className="text-sm text-blue-400">
                    {rule.chain.charAt(0).toUpperCase() + rule.chain.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-mono truncate">{rule.contract_address}</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Min: {rule.min_amount}
                  {rule.token_id ? ` · Token ID: ${rule.token_id}` : ''}
                </p>
              </div>
              <button
                onClick={() => handleToggle(rule)}
                className="text-zinc-400 hover:text-white transition"
                title={rule.is_active ? 'Disable' : 'Enable'}
              >
                {rule.is_active ? (
                  <ToggleRight className="w-6 h-6 text-green-400" />
                ) : (
                  <ToggleLeft className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={() => handleDelete(rule.id)}
                className="text-zinc-500 hover:text-red-400 transition"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
