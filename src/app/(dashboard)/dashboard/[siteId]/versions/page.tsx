'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Check, Loader2, Trash2, Star } from 'lucide-react';
import type { BBVersion } from '@/types/database';

export default function VersionsPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const [versions, setVersions] = useState<BBVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadVersions = useCallback(async () => {
    const res = await fetch(`/api/spaces/${siteId}/versions`);
    if (res.ok) {
      const data = await res.json();
      setVersions(data);
    }
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  const handleCreate = async () => {
    if (!label.trim()) return;
    setCreating(true);
    setMessage(null);
    const res = await fetch(`/api/spaces/${siteId}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: label.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error });
    } else {
      setMessage({ type: 'success', text: `Version "${data.label}" created` });
      setLabel('');
      setShowCreate(false);
      await loadVersions();
    }
    setCreating(false);
  };

  const handleSetCurrent = async (versionId: string) => {
    setMessage(null);
    const res = await fetch(`/api/spaces/${siteId}/versions/${versionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_current: true }),
    });
    if (!res.ok) {
      const data = await res.json();
      setMessage({ type: 'error', text: data.error });
    } else {
      setMessage({ type: 'success', text: 'Current version updated' });
      await loadVersions();
    }
  };

  const handleDelete = async (versionId: string, versionLabel: string) => {
    if (!confirm(`Delete version "${versionLabel}"? This cannot be undone.`)) return;
    setMessage(null);
    const res = await fetch(`/api/spaces/${siteId}/versions/${versionId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const data = await res.json();
      setMessage({ type: 'error', text: data.error });
    } else {
      setMessage({ type: 'success', text: `Version "${versionLabel}" deleted` });
      await loadVersions();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href={`/dashboard/${siteId}`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Overview
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Versions</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition font-medium"
        >
          <Plus className="w-4 h-4" />
          New Version
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm mb-6 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {showCreate && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">Create Version</h3>
          <p className="text-xs text-zinc-500 mb-4">
            This will snapshot all currently published pages into a new version.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. v1.0, v2.0"
              className="flex-1 px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              disabled={creating || !label.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Create
            </button>
          </div>
        </div>
      )}

      {versions.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Star className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 mb-1">No versions yet</p>
          <p className="text-sm text-zinc-600">Create your first version to snapshot your published pages.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
          {versions.map((version) => (
            <div
              key={version.id}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-zinc-800/50 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm text-white font-medium">{version.label}</span>
                {version.is_current && (
                  <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-zinc-500">
                  {new Date(version.created_at).toLocaleDateString()}
                </span>
                {!version.is_current && (
                  <button
                    onClick={() => handleSetCurrent(version.id)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition"
                  >
                    Set Current
                  </button>
                )}
                <button
                  onClick={() => handleDelete(version.id, version.label)}
                  className="text-zinc-500 hover:text-red-400 transition p-1"
                  title="Delete version"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
