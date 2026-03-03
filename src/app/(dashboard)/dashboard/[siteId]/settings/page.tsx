'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Check, Loader2, Upload, Trash2, Image as ImageIcon, X, FileText, Search, Globe, Download } from 'lucide-react';
import { tiptapToMarkdown } from '@/lib/tiptap-to-markdown';
import { themes, type ThemeName } from '@/config/themes';
import type { BBSpace, BBPage } from '@/types/database';

const THEME_NAMES: ThemeName[] = ['midnight', 'ocean', 'forest', 'sunset', 'lavender', 'arctic'];
const BRAND_FONTS = ['Inter', 'Roboto', 'Source Sans Pro', 'Merriweather', 'JetBrains Mono'] as const;
type BrandFont = (typeof BRAND_FONTS)[number];
type Tab = 'general' | 'branding' | 'domain' | 'seo' | 'reminders' | 'ai' | 'data' | 'danger';

export default function SpaceSettingsPage() {
  const { siteId } = useParams<{ siteId: string }>();
  const router = useRouter();
  const [space, setSpace] = useState<BBSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>('general');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // General form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('midnight');
  const [customDomain, setCustomDomain] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Custom branding state
  const [brandPrimary, setBrandPrimary] = useState('#3B82F6');
  const [brandAccent, setBrandAccent] = useState('#10B981');
  const [brandFont, setBrandFont] = useState<BrandFont>('Inter');
  const [brandHidePoweredBy, setBrandHidePoweredBy] = useState(false);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI & Integrations state
  const [llmsTxtEnabled, setLlmsTxtEnabled] = useState(true);

  // SEO state
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState<string | null>(null);
  const [ogImageUploading, setOgImageUploading] = useState(false);
  const ogImageInputRef = useRef<HTMLInputElement>(null);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [socialTwitter, setSocialTwitter] = useState('');

  // Export state
  const [exporting, setExporting] = useState(false);

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
        setBrandPrimary(data.brand_primary_color ?? '#3B82F6');
        setBrandAccent(data.brand_accent_color ?? '#10B981');
        setBrandFont((data.brand_font as BrandFont) ?? 'Inter');
        setBrandHidePoweredBy(data.brand_hide_powered_by ?? false);
        setBrandLogoUrl(data.brand_logo_url ?? null);
        setReminderEnabled(data.review_reminder_enabled ?? false);
        setReminderDays(data.review_reminder_days ?? 90);
        setLlmsTxtEnabled(data.llms_txt_enabled ?? true);
        setMetaTitle(data.meta_title ?? '');
        setMetaDescription(data.meta_description ?? '');
        setOgImageUrl(data.og_image_url ?? null);
        setFaviconUrl(data.favicon_url ?? null);
        setSocialTwitter(data.social_twitter ?? '');
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

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/spaces/${siteId}/logo`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error });
    } else {
      setBrandLogoUrl(data.url);
      setSpace(data.space);
      setMessage({ type: 'success', text: 'Logo uploaded' });
    }
    setLogoUploading(false);
  };

  const handleLogoRemove = async () => {
    setLogoUploading(true);
    setMessage(null);
    const res = await fetch(`/api/spaces/${siteId}/logo`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error });
    } else {
      setBrandLogoUrl(null);
      setSpace(data.space);
      setMessage({ type: 'success', text: 'Logo removed' });
    }
    setLogoUploading(false);
  };

  const handleOgImageUpload = async (file: File) => {
    setOgImageUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/spaces/${siteId}/og-image`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error });
    } else {
      setOgImageUrl(data.url);
      setSpace(data.space);
      setMessage({ type: 'success', text: 'OG image uploaded' });
    }
    setOgImageUploading(false);
  };

  const handleOgImageRemove = async () => {
    setOgImageUploading(true);
    setMessage(null);
    const res = await fetch(`/api/spaces/${siteId}/og-image`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error });
    } else {
      setOgImageUrl(null);
      setSpace(data.space);
      setMessage({ type: 'success', text: 'OG image removed' });
    }
    setOgImageUploading(false);
  };

  const handleFaviconUpload = async (file: File) => {
    setFaviconUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/spaces/${siteId}/favicon`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error });
    } else {
      setFaviconUrl(data.url);
      setSpace(data.space);
      setMessage({ type: 'success', text: 'Favicon uploaded' });
    }
    setFaviconUploading(false);
  };

  const handleFaviconRemove = async () => {
    setFaviconUploading(true);
    setMessage(null);
    const res = await fetch(`/api/spaces/${siteId}/favicon`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ type: 'error', text: data.error });
    } else {
      setFaviconUrl(null);
      setSpace(data.space);
      setMessage({ type: 'success', text: 'Favicon removed' });
    }
    setFaviconUploading(false);
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
    { key: 'seo', label: 'SEO' },
    { key: 'reminders', label: 'Review Reminders' },
    { key: 'ai', label: 'AI & Integrations' },
    { key: 'data', label: 'Data' },
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
      <div className="relative mb-8">
        <div className="flex gap-1 border-b border-zinc-800 overflow-x-auto scrollbar-hide">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setMessage(null);
              }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px whitespace-nowrap shrink-0 ${
                tab === t.key
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Fade hint for scrollable tabs */}
        <div className="absolute top-0 right-0 bottom-px w-8 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none md:hidden" />
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
        <div className="space-y-10">
          {/* Theme Preset */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Theme Preset</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
          </section>

          {/* Logo Upload */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-1.5">Brand Logo</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Shown in the header of your published site. PNG, JPG, SVG, GIF or WebP, max 2MB.
            </p>
            {brandLogoUrl ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border border-zinc-700 bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brandLogoUrl} alt="Brand logo" className="w-full h-full object-contain p-1" />
                </div>
                <button
                  onClick={handleLogoRemove}
                  disabled={logoUploading}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg transition disabled:opacity-50"
                >
                  {logoUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Remove logo
                </button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleLogoUpload(file);
                }}
                className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-8 text-center cursor-pointer transition"
              >
                {logoUploading ? (
                  <Loader2 className="w-8 h-8 text-zinc-500 mx-auto mb-3 animate-spin" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                )}
                <p className="text-sm text-zinc-400 mb-1">
                  {logoUploading ? 'Uploading…' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-zinc-600">PNG, JPG, SVG, GIF, WebP up to 2MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoUpload(file);
                e.target.value = '';
              }}
            />
          </section>

          {/* Colors */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Brand Colors</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-zinc-400 mb-2">Primary Color</label>
                <p className="text-xs text-zinc-600 mb-3">Used for links, active nav items, and buttons.</p>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={brandPrimary}
                      onChange={(e) => setBrandPrimary(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-zinc-700 cursor-pointer bg-zinc-800 p-0.5"
                    />
                  </div>
                  <input
                    type="text"
                    value={brandPrimary}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setBrandPrimary(v);
                    }}
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="#3B82F6"
                    maxLength={7}
                  />
                  <div className="w-8 h-8 rounded-lg border border-zinc-700 shrink-0" style={{ backgroundColor: brandPrimary }} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-2">Accent Color</label>
                <p className="text-xs text-zinc-600 mb-3">Used for code blocks, callouts, and highlights.</p>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={brandAccent}
                      onChange={(e) => setBrandAccent(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-zinc-700 cursor-pointer bg-zinc-800 p-0.5"
                    />
                  </div>
                  <input
                    type="text"
                    value={brandAccent}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setBrandAccent(v);
                    }}
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="#10B981"
                    maxLength={7}
                  />
                  <div className="w-8 h-8 rounded-lg border border-zinc-700 shrink-0" style={{ backgroundColor: brandAccent }} />
                </div>
              </div>
            </div>
          </section>

          {/* Font */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-1.5">Body Font</h3>
            <p className="text-xs text-zinc-500 mb-4">Applied to the body text of your published documentation.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BRAND_FONTS.map((font) => (
                <button
                  key={font}
                  onClick={() => setBrandFont(font)}
                  className={`px-4 py-3 rounded-xl border-2 text-left transition ${
                    brandFont === font
                      ? 'border-blue-500 bg-blue-500/5'
                      : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900'
                  }`}
                >
                  <p className="text-xs text-zinc-500 mb-0.5">Aa</p>
                  <p className="text-sm text-white font-medium">{font}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Powered By */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Footer Badge</h3>
            <label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
              <div>
                <p className="text-sm text-white font-medium">Hide &ldquo;Powered by goBlink Book&rdquo;</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Remove the powered-by attribution from your site footer.
                </p>
              </div>
              <div
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  brandHidePoweredBy ? 'bg-blue-600' : 'bg-zinc-700'
                }`}
                onClick={() => setBrandHidePoweredBy((v) => !v)}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    brandHidePoweredBy ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
            </label>
          </section>

          {/* Live Preview */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-4">Live Preview</h3>
            <div
              className="rounded-xl border border-zinc-700 overflow-hidden"
              style={{ fontFamily: brandFont === 'JetBrains Mono' ? 'monospace' : brandFont + ', sans-serif' }}
            >
              {/* Preview Header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: brandPrimary + '33', backgroundColor: brandPrimary + '0d' }}>
                {brandLogoUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={brandLogoUrl} alt="" className="w-7 h-7 rounded object-contain" />
                ) : (
                  <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: brandPrimary }}>
                    <Upload className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <span className="text-sm font-bold text-white">{space.name}</span>
              </div>

              <div className="flex bg-zinc-900">
                {/* Preview Sidebar */}
                <div className="w-48 border-r border-zinc-800 p-4 space-y-1 shrink-0">
                  <div
                    className="text-sm px-3 py-1.5 rounded border-l-2 font-medium"
                    style={{ color: 'white', borderColor: brandPrimary, backgroundColor: brandPrimary + '1a' }}
                  >
                    Getting Started
                  </div>
                  <div className="text-sm px-3 py-1.5 text-zinc-500 border-l-2 border-transparent">
                    Installation
                  </div>
                  <div className="text-sm px-3 py-1.5 text-zinc-500 border-l-2 border-transparent">
                    Configuration
                  </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 p-5 space-y-3 min-w-0">
                  <h2 className="text-base font-bold text-white">Getting Started</h2>
                  <p className="text-sm text-zinc-400">
                    Welcome to your documentation.{' '}
                    <span className="font-medium" style={{ color: brandPrimary }}>Learn more →</span>
                  </p>
                  <div
                    className="rounded-lg px-3 py-2 text-xs font-mono"
                    style={{ backgroundColor: brandAccent + '18', color: brandAccent, borderLeft: `3px solid ${brandAccent}` }}
                  >
                    npm install my-package
                  </div>
                  {!brandHidePoweredBy && (
                    <p className="text-xs text-zinc-600 pt-2">
                      Built with <span className="text-zinc-400">BlinkBook</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <button
            onClick={() =>
              save({
                theme: { preset: selectedTheme },
                brand_primary_color: brandPrimary,
                brand_accent_color: brandAccent,
                brand_font: brandFont,
                brand_hide_powered_by: brandHidePoweredBy,
              })
            }
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

      {/* SEO */}
      {tab === 'seo' && (
        <div className="space-y-10">
          {/* Meta Title */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-1.5">Meta Title</h3>
            <p className="text-xs text-zinc-500 mb-3">
              Overrides the default title in search results and social shares.
            </p>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder={space.name}
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </section>

          {/* Meta Description */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-1.5">Meta Description</h3>
            <p className="text-xs text-zinc-500 mb-3">
              Shown below the title in search results. Aim for 150–160 characters.
            </p>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              placeholder="A concise description of your documentation site…"
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
            <div className="flex justify-end mt-1.5">
              <span
                className={`text-xs ${
                  metaDescription.length >= 150 && metaDescription.length <= 160
                    ? 'text-green-400'
                    : metaDescription.length > 160
                      ? 'text-amber-400'
                      : 'text-zinc-500'
                }`}
              >
                {metaDescription.length}/160
              </span>
            </div>
          </section>

          {/* OG Image Upload */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-1.5">Social Share Image (OG Image)</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Shown when your site is shared on social media. Recommended: 1200×630px. PNG, JPG, GIF, or WebP, max 2MB.
            </p>
            {ogImageUrl ? (
              <div className="flex items-center gap-4">
                <div className="w-40 h-[84px] rounded-xl border border-zinc-700 bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ogImageUrl} alt="OG image" className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={handleOgImageRemove}
                  disabled={ogImageUploading}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg transition disabled:opacity-50"
                >
                  {ogImageUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Remove
                </button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => ogImageInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && ogImageInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleOgImageUpload(file);
                }}
                className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-8 text-center cursor-pointer transition"
              >
                {ogImageUploading ? (
                  <Loader2 className="w-8 h-8 text-zinc-500 mx-auto mb-3 animate-spin" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                )}
                <p className="text-sm text-zinc-400 mb-1">
                  {ogImageUploading ? 'Uploading…' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-zinc-600">1200×630px recommended · PNG, JPG, GIF, WebP up to 2MB</p>
              </div>
            )}
            <input
              ref={ogImageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleOgImageUpload(file);
                e.target.value = '';
              }}
            />
          </section>

          {/* Twitter / X Handle */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-1.5">Twitter / X Handle</h3>
            <p className="text-xs text-zinc-500 mb-3">
              Used for Twitter Card attribution (e.g. @yourhandle).
            </p>
            <input
              type="text"
              value={socialTwitter}
              onChange={(e) => setSocialTwitter(e.target.value)}
              placeholder="@yourhandle"
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </section>

          {/* Favicon Upload */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-1.5">Favicon</h3>
            <p className="text-xs text-zinc-500 mb-4">
              The small icon shown in the browser tab. PNG, ICO, or SVG, max 512KB.
            </p>
            {faviconUrl ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain p-1" />
                </div>
                <button
                  onClick={handleFaviconRemove}
                  disabled={faviconUploading}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 rounded-lg transition disabled:opacity-50"
                >
                  {faviconUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Remove
                </button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => faviconInputRef.current?.click()}
                onKeyDown={(e) => e.key === 'Enter' && faviconInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFaviconUpload(file);
                }}
                className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-6 text-center cursor-pointer transition"
              >
                {faviconUploading ? (
                  <Loader2 className="w-6 h-6 text-zinc-500 mx-auto mb-2 animate-spin" />
                ) : (
                  <Globe className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                )}
                <p className="text-sm text-zinc-400">
                  {faviconUploading ? 'Uploading…' : 'Upload favicon'}
                </p>
              </div>
            )}
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/png,image/x-icon,image/svg+xml,image/vnd.microsoft.icon"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFaviconUpload(file);
                e.target.value = '';
              }}
            />
          </section>

          {/* SERP Preview */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-4">
              <Search className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Google Search Preview
            </h3>
            <div className="bg-white rounded-xl p-5 max-w-xl">
              <div className="text-sm text-[#202124] mb-1 truncate">
                {space.custom_domain
                  ? `https://${space.custom_domain}`
                  : `https://${space.slug}.blinkbook.goblink.io`}
              </div>
              <div className="text-xl text-[#1a0dab] mb-1 truncate leading-snug hover:underline cursor-default">
                {metaTitle || space.name}
              </div>
              <div className="text-sm text-[#4d5156] line-clamp-2 leading-relaxed">
                {metaDescription || space.description || `Documentation for ${space.name}`}
              </div>
            </div>
          </section>

          <button
            onClick={() =>
              save({
                meta_title: metaTitle.trim() || null,
                meta_description: metaDescription.trim() || null,
                social_twitter: socialTwitter.trim() || null,
              })
            }
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save SEO Settings
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

      {/* AI & Integrations */}
      {tab === 'ai' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-1">AI & Integrations</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Make your documentation accessible to AI agents and LLM-powered tools.
            </p>
          </div>

          {/* llms.txt toggle */}
          <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">Enable llms.txt</p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Auto-generate <code className="text-zinc-400 bg-zinc-800 px-1 py-0.5 rounded text-xs">llms.txt</code> and{' '}
                <code className="text-zinc-400 bg-zinc-800 px-1 py-0.5 rounded text-xs">llms-full.txt</code> files so AI
                agents can consume your documentation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLlmsTxtEnabled((v) => !v)}
              className={`relative inline-flex w-11 h-6 rounded-full transition-colors shrink-0 ml-4 ${
                llmsTxtEnabled ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
              role="switch"
              aria-checked={llmsTxtEnabled}
            >
              <span
                className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform mt-1 ${
                  llmsTxtEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Preview URLs */}
          {llmsTxtEnabled && space.is_published && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-3">Available at</p>
              <div className="space-y-2">
                {[
                  { label: 'llms.txt', path: '/llms.txt' },
                  { label: 'llms-full.txt', path: '/llms-full.txt' },
                ].map((file) => {
                  const baseUrl = space.custom_domain
                    ? `https://${space.custom_domain}`
                    : `https://${space.slug}.blinkbook.goblink.io`;
                  const url = `${baseUrl}${file.path}`;
                  return (
                    <div key={file.label} className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 transition truncate"
                      >
                        {url}
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={() => save({ llms_txt_enabled: llmsTxtEnabled })}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save AI Settings
          </button>
        </div>
      )}

      {/* Data */}
      {tab === 'data' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-1">Export</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Download all your pages as a single Markdown file.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Export All Pages</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Downloads all pages as a concatenated Markdown file with page separators.
                </p>
              </div>
              <button
                type="button"
                disabled={exporting}
                onClick={async () => {
                  setExporting(true);
                  setMessage(null);
                  try {
                    const res = await fetch(`/api/spaces/${siteId}/export`);
                    if (!res.ok) throw new Error('Export failed');
                    const pages: { title: string; slug: string; content: { type: 'doc'; content: unknown[] } }[] = await res.json();
                    const parts = pages.map((page) => {
                      const md = tiptapToMarkdown(page.content as Parameters<typeof tiptapToMarkdown>[0]);
                      return `# ${page.title}\n\n${md}`;
                    });
                    const markdown = parts.join('\n\n---\n\n');
                    const blob = new Blob([markdown], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${space.slug}-export.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setMessage({ type: 'success', text: `Exported ${pages.length} pages` });
                  } catch {
                    setMessage({ type: 'error', text: 'Failed to export pages' });
                  }
                  setExporting(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50 shrink-0"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {exporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
          </div>
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
