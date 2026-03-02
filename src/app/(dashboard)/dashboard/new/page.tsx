'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

const themePresets = [
  { id: 'midnight', name: 'Midnight', colors: { primary: '#2563eb', secondary: '#7c3aed', bg: '#09090b', surface: '#18181b' } },
  { id: 'ocean', name: 'Ocean', colors: { primary: '#0891b2', secondary: '#06b6d4', bg: '#0c1222', surface: '#131c31' } },
  { id: 'forest', name: 'Forest', colors: { primary: '#16a34a', secondary: '#22c55e', bg: '#0a0f0d', surface: '#141f1a' } },
  { id: 'sunset', name: 'Sunset', colors: { primary: '#f97316', secondary: '#ef4444', bg: '#0c0a09', surface: '#1c1917' } },
  { id: 'lavender', name: 'Lavender', colors: { primary: '#8b5cf6', secondary: '#a78bfa', bg: '#0f0b1e', surface: '#1a1333' } },
  { id: 'arctic', name: 'Arctic', colors: { primary: '#3b82f6', secondary: '#60a5fa', bg: '#ffffff', surface: '#f8fafc' } },
];

const spaceSchema = z.object({
  name: z.string().min(1, 'Site name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(63).regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  description: z.string().max(500).optional(),
});

type SpaceForm = z.infer<typeof spaceSchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63);
}

export default function NewSpacePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState('midnight');
  const [creating, setCreating] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<SpaceForm>({
    resolver: zodResolver(spaceSchema),
    defaultValues: { name: '', slug: '', description: '' },
  });

  const nameValue = watch('name');
  const slugValue = watch('slug');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('name', name);
    const currentSlug = watch('slug');
    if (!currentSlug || currentSlug === slugify(nameValue)) {
      setValue('slug', slugify(name));
    }
  };

  const goToStep2 = async () => {
    const valid = await trigger(['name', 'slug']);
    if (valid) setStep(2);
  };

  const createSpace = async (data: SpaceForm) => {
    setCreating(true);
    setServerError('');

    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          theme: { preset: selectedTheme },
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error || 'Failed to create space');
        setCreating(false);
        return;
      }

      const { id } = await res.json();
      router.push(`/dashboard/${id}`);
    } catch {
      setServerError('Something went wrong. Please try again.');
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s < step
                  ? 'bg-blue-600 text-white'
                  : s === step
                  ? 'bg-zinc-800 text-white border-2 border-blue-500'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-blue-600' : 'bg-zinc-800'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Name */}
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Name your site</h1>
          <p className="text-zinc-400 mb-8">Choose a name and URL for your documentation site.</p>

          <div className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Site name
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                onChange={handleNameChange}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-lg placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="My Awesome Docs"
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-zinc-300 mb-1.5">
                URL slug
              </label>
              <div className="flex items-center gap-0">
                <input
                  id="slug"
                  type="text"
                  {...register('slug')}
                  className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-l-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="my-awesome-docs"
                />
                <div className="px-4 py-3 bg-zinc-800 border border-l-0 border-zinc-700 rounded-r-lg text-sm text-zinc-400 whitespace-nowrap">
                  .blinkbook.goblink.io
                </div>
              </div>
              {errors.slug && (
                <p className="text-sm text-red-400 mt-1">{errors.slug.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Description <span className="text-zinc-600">(optional)</span>
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder="What is this documentation about?"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={goToStep2}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Theme */}
      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Choose a theme</h1>
          <p className="text-zinc-400 mb-8">Pick a color scheme for your docs site. You can change this later.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {themePresets.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedTheme(theme.id)}
                className={`relative p-4 rounded-xl border transition text-left ${
                  selectedTheme === theme.id
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-zinc-900'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <p className="text-sm font-medium text-white mb-3">{theme.name}</p>
                <div className="flex gap-1.5">
                  <div className="w-6 h-6 rounded-full border border-zinc-700" style={{ background: theme.colors.primary }} />
                  <div className="w-6 h-6 rounded-full border border-zinc-700" style={{ background: theme.colors.secondary }} />
                  <div className="w-6 h-6 rounded-full border border-zinc-700" style={{ background: theme.colors.bg }} />
                  <div className="w-6 h-6 rounded-full border border-zinc-700" style={{ background: theme.colors.surface }} />
                </div>
                {selectedTheme === theme.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Summary */}
      {step === 3 && (
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">You&apos;re ready!</h1>
          <p className="text-zinc-400 mb-8">Review your choices and create your space.</p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 mb-8">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Site name</p>
              <p className="text-white font-medium">{nameValue || '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">URL</p>
              <p className="text-white">{slugValue || '\u2014'}.blinkbook.goblink.io</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Theme</p>
              <div className="flex items-center gap-2">
                <span className="text-white capitalize">{selectedTheme}</span>
                {(() => {
                  const theme = themePresets.find((t) => t.id === selectedTheme);
                  if (!theme) return null;
                  return (
                    <div className="flex gap-1">
                      <div className="w-4 h-4 rounded-full border border-zinc-700" style={{ background: theme.colors.primary }} />
                      <div className="w-4 h-4 rounded-full border border-zinc-700" style={{ background: theme.colors.secondary }} />
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 mb-6">
              {serverError}
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={handleSubmit(createSpace)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg transition"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Space
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
