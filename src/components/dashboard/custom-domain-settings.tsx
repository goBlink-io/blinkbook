'use client';

import { useState } from 'react';
import { Globe, Check, Loader2, AlertCircle, Trash2, Copy } from 'lucide-react';

interface CustomDomainSettingsProps {
  spaceId: string;
  currentDomain: string | null;
}

type DomainStatus = 'none' | 'pending' | 'verified' | 'failed';

export function CustomDomainSettings({ spaceId, currentDomain }: CustomDomainSettingsProps) {
  const [domain, setDomain] = useState(currentDomain ?? '');
  const [status, setStatus] = useState<DomainStatus>(currentDomain ? 'pending' : 'none');
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    if (!domain.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      if (res.ok) {
        setStatus('pending');
      }
    } catch {
      // ignore
    }
    setSaving(false);
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/spaces/${spaceId}/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verify: true }),
      });
      const data = await res.json();
      setStatus(data.status === 'verified' ? 'verified' : 'failed');
    } catch {
      setStatus('failed');
    }
    setVerifying(false);
  };

  const handleRemove = async () => {
    try {
      await fetch(`/api/spaces/${spaceId}/domain`, { method: 'DELETE' });
      setDomain('');
      setStatus('none');
    } catch {
      // ignore
    }
  };

  const copyTarget = () => {
    navigator.clipboard.writeText('cname.vercel-dns.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
        <Globe className="w-4 h-4" />
        Custom Domain
      </h3>

      {status === 'none' ? (
        <div className="space-y-3">
          <div>
            <label htmlFor="domain" className="block text-sm text-zinc-400 mb-1.5">
              Domain name
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="docs.example.com"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !domain.trim()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Domain'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white font-medium">{domain}</span>
            <div className="flex items-center gap-2">
              {status === 'verified' && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <Check className="w-3 h-3" /> Verified
                </span>
              )}
              {status === 'pending' && (
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <AlertCircle className="w-3 h-3" /> Pending
                </span>
              )}
              {status === 'failed' && (
                <span className="flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle className="w-3 h-3" /> Failed
                </span>
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 text-zinc-500 hover:text-red-400 transition"
                title="Remove domain"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {status !== 'verified' && (
            <>
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-sm">
                <p className="text-zinc-300 mb-2">Add a CNAME record in your DNS settings:</p>
                <div className="flex items-center justify-between bg-zinc-900 rounded px-3 py-2">
                  <code className="text-xs text-zinc-300">
                    {domain} → <span className="text-blue-400">cname.vercel-dns.com</span>
                  </code>
                  <button
                    type="button"
                    onClick={copyTarget}
                    className="text-zinc-500 hover:text-white transition ml-2"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying}
                className="px-4 py-2 text-sm font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {verifying ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                  </span>
                ) : (
                  'Verify DNS'
                )}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
