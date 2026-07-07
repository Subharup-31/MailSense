'use client';

import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Terminal, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info,
  ShieldCheck
} from 'lucide-react';
import { getActivePrompt, saveNewPrompt, PromptTemplate } from './actions';

export default function Settings() {
  // Prompt template states
  const [prompt, setPrompt] = useState<PromptTemplate | null>(null);
  const [promptContent, setPromptContent] = useState('');
  const [promptName, setPromptName] = useState('Standard Email Responder');
  
  // Health states
  const [health, setHealth] = useState<any>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  
  // Operations states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchPrompt = async () => {
    try {
      const active = await getActivePrompt();
      if (active) {
        setPrompt(active);
        setPromptContent(active.content);
        setPromptName(active.name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const json = await res.json();
        setHealth(json.services);
      } else {
        const json = await res.json();
        setHealth(json.services || { database: 'error', pinecone: 'error', openrouter: 'error' });
      }
    } catch (err) {
      console.error(err);
      setHealth({ database: 'error', pinecone: 'error', openrouter: 'error' });
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompt();
    fetchHealth();
  }, []);

  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptContent.trim()) return;

    setLoading(true);
    setMessage(null);
    try {
      const saved = await saveNewPrompt(promptName, promptContent);
      if (saved) {
        setPrompt(saved);
        setMessage({ type: 'success', text: `Saved successfully! Now running Prompt Version ${saved.version}.` });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to save prompt template.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">System Settings & Prompts</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Configure evaluation parameters, manage prompt version history, and audit endpoint health.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Prompt Template Editor */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-gray-800/40 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-bold text-slate-800 dark:text-white flex items-center">
              <Terminal className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
              Active System Instruction Prompt
            </h3>
            {prompt && (
              <span className="bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                Version {prompt.version} Active
              </span>
            )}
          </div>

          <form onSubmit={handleSavePrompt} className="space-y-5">
            {/* Template Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-405 dark:text-gray-500 uppercase font-semibold">Template Profile Name</label>
              <input
                type="text"
                placeholder="Standard Email Responder"
                value={promptName}
                onChange={(e) => setPromptName(e.target.value)}
                required
                className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 text-xs rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Template Content */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-slate-405 dark:text-gray-500 uppercase font-semibold">Prompt Body Template</label>
                <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-medium">Placeholders: {"{{subject}}"}, {"{{body}}"}, {"{{tone}}"}, {"{{examples}}"}</span>
              </div>
              <textarea
                placeholder="Draft template content..."
                rows={12}
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                required
                className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 text-xs rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 resize-y font-mono leading-relaxed"
              />
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-xs border ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/10 transition-all duration-300 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Version</span>
            </button>
          </form>
        </div>

        {/* Right Column: Platform Configuration & Health Indicators */}
        <div className="space-y-6">
          {/* Health indicator */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-gray-800/40 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-bold text-slate-800 dark:text-white flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                Service Connectivity Health
              </h3>
              <button
                onClick={fetchHealth}
                disabled={healthLoading}
                className="text-slate-400 dark:text-gray-400 hover:text-slate-700 dark:hover:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${healthLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {healthLoading ? (
              <p className="text-xs text-slate-450 dark:text-gray-500 animate-pulse">Running health check ping...</p>
            ) : health ? (
              <div className="space-y-3">
                {/* Database check */}
                <div className="flex items-center justify-between text-xs bg-slate-100/50 dark:bg-gray-900/30 p-3 rounded-xl border border-slate-200 dark:border-gray-850">
                  <span className="font-semibold text-slate-700 dark:text-gray-300">Supabase PostgreSQL</span>
                  {health.database === 'connected' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center font-bold text-[10px]">
                      <CheckCircle2 className="w-4.5 h-4.5 mr-1" />
                      CONNECTED
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center font-bold text-[10px]">
                      <XCircle className="w-4.5 h-4.5 mr-1" />
                      DISCONNECTED
                    </span>
                  )}
                </div>

                {/* Pinecone check */}
                <div className="flex items-center justify-between text-xs bg-slate-100/50 dark:bg-gray-900/30 p-3 rounded-xl border border-slate-200 dark:border-gray-850">
                  <span className="font-semibold text-slate-700 dark:text-gray-300">Pinecone Vector Index</span>
                  {health.pinecone === 'configured' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center font-bold text-[10px]">
                      <CheckCircle2 className="w-4.5 h-4.5 mr-1" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center font-bold text-[10px]">
                      <AlertTriangle className="w-4.5 h-4.5 mr-1" />
                      FALLBACK ACTIVE
                    </span>
                  )}
                </div>

                {/* OpenRouter check */}
                <div className="flex items-center justify-between text-xs bg-slate-100/50 dark:bg-gray-900/30 p-3 rounded-xl border border-slate-200 dark:border-gray-850">
                  <span className="font-semibold text-slate-700 dark:text-gray-300">OpenRouter API Key</span>
                  {health.openrouter === 'configured' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center font-bold text-[10px]">
                      <CheckCircle2 className="w-4.5 h-4.5 mr-1" />
                      CONFIGURED
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center font-bold text-[10px]">
                      <AlertTriangle className="w-4.5 h-4.5 mr-1" />
                      DRY RUN ACTIVE
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-500">Health checks unavailable.</p>
            )}
          </div>

          {/* Config details from .env */}
          <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-gray-800/40 space-y-4">
            <h3 className="text-md font-bold text-slate-800 dark:text-white flex items-center">
              <SettingsIcon className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
              Runtime Configurations
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-100/50 dark:bg-gray-900/30 p-3 rounded-xl border border-slate-200 dark:border-gray-850 space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-semibold">Active LLM Model</span>
                <span className="text-slate-700 dark:text-gray-300 block font-mono text-[10px] truncate">
                  {process.env.LLM_MODEL || 'meta-llama/llama-3.1-70b-instruct'}
                </span>
              </div>

              <div className="bg-slate-100/50 dark:bg-gray-900/30 p-3 rounded-xl border border-slate-200 dark:border-gray-850 space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-semibold">Embedding Model</span>
                <span className="text-slate-700 dark:text-gray-300 block font-mono text-[10px] truncate">
                  {process.env.EMBEDDING_MODEL || 'text-embedding-3-small (1536d)'}
                </span>
              </div>

              <div className="bg-slate-100/50 dark:bg-gray-900/30 p-3 rounded-xl border border-slate-200 dark:border-gray-850 space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-semibold">Self-Correction Threshold</span>
                <span className="text-slate-750 dark:text-gray-300 block font-semibold">
                  {parseFloat(process.env.EVALUATION_THRESHOLD || '0.80') * 100}% Score (0.80)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
