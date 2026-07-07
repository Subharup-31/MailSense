'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Database,
  Layers,
  Activity,
  Flame,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  LogOut
} from 'lucide-react';
import StatsCards from '@/components/stats-cards';
import { 
  MetricRadarChart, 
  CategoryBarChart, 
  ConfidenceDonutChart 
} from '@/components/charts';
import Link from 'next/link';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to retrieve analytics data');
      }
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            <BarChart3 className="h-3.5 w-3.5" />
            Evaluation dashboard
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">System Performance</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Monitor response quality, rule pass rates, latency, and self-correction outcomes across generated replies.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex min-w-36 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Analytics</span>
          </button>
        </div>
      </div>

      {loading ? (
        // Loading Skeletons
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-lg border border-slate-200 bg-slate-200/40 dark:border-slate-800 dark:bg-slate-800/40" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 animate-pulse">
            <div className="h-80 rounded-lg border border-slate-200 bg-slate-200/40 dark:border-slate-800 dark:bg-slate-800/40" />
            <div className="h-80 rounded-lg border border-slate-200 bg-slate-200/40 dark:border-slate-800 dark:bg-slate-800/40" />
            <div className="h-80 rounded-lg border border-slate-200 bg-slate-200/40 dark:border-slate-800 dark:bg-slate-800/40" />
          </div>
        </div>
      ) : error ? (
        <div className="glass-card mx-auto max-w-2xl rounded-lg border border-rose-200 p-8 text-center dark:border-rose-900/50">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">Failed to load dashboard data</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Retry Fetch
          </button>
        </div>
      ) : !data || data.summary.totalEvaluations === 0 ? (
        <div className="glass-card mx-auto max-w-3xl rounded-lg border border-slate-200 p-8 text-center dark:border-slate-800">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60">
            <Database className="h-6 w-6" />
          </div>
          <div className="mt-5">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">No evaluation data yet</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              The database is connected, but no evaluation logs have been written. Seed the benchmark dataset or run the dashboard chat to populate this dashboard.
            </p>
          </div>
          <div className="mx-auto mt-5 max-w-md rounded-lg border border-slate-200 bg-slate-50 p-3 text-left font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            npm run db:seed
          </div>
          <div className="mt-6 flex justify-center">
            <Link 
              href="/dashboard/chat" 
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              Go to Chat
            </Link>
          </div>
        </div>
      ) : (
        // Active Dashboard
        <div className="space-y-6">
          <StatsCards
            totalEvaluations={data.summary.totalEvaluations}
            averageScore={data.summary.averageScore}
            averageLatencyMs={data.summary.averageLatencyMs}
            tokenUsageTotal={data.summary.tokenUsage.total}
            improvementRate={data.selfCorrection.improvementRate}
          />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="glass-card flex flex-col justify-between rounded-lg p-5">
              <div>
                <h3 className="flex items-center text-sm font-semibold text-slate-950 dark:text-white">
                  <Layers className="mr-2 h-4 w-4 text-violet-600 dark:text-violet-300" />
                  Metric Alignment Profile
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Average alignment over qualitative and lexical scorecards.</p>
              </div>
              <MetricRadarChart data={data.metricBreakdown} />
            </div>

            <div className="glass-card flex flex-col justify-between rounded-lg p-5">
              <div>
                <h3 className="flex items-center text-sm font-semibold text-slate-950 dark:text-white">
                  <Flame className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                  Category Performance
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Average alignment score across top volume categories.</p>
              </div>
              <CategoryBarChart data={data.categoryPerformance} />
            </div>

            <div className="glass-card flex flex-col justify-between rounded-lg p-5">
              <div>
                <h3 className="flex items-center text-sm font-semibold text-slate-950 dark:text-white">
                  <Activity className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                  Confidence Spread
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Distribution of evaluation confidence scores.</p>
              </div>
              <ConfidenceDonutChart data={data.confidenceDistribution} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="glass-card space-y-4 rounded-lg p-5">
              <div>
                <h3 className="flex items-center text-sm font-semibold text-slate-950 dark:text-white">
                  <ShieldCheck className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-300" />
                  Rule Engine Success Ratios
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Average pass rates for deterministic constraints.</p>
              </div>

              <div className="space-y-3">
                {data.ruleEngineFailures.map((rule: any, idx: number) => {
                  const passRatePct = Math.round(rule.passRate * 100);
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">{rule.rule}</span>
                        <span className={passRatePct >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                          {passRatePct}% Pass Rate ({rule.failCount} fails)
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div 
                          className={`h-full rounded-full ${passRatePct >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${passRatePct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card flex flex-col justify-between space-y-5 rounded-lg p-5">
              <div>
                <h3 className="flex items-center text-sm font-semibold text-slate-950 dark:text-white">
                  <RefreshCw className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                  Feedback Loop Self-Corrections
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Efficiency rate of automated critique and regenerations.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <span className="block text-2xl font-semibold text-slate-950 dark:text-white">{data.selfCorrection.totalResponses}</span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Responses</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <span className="block text-2xl font-semibold text-indigo-600 dark:text-indigo-300">{data.selfCorrection.improvedResponses}</span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Improved Runs</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <span className="block text-2xl font-semibold text-emerald-600 dark:text-emerald-300">{Math.round(data.selfCorrection.improvementRate * 100)}%</span>
                  <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Correction Rate</span>
                </div>
              </div>

              <p className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                Responses below the quality threshold are flagged, critiqued, and regenerated to improve compliance before delivery.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
