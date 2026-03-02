'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BarChart3, FileText, Search, ThumbsUp, ThumbsDown } from 'lucide-react';

interface AnalyticsData {
  pageviews: { date: string; count: number }[];
  topPages: { title: string; views: number }[];
  searches: { query: string; count: number }[];
  feedback: { page: string; helpful: number; notHelpful: number }[];
}

export default function AnalyticsPage() {
  const params = useParams<{ siteId: string }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/spaces/${params.siteId}/analytics?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.siteId, period]);

  const maxPV = data ? Math.max(...data.pageviews.map((p) => p.count), 1) : 1;
  const totalPV = data?.pageviews.reduce((sum, p) => sum + p.count, 0) ?? 0;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Analytics
        </h1>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                period === p ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {p === '7d' ? '7 days' : p === '30d' ? '30 days' : '90 days'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500">Loading analytics...</div>
      ) : !data ? (
        <div className="text-center py-20 text-zinc-500">Failed to load analytics</div>
      ) : (
        <div className="space-y-6">
          {/* Page Views Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Page Views</h2>
              <span className="text-2xl font-bold text-white">{totalPV.toLocaleString()}</span>
            </div>
            <div className="flex items-end gap-[2px] h-32">
              {data.pageviews.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-sm text-zinc-600">No data yet</div>
              ) : (
                data.pageviews.map((pv) => (
                  <div
                    key={pv.date}
                    className="flex-1 bg-blue-500/80 hover:bg-blue-400 transition rounded-t-sm relative group"
                    style={{ height: `${Math.max((pv.count / maxPV) * 100, 4)}%` }}
                    title={`${pv.date}: ${pv.count} views`}
                  >
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-800 text-xs text-white px-2 py-1 rounded whitespace-nowrap z-10">
                      {pv.date}: {pv.count}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Top Pages
              </h2>
              {data.topPages.length === 0 ? (
                <p className="text-sm text-zinc-600">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {data.topPages.map((page, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-zinc-300 truncate mr-2">{page.title}</span>
                      <span className="text-sm font-medium text-zinc-400 shrink-0">{page.views}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Searches */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Search className="w-4 h-4" /> Recent Searches
              </h2>
              {data.searches.length === 0 ? (
                <p className="text-sm text-zinc-600">No searches yet</p>
              ) : (
                <div className="space-y-2">
                  {data.searches.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-zinc-300 truncate mr-2">&ldquo;{s.query}&rdquo;</span>
                      <span className="text-sm font-medium text-zinc-400 shrink-0">{s.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Feedback Summary</h2>
            {data.feedback.length === 0 ? (
              <p className="text-sm text-zinc-600">No feedback yet</p>
            ) : (
              <div className="space-y-2">
                {data.feedback.map((fb, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-zinc-300 truncate mr-4">{fb.page}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1 text-sm text-green-400">
                        <ThumbsUp className="w-3.5 h-3.5" /> {fb.helpful}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-red-400">
                        <ThumbsDown className="w-3.5 h-3.5" /> {fb.notHelpful}
                      </span>
                    </div>
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
