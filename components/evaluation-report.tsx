'use client';

import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  HelpCircle,
  ShieldCheck,
  Zap,
  Gauge
} from 'lucide-react';
import { cn } from '../lib/utils';

interface MetricDetail {
  score: number;
  reason: string;
  confidence: number;
  weight: number;
}

interface RuleViolation {
  rule: string;
  passed: boolean;
  severity: 'critical' | 'warning';
  reason: string;
}

interface RuleEngineResult {
  passed: boolean;
  violations: RuleViolation[];
  score: number;
}

interface EvaluationReportProps {
  overallScore: number;
  confidence: 'High' | 'Medium' | 'Low';
  justification: string;
  metrics: Record<string, MetricDetail>;
  ruleEngine: RuleEngineResult;
  critique?: string | null;
  beforeScore?: number | null;
}

export default function EvaluationReport({
  overallScore = 0,
  confidence = 'Medium',
  justification = '',
  metrics = {},
  ruleEngine = { passed: true, violations: [], score: 1.0 },
  critique = null,
  beforeScore = null
}: EvaluationReportProps) {
  
  // Helper to color confidence
  const confidenceColor = {
    High: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Low: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  }[confidence];

  // Helper to map metric key names
  const labelsMap: Record<string, string> = {
    semanticSimilarity: 'Semantic Similarity',
    bleu: 'BLEU-4',
    rouge: 'ROUGE-L',
    meteor: 'METEOR',
    bertScore: 'BERTScore',
    intentAlignment: 'Intent Alignment',
    completeness: 'Completeness',
    grounding: 'Grounding',
    hallucination: 'Hallucination Mitigation',
    professionalism: 'Professionalism',
    safety: 'Safety & Leak Prevention'
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Card */}
      <div className="glass-card rounded-2xl p-6 border-l-4 border-indigo-500 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Audit Status</span>
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", confidenceColor)}>
                {confidence} Confidence
              </span>
              {beforeScore !== null && (
                <span className="bg-purple-600/20 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-1" />
                  Self-Corrected (+{Math.round((overallScore - beforeScore) * 100)}%)
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white">System Evaluation Verdict</h2>
            <p className="text-sm text-gray-300 leading-relaxed">{justification}</p>
          </div>

          <div className="flex items-center space-x-4 shrink-0 bg-gray-900/40 p-4 rounded-xl border border-gray-800/80">
            <div className="relative flex items-center justify-center">
              {/* Circular Rating Progress */}
              <svg className="w-20 h-20 transform -rotate-90">
                <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                <circle 
                  cx="40" 
                  cy="40" 
                  r="34" 
                  stroke="url(#purpleIndigo)" 
                  strokeWidth="6" 
                  fill="transparent" 
                  strokeDasharray={2 * Math.PI * 34} 
                  strokeDashoffset={2 * Math.PI * 34 * (1 - overallScore)} 
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="purpleIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-white">{(overallScore * 100).toFixed(0)}%</span>
                <span className="text-[9px] text-gray-400 uppercase font-semibold">Score</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-500 block uppercase font-semibold">Status</span>
              <span className={cn(
                "text-sm font-bold block",
                overallScore >= 0.8 ? "text-emerald-400" : "text-rose-400"
              )}>
                {overallScore >= 0.8 ? 'PASSING' : 'FAILING'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Self-Correction Critique (if present) */}
      {critique && (
        <div className="bg-indigo-950/20 border border-indigo-900/50 rounded-2xl p-5 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Zap className="w-5 h-5" />
            <h4 className="font-bold text-sm">Self-Correction Loop Critique Report</h4>
          </div>
          <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed italic bg-gray-900/20 p-3 rounded-lg border border-indigo-900/30">
            {critique}
          </p>
        </div>
      )}

      {/* 3. Metrics breakdown grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center">
          <Gauge className="w-4 h-4 mr-2 text-purple-400" />
          Lexical & Semantic Metrics Breakdown
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(metrics).map(([key, item]) => {
            const label = labelsMap[key] || key;
            const percentage = Math.round(item.score * 100);
            
            return (
              <div key={key} className="glass-card rounded-xl p-4 space-y-2 border border-gray-800/40">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-gray-300">{label}</span>
                  <span className={cn(
                    "font-bold",
                    item.score >= 0.8 ? "text-emerald-400" : item.score >= 0.6 ? "text-amber-400" : "text-rose-400"
                  )}>
                    {percentage}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      item.score >= 0.8 ? "bg-emerald-500" : item.score >= 0.6 ? "bg-amber-500" : "bg-rose-500"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-500">
                  <span className="truncate max-w-[200px]">{item.reason}</span>
                  <span>Weight: {Math.round(item.weight * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Rule Engine Constraint Violations */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center">
          <ShieldCheck className="w-4 h-4 mr-2 text-indigo-400" />
          Deterministic Rule Engine Audits
        </h3>

        <div className="glass-card rounded-2xl overflow-hidden border border-gray-800/40">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/30">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rule</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Severity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Verdict</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {ruleEngine.violations.map((violation, idx) => (
                <tr key={idx} className="hover:bg-gray-800/10">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {violation.rule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs">
                    <span className={cn(
                      "px-2 py-0.5 rounded font-semibold",
                      violation.severity === 'critical' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    )}>
                      {violation.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {violation.passed ? (
                      <span className="text-emerald-400 flex items-center font-semibold text-xs">
                        <CheckCircle className="w-4 h-4 mr-1.5" />
                        PASSED
                      </span>
                    ) : (
                      <span className={cn(
                        "flex items-center font-semibold text-xs",
                        violation.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'
                      )}>
                        <XCircle className="w-4 h-4 mr-1.5" />
                        FAILED
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 leading-normal max-w-sm">
                    {violation.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
