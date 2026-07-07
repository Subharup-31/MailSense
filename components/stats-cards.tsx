'use client';

import { 
  Percent, 
  Clock, 
  Coins, 
  Activity,
  TrendingUp
} from 'lucide-react';

interface StatsProps {
  totalEvaluations: number;
  averageScore: number;
  averageLatencyMs: number;
  tokenUsageTotal: number;
  improvementRate: number;
}

export default function StatsCards({
  totalEvaluations = 0,
  averageScore = 0,
  averageLatencyMs = 0,
  tokenUsageTotal = 0,
  improvementRate = 0
}: StatsProps) {
  // Approximate cost: Llama3 70b rate average ($0.68 per 1M tokens)
  const estimatedCost = (tokenUsageTotal * (0.68 / 1000000)).toFixed(4);

  const items = [
    {
      title: 'Avg Evaluation Score',
      value: `${(averageScore * 100).toFixed(1)}%`,
      change: 'Target: 90.0%',
      desc: 'Composite average score',
      icon: Percent,
      tone: 'text-emerald-600 bg-emerald-50 ring-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:ring-emerald-900/60'
    },
    {
      title: 'Total Evaluations',
      value: totalEvaluations.toLocaleString(),
      change: `+${totalEvaluations} total runs`,
      desc: 'Database audit records',
      icon: Activity,
      tone: 'text-blue-600 bg-blue-50 ring-blue-200 dark:text-blue-300 dark:bg-blue-950/40 dark:ring-blue-900/60'
    },
    {
      title: 'Response Latency',
      value: `${(averageLatencyMs / 1000).toFixed(2)}s`,
      change: `${averageLatencyMs.toFixed(0)} ms`,
      desc: 'Retrieval + LLM generation',
      icon: Clock,
      tone: 'text-amber-600 bg-amber-50 ring-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:ring-amber-900/60'
    },
    {
      title: 'Platform Token Cost',
      value: `$${estimatedCost}`,
      change: `${tokenUsageTotal.toLocaleString()} tokens`,
      desc: 'OpenRouter API billing',
      icon: Coins,
      tone: 'text-violet-600 bg-violet-50 ring-violet-200 dark:text-violet-300 dark:bg-violet-950/40 dark:ring-violet-900/60'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="glass-card relative overflow-hidden rounded-lg p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.title}</p>
                <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{item.value}</h3>
              </div>
              <div className={`rounded-lg p-2 ring-1 ${item.tone}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center font-medium text-slate-700 dark:text-slate-300">
                <TrendingUp className="mr-1 h-3.5 w-3.5 text-indigo-500" />
                {item.change}
              </span>
              <span className="truncate text-slate-500 dark:text-slate-500">{item.desc}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
