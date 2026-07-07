'use client';

import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  TrendingUp, 
  Zap, 
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import { getFailuresAndCorrections, FailureRecord } from './actions';
import EvaluationReport from '@/components/evaluation-report';
import { cn } from '@/lib/utils';

export default function FailureAnalysis() {
  const [failures, setFailures] = useState<FailureRecord[]>([]);
  const [selected, setSelected] = useState<FailureRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'correction' | 'report' | 'source'>('correction');

  const loadData = async () => {
    setLoading(true);
    try {
      const records = await getFailuresAndCorrections();
      setFailures(records);
      if (records.length > 0) {
        setSelected(records[0]);
      } else {
        setSelected(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800 md:flex-row md:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
            <ClipboardList className="h-3.5 w-3.5" />
            Failure analysis
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Critique Workbench</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">Review low-scoring responses, compare self-corrections, and inspect source context behind each audit.</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex min-w-32 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Reload Logs</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-80 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : failures.length === 0 ? (
        <div className="glass-card mx-auto max-w-2xl rounded-lg border border-slate-200 p-8 text-center dark:border-slate-800">
          <ShieldAlert className="mx-auto h-10 w-10 text-indigo-600 dark:text-indigo-300" />
          <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">No failure logs recorded</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            No response records are currently below the review threshold. Run samples in the playground to generate audit history.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
          <div className="space-y-3">
            <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Audit log feed ({failures.length})</h3>
            <div className="max-h-[calc(100vh-220px)] space-y-2 overflow-y-auto pr-1">
              {failures.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={cn(
                    "glass-card relative w-full cursor-pointer overflow-hidden rounded-lg border p-4 text-left transition-colors duration-200",
                    selected?.id === item.id 
                      ? "border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/20" 
                      : "border-slate-200 dark:border-slate-800"
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[9px] font-bold uppercase text-indigo-600 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
                      {item.category || 'System'}
                    </span>
                    <span className={cn(
                      "rounded border px-2 py-0.5 text-[9px] font-semibold uppercase",
                      item.status === 'improved'
                        ? 'border-violet-200 bg-violet-50/80 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                    )}>
                      {item.status === 'improved' ? 'Self-Corrected' : 'Failing'}
                    </span>
                  </div>
                  <h4 className="truncate text-sm font-semibold text-slate-950 dark:text-white">{item.subject || 'Custom Generation'}</h4>
                  <div className="mt-2 flex items-center space-x-2 text-[10px] text-slate-500 dark:text-slate-500">
                    <span>Score: {Math.round(item.scoreOverall * 100)}%</span>
                    <span>•</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 xl:col-span-2">
            {selected ? (
              <div className="space-y-5">
                <div className="glass-card rounded-lg border border-slate-200 p-5 dark:border-slate-800">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                      Response ID: {selected.id.substring(0, 8)}...
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-500">
                      Audited on {new Date(selected.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold leading-snug text-slate-950 dark:text-white">{selected.subject || 'Custom Generated Query'}</h3>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
                  <button
                    onClick={() => setActiveTab('correction')}
                    className={cn(
                      "rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
                      activeTab === 'correction' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                    )}
                  >
                    Critique & Refinement
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className={cn(
                      "rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
                      activeTab === 'report' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                    )}
                  >
                    Audit Report
                  </button>
                  <button
                    onClick={() => setActiveTab('source')}
                    className={cn(
                      "rounded-lg px-4 py-2 text-xs font-semibold transition-colors",
                      activeTab === 'source' 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                    )}
                  >
                    Context Sources
                  </button>
                </div>

                {/* Tab content 1: Critique & Before/After */}
                {activeTab === 'correction' && (
                  <div className="space-y-6">
                    {/* Critique */}
                    {selected.critique ? (
                      <div className="space-y-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                        <h4 className="flex items-center text-xs font-bold uppercase text-indigo-600 dark:text-indigo-300">
                          <Zap className="mr-2 h-4 w-4" />
                          Self-Correction Feedback Critique
                        </h4>
                        <p className="whitespace-pre-line rounded-lg border border-indigo-100 bg-white p-3 text-xs italic leading-relaxed text-slate-700 dark:border-indigo-900/30 dark:bg-slate-950/40 dark:text-slate-300">
                          {selected.critique}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-xs text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/10 dark:text-rose-300">
                        No self-correction critique generated. This response was evaluated as failing but did not undergo correction, or was manually overridden.
                      </div>
                    )}

                    {/* Before vs After comparison */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="glass-card space-y-3 rounded-lg p-5">
                        <span className="block text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-500">Original failed response draft</span>
                        <div className="max-h-80 overflow-y-auto whitespace-pre-line rounded-lg border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                          {selected.originalResponse}
                        </div>
                      </div>

                      <div className="glass-card space-y-3 rounded-lg border-l-2 border-l-emerald-500 p-5">
                        <span className="flex items-center text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-300">
                          <TrendingUp className="mr-1 h-3.5 w-3.5" />
                          Rewritten compliant response
                        </span>
                        <div className="max-h-80 overflow-y-auto whitespace-pre-line rounded-lg border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                          {selected.currentResponse}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab content 2: Audit Report component */}
                {activeTab === 'report' && (
                  <div className="glass-card rounded-lg p-5">
                    <EvaluationReport
                      overallScore={selected.scoreOverall}
                      confidence={selected.scoreOverall >= 0.85 ? 'High' : selected.scoreOverall >= 0.70 ? 'Medium' : 'Low'}
                      justification={selected.critique ? 'This response was improved using automated feedback loops.' : 'Low-confidence draft response detected.'}
                      metrics={selected.metricsJson}
                      ruleEngine={selected.rulesJson}
                      critique={selected.critique}
                    />
                  </div>
                )}

                {/* Tab content 3: Context Source details */}
                {activeTab === 'source' && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="glass-card space-y-3 rounded-lg p-5">
                      <span className="block text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-500">Incoming email body</span>
                      <div className="max-h-96 overflow-y-auto whitespace-pre-line rounded-lg border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                        {selected.body || 'No subject body logged.'}
                      </div>
                    </div>

                    <div className="glass-card space-y-3 rounded-lg p-5">
                      <span className="block text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-500">Target reference reply</span>
                      <div className="max-h-96 overflow-y-auto whitespace-pre-line rounded-lg border border-indigo-100 bg-indigo-50/40 p-4 text-xs leading-relaxed text-indigo-950 dark:border-indigo-950/60 dark:bg-slate-950 dark:text-indigo-200/90">
                        {selected.referenceReply || 'No reference reply logged.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card rounded-lg p-8 text-center text-slate-500 dark:text-slate-500">
                Select an item from the log feed to inspect.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
