'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Check, Loader2, Upload, Trash2, FileText } from 'lucide-react';
import { themes, type ThemeName } from '@/config/themes';
import type { BBSpace, BBPage } from '@/types/database';

const THEME_NAMES: ThemeName[] = ['midnight', 'ocean', 'forest', 'sunset', 'lavender', 'arctic'];
type Tab = 'general' | 'branding' | 'domain' | 'reminders' | 'danger';

export default function SpaceSettingsPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const router = useRouter();
  const [space, setSpace] = useState<BBSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('midnight');
  const [customDomain, setCustomDomain] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Review reminders state
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDays, setReminderDays] = useState(90);
  const [stalePageCount, setStalePageCount] = useState<number | null>(null);
  const [trackedPages, setTrackedPages] = useState<BBPage[]>([]);
  const [savingPageExempt, setSavingPageExempt] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('bb_spaces')
        .select('*')
        .eq('id', siteId)
        .single();
      if (data) {
        setSpace(data);
        setName(data.name);
        setSlug(data.slug);
        setDescription(data.description ?? '');
        setSelectedTheme((data.theme?.preset as ThemeName) ?? 'midnight');
        setCustomDomain(data.custom_domain ?? '');
        setReminderEnabled(data.review_reminder_enabled ?? false);
        setReminderDays(data.review_reminder_days ?? 90);
      }
      setLoading(false);
    };
    load();
  }, [siteId]);

  // Fetch stale page count and page list when reminder tab is shown or days change
  useEffect(() => {
    if (tab !== 'reminders') return;
    const fetchRemindersData = async () => {
      setStalePageCount(null);
      const supabase = createClient();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - reminderDays);

      const [countResult, pagesResult] = await Promise.all([
        supabase
          .from('bb_pages')
          .select('id', { count: 'exact', head: true })
          .eq('space_id', siteId)
          .eq('review_exempt', false)
          .lt('updated_at', cutoff.toISOString()),
        supabase
          .from('bb_pages')
          .select('id, title, slug, updated_at, review_exempt')
          .eq('space_id', siteId)
          .order('title', { ascending: true }),
      ]);

      setStalePageCount(countResult.count ?? 0);
      setTrackedPages((pagesResult.data as BBPage[]) ?? []);
    };
    fetchRemindersData();
  }, [tab, reminderDays, siteId]);

  const save = useCallback(
    async (updates: Record<string, unknown>) => {
      setSaving(true);
      setMessage(null);
      const res = await fetch(`/api/spaces/${siteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error });
      } else {
        setSpace(data);
        setMessage({ type: 'success', text: 'Saved successfully' });
      }
      setSaving(false);
    },
    [siteId]
  );

  const handleDelete = async () => {
    if (deleteConfirm !== space?.name) return;
    const res = await fetch(`/api/spaces/${siteId}?confirm=true`, {
      method: 'DELETE',
    });
    if (res.ok) {
      router.push('/dashboard');
    } else {
      const data = await res.json();
      setMessage({ type: 'error', text: data.error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!space) {
    return (
      <div className="text-center py-24">
        <p className="text-zinc-400">Space not found</p>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'branding', label: 'Branding' },
    { key: 'domain', label: 'Domain' },
    { key: 'reminders', label: 'Review Reminders' },
    { key: 'danger', label: 'Danger Zone' },
  ];

  return (
    <div className="max-w-3xl">
      <Link
        href={`/dashboard/${siteId}`}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to {space.name}
      </Link>

      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

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

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-800 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setMessage(null);
            }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
              tab === t.key
                ? 'border-blue-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* General */}
      {tab === 'general' && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
              }
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <p className="text-xs text-zinc-500 mt-1">{slug}.blinkbook.goblink.io</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>
          <button
            onClick={() =>
              save({
                name: name.trim(),
                slug,
                description: description.trim() || null,
              })
            }
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save
          </button>
        </div>
      )}

      {/* Branding */}
      {tab === 'branding' && (
        <div>
          <h3 className="text-sm font-medium text-zinc-300 mb-4">Theme Preset</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {THEME_NAMES.map((themeName) => {
              const theme = themes[themeName];
              const isSelected = selectedTheme === themeName;
              return (
                <button
                  key={themeName}
                  onClick={() => setSelectedTheme(themeName)}
                  className={`relative rounded-xl border-2 p-4 transition text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/5'
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-6 h-6 rounded-md" style={{ backgroundColor: theme.primary }} />
                    <div className="w-6 h-6 rounded-md" style={{ backgroundColor: theme.secondary }} />
                    <div className="w-6 h-6 rounded-md border border-zinc-700" style={{ backgroundColor: theme.background }} />
                  </div>
                  <p className="text-sm font-medium text-white capitalize">{themeName}</p>
                </button>
              );
            })}
          </div>

          <h3 className="text-sm font-medium text-zinc-300 mb-4">Logo</h3>
          <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center mb-8">
            <Upload className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400 mb-1">Drag & drop or click to upload</p>
            <p className="text-xs text-zinc-600">PNG, JPG, SVG up to 2MB</p>
          </div>

          {/* Preview */}
          <h3 className="text-sm font-medium text-zinc-300 mb-4">Preview</h3>
          <div
            className="rounded-xl border border-zinc-800 p-6 mb-8"
            style={{ backgroundColor: themes[selectedTheme].background }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themes[selectedTheme].primary }} />
              <span className="text-sm font-medium" style={{ color: themes[selectedTheme].text.primary }}>
                {space.name}
              </span>
            </div>
            <div className="h-2 w-3/4 rounded-full mb-2" style={{ backgroundColor: themes[selectedTheme].surface }} />
            <div className="h-2 w-1/2 rounded-full" style={{ backgroundColor: themes[selectedTheme].surface }} />
          </div>

          <button
            onClick={() => save({ theme: { preset: selectedTheme } })}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Branding
          </button>
        </div>
      )}

      {/* Domain */}
      {tab === 'domain' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-1.5">Custom Domain</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Point your own domain to this documentation site.
            </p>
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="docs.yourdomain.com"
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h4 className="text-sm font-medium text-white mb-3">Setup Instructions</h4>
            <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
              <li>Go to your DNS provider</li>
              <li>
                Add a <code className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">CNAME</code> record
                pointing to <code className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded text-xs">blinkbook.goblink.io</code>
              </li>
              <li>Click &quot;Save & Verify&quot; below</li>
            </ol>
          </div>

          <button
            onClick={() => save({ custom_domain: customDomain.trim() || null })}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save & Verify
          </button>
        </div>
      )}

      {/* Review Reminders */}
      {tab === 'reminders' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-1">Review Reminders</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Get email alerts when pages haven&apos;t been updated in a while.
            </p>
          </div>

          {/* Enable toggle */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">Enable review reminders</p>
              <p className="text-xs text-zinc-500 mt-0.5">Send periodic emails listing pages that need attention</p>
            </div>
            <button
              type="button"
              onClick={() => setReminderEnabled((v) => !v)}
              className={`relative inline-flex w-11 h-6 rounded-full transition-colors ${
                reminderEnabled ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
              role="switch"
              aria-checked={reminderEnabled}
            >
              <span
                className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform mt-1 ${
                  reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Days selector */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Days before a page is considered stale
            </label>
            <div className="flex gap-2">
              {[30, 60, 90, 180].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setReminderDays(d)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                    reminderDays === d
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Stale page preview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-1">Preview</p>
            {stalePageCount === null ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-sm text-zinc-500">Counting stale pages…</span>
              </div>
            ) : (
              <p className="text-sm text-zinc-300">
                <span className={`font-semibold ${stalePageCount > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                  {stalePageCount}
                </span>
                {' '}
                {stalePageCount === 1 ? 'page has' : 'pages have'} not been updated in over{' '}
                <span className="text-white font-medium">{reminderDays} days</span>
              </p>
            )}
          </div>

          {/* Page tracking */}
          {trackedPages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Pages to track
              </label>
              <p className="text-xs text-zinc-500 mb-3">
                Exempt pages won&apos;t trigger review reminders.
              </p>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800 max-h-64 overflow-y-auto">
                {trackedPages.map((page) => (
                  <label
                    key={page.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="text-sm text-zinc-300 truncate">{page.title}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={!page.review_exempt}
                      disabled={savingPageExempt === page.id}
                      onChange={async () => {
                        setSavingPageExempt(page.id);
                        const newExempt = !page.review_exempt;
                        const res = await fetch(`/api/spaces/${siteId}/pages/${page.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ review_exempt: newExempt }),
                        });
                        if (res.ok) {
                          setTrackedPages((prev) =>
                            prev.map((p) =>
                              p.id === page.id ? { ...p, review_exempt: newExempt } : p
                            )
                          );
                        }
                        setSavingPageExempt(null);
                      }}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 shrink-0"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() =>
              save({
                review_reminder_enabled: reminderEnabled,
                review_reminder_days: reminderDays,
              })
            }
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Reminder Settings
          </button>
        </div>
      )}

      {/* Danger Zone */}
      {tab === 'danger' && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Delete Space</h3>
          <p className="text-sm text-zinc-400 mb-4">
            This action is permanent and cannot be undone. All pages, settings, and data will be deleted.
          </p>
          <div className="mb-4">
            <label className="block text-sm text-zinc-400 mb-1.5">
              Type <span className="text-white font-medium">{space.name}</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              placeholder={space.name}
            />
          </div>
          <button
            onClick={handleDelete}
            disabled={deleteConfirm !== space.name}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" /> Delete Space
          </button>
        </div>
      )}
    </div>
  );
}
