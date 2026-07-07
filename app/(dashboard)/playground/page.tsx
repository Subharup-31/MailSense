'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Send, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Settings, 
  HelpCircle,
  RefreshCw,
  Gauge,
  Zap,
  Undo
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/dataset-utils';
import EvaluationReport from '@/components/evaluation-report';

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailIdParam = searchParams.get('emailId');

  // Input states
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Customer Support');
  const [tone, setTone] = useState('Professional');
  const [model, setModel] = useState('meta-llama/llama-3.1-70b-instruct');
  
  // Operational states
  const [seedEmails, setSeedEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  
  // Output states
  const [result, setResult] = useState<any>(null);
  const [retrievedContext, setRetrievedContext] = useState<any[]>([]);

  // Load seeded emails list for quick loading
  useEffect(() => {
    const fetchSeeds = async () => {
      try {
        const res = await fetch('/api/dataset?limit=50');
        if (res.ok) {
          const json = await res.json();
          setSeedEmails(json.emails || []);
          
          // If query param is present, load it
          if (emailIdParam && json.emails) {
            const match = json.emails.find((e: any) => e.id === emailIdParam);
            if (match) {
              setSubject(match.subject);
              setBody(match.body);
              setCategory(match.category);
              setTone(match.tone);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load seed emails:', err);
      }
    };
    fetchSeeds();
  }, [emailIdParam]);

  const loadSeedEmail = (id: string) => {
    const match = seedEmails.find(e => e.id === id);
    if (match) {
      setSubject(match.subject);
      setBody(match.body);
      setCategory(match.category);
      setTone(match.tone);
      router.push(`/playground?emailId=${id}`);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    setLoading(true);
    setResult(null);
    setRetrievedContext([]);
    
    // Status text steps
    const steps = [
      'Querying Pinecone vector indices...',
      'Formatting dynamically compiled context prompt...',
      'Calling OpenRouter LLM endpoint...',
      'Auditing generated reply lexical overlaps (BLEU/ROUGE)...',
      'Running local BERTScore token similarity checks...',
      'Querying OpenRouter LLM Judge...',
      'Processing rule engine constraints...',
      'Checking self-correction thresholds...'
    ];

    let stepIdx = 0;
    setStatusText(steps[0]);
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setStatusText(steps[stepIdx]);
    }, 1800);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          category,
          tone,
          model,
          emailId: emailIdParam || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Reply generation failed');
      }

      const json = await response.json();
      setResult(json);
      setRetrievedContext(json.retrievedContext || []);
    } catch (err: any) {
      console.error(err);
      alert(`Error generating reply: ${err.message}`);
    } finally {
      clearInterval(interval);
      setLoading(false);
      setStatusText('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Interactive Playground</h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Draft custom emails, configure alignment models, and verify response scoring in real-time.</p>
        </div>
        
        {/* Seed email selector dropdown */}
        <div className="flex items-center space-x-2 bg-slate-105 dark:bg-gray-900/40 p-2 rounded-xl border border-slate-200 dark:border-gray-800">
          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <select
            onChange={(e) => loadSeedEmail(e.target.value)}
            value={emailIdParam || ''}
            className="bg-transparent text-slate-700 dark:text-gray-300 text-xs focus:outline-none max-w-xs pr-4 appearance-none"
          >
            <option value="" className="text-slate-800 dark:text-white">Load Seed Benchmark Email...</option>
            {seedEmails.map((e) => (
              <option key={e.id} value={e.id} className="text-slate-800 dark:text-white">{e.subject} ({e.category})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Parameters and inputs */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-gray-800/40 space-y-6">
          <h3 className="text-md font-bold text-slate-800 dark:text-white flex items-center">
            <Settings className="w-4 h-4 mr-2 text-indigo-650 dark:text-indigo-400" />
            Generation Parameters
          </h3>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-semibold">Email Subject</label>
              <input
                type="text"
                placeholder="e.g. Refund request for billing ID..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 text-xs rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-semibold">Incoming Email Body</label>
              <textarea
                placeholder="Paste the email content here..."
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 text-xs rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Triple Row: Category, Tone, Model */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 text-xs rounded-xl py-3 px-3 focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="text-slate-800 dark:text-white">{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-semibold">Target Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 text-xs rounded-xl py-3 px-3 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Professional" className="text-slate-800 dark:text-white">Professional</option>
                  <option value="Friendly" className="text-slate-800 dark:text-white">Friendly</option>
                  <option value="Direct" className="text-slate-800 dark:text-white">Direct</option>
                  <option value="Empathetic" className="text-slate-800 dark:text-white">Empathetic</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-semibold">LLM Engine</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 text-xs rounded-xl py-3 px-3 focus:outline-none focus:border-indigo-500"
                >
                  <option value="meta-llama/llama-3.1-70b-instruct" className="text-slate-800 dark:text-white">Llama 3.1 70B</option>
                  <option value="google/gemini-2.5-flash" className="text-slate-800 dark:text-white">Gemini 2.5 Flash</option>
                  <option value="openai/gpt-4o-mini" className="text-slate-800 dark:text-white">GPT-4o Mini</option>
                  <option value="google/gemini-2.5-pro" className="text-slate-800 dark:text-white">Gemini 2.5 Pro</option>
                </select>
              </div>
            </div>

            {/* Run button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs py-4 rounded-xl shadow-lg shadow-indigo-600/10 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="animate-pulse">{statusText || 'Executing Pipeline...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Execute Pipeline & Self-Correct</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Output View & Realtime Reports */}
        <div className="space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Generated Response output text */}
              <div className="glass-card rounded-2xl p-6 border-indigo-500/20 border space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-gray-400 tracking-wider flex items-center">
                    <Send className="w-4 h-4 mr-2 text-indigo-650 dark:text-indigo-400" />
                    Final Generated Email response
                  </h4>
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold">{result.latencyMs} ms latency</span>
                </div>
                <div className="bg-white dark:bg-gray-950 p-4 rounded-xl text-xs text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-gray-850 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line">
                  {result.response}
                </div>
              </div>

              {/* Retrieved semantic references panel */}
              {retrievedContext.length > 0 && (
                <div className="glass-card rounded-2xl p-6 space-y-3">
                  <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-gray-400 tracking-wider flex items-center">
                    <Layers className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                    Retrieved Similar Contexts (Top-K)
                  </h4>
                  <div className="space-y-2">
                    {retrievedContext.map((match, idx) => (
                      <div key={idx} className="bg-slate-100 dark:bg-gray-900/40 p-3 rounded-lg border border-slate-200 dark:border-gray-800 text-[10px] space-y-1">
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-700 dark:text-gray-300 truncate max-w-[200px]">{match.subject}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">Similarity: {Math.round(match.score * 100)}%</span>
                        </div>
                        <p className="text-slate-550 dark:text-gray-500 truncate">{match.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evaluation Report Detailed breakdown */}
              <div className="glass-card rounded-2xl p-6">
                <h4 className="text-xs uppercase font-bold text-slate-500 dark:text-gray-400 tracking-wider mb-4 flex items-center">
                  <Gauge className="w-4 h-4 mr-2 text-indigo-650 dark:text-indigo-400" />
                  Hybrid Evaluation audit Report
                </h4>
                <EvaluationReport
                  overallScore={result.evaluationReport.overallScore}
                  confidence={result.evaluationReport.confidence}
                  justification={result.evaluationReport.justification}
                  metrics={result.evaluationReport.metrics}
                  ruleEngine={result.evaluationReport.ruleEngine}
                  critique={result.critique}
                  beforeScore={result.beforeScore}
                />
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 border border-slate-200/40 dark:border-gray-800/40 h-[500px] flex flex-col items-center justify-center text-center text-slate-400 dark:text-gray-500">
              <Sparkles className="w-12 h-12 mb-3 text-slate-300 dark:text-gray-700 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Execute a Generation to Begin</h4>
              <p className="text-xs max-w-sm leading-relaxed">
                Click the execute button on the left to trigger Pinecone vector matching, prompt synthesis, OpenRouter LLM drafting, and the full multi-metric auditor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Playground() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <PlaygroundContent />
    </Suspense>
  );
}
