'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  User,
  Mail,
  Tag,
  Flame,
  ArrowRight
} from 'lucide-react';
import { cleanHtml, CATEGORIES } from '@/lib/dataset-utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function DatasetExplorer() {
  const [emails, setEmails] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      let url = `/api/dataset?page=${page}&limit=${limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.ok ? await res.json() : { emails: [], total: 0 };
        setEmails(json.emails || []);
        setTotal(json.total || 0);
        
        // Auto select first email if none selected
        if (json.emails && json.emails.length > 0 && !selectedEmail) {
          setSelectedEmail(json.emails[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [page, category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEmails();
  };

  // Helper to color difficulty
  const difficultyBadge = (level: string) => {
    const colors = {
      Easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Hard: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    }[level] || 'bg-gray-500/10 text-gray-400';
    return <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold border uppercase", colors)}>{level}</span>;
  };

  const parseList = (value: unknown): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.map(String).filter(Boolean);

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return [];

      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(String).filter(Boolean);
        }
      } catch {
        return trimmed
          .split(/[,;\n]/)
          .map((item) => item.trim())
          .filter(Boolean);
      }

      return [trimmed];
    }

    return [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Dataset Explorer</h2>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Browse, search, and audit benchmark email-reply pairs and structured metadata.</p>
      </div>

      {/* Filters Search Form */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-100/50 dark:bg-gray-900/30 p-4 rounded-xl border border-slate-200 dark:border-gray-800/80">
        <div className="relative md:col-span-2">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search email subject, body, keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 text-xs rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-gray-500">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 text-xs rounded-xl py-3 pl-10 pr-4 appearance-none focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl py-3 shadow-lg shadow-indigo-600/10 transition-colors duration-300"
        >
          Execute Search
        </button>
      </form>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Emails List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(limit)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-200/40 dark:bg-gray-800/40 border border-slate-200 dark:border-gray-800 rounded-xl" />
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-500 dark:text-gray-500 border border-slate-200 dark:border-gray-850">
              No matching email records found in dataset.
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={cn(
                    "glass-card rounded-xl p-4 cursor-pointer text-left transition-all duration-300 relative overflow-hidden",
                    selectedEmail?.id === email.id 
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/10" 
                      : "border-slate-200/40 dark:border-gray-800/40"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 px-2 py-0.5 rounded border border-indigo-100 dark:border-transparent">
                      {email.category}
                    </span>
                    {difficultyBadge(email.difficulty)}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{email.subject}</h4>
                  <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-1">{email.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {total > limit && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500 dark:text-gray-500">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} items
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 bg-slate-105 border border-slate-200 dark:bg-gray-900 dark:border-gray-800 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-lg disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page * limit >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 bg-slate-105 border border-slate-200 dark:bg-gray-900 dark:border-gray-800 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-lg disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Details View Pane */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/40 dark:border-gray-800/40 sticky top-12">
          {selectedEmail ? (
            <div className="space-y-6">
              {/* Heading */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 px-2 py-0.5 rounded uppercase border border-indigo-100 dark:border-transparent">
                    {selectedEmail.category}
                  </span>
                  {difficultyBadge(selectedEmail.difficulty)}
                </div>
                <h3 className="text-lg font-bold text-slate-805 dark:text-white leading-snug">{selectedEmail.subject}</h3>
              </div>

              {/* Attributes Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs border-y border-slate-200 dark:border-gray-800/60 py-4">
                <div>
                  <span className="text-slate-400 dark:text-gray-500 block uppercase font-semibold tracking-wider text-[9px]">Sender Intent</span>
                  <span className="text-slate-700 dark:text-gray-300 font-medium mt-0.5 block">{selectedEmail.intent}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-gray-500 block uppercase font-semibold tracking-wider text-[9px]">Tone Alignment</span>
                  <span className="text-slate-700 dark:text-gray-300 font-medium mt-0.5 block">{selectedEmail.tone}</span>
                </div>
              </div>

              {/* Email Content Blocks */}
              <div className="space-y-4">
                {/* Incoming Body */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-semibold flex items-center">
                    <Mail className="w-3.5 h-3.5 mr-1" />
                    Incoming Email Body
                  </span>
                  <div className="bg-white dark:bg-gray-950 p-4 rounded-xl text-xs text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-850 leading-relaxed max-h-48 overflow-y-auto">
                    {selectedEmail.body}
                  </div>
                </div>

                {/* Reference Reply */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-semibold flex items-center">
                    <BookOpen className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
                    Gold Standard Reference Reply
                  </span>
                  <div className="bg-indigo-50/20 dark:bg-gray-950 p-4 rounded-xl text-xs text-indigo-900/90 dark:text-indigo-200/90 border border-indigo-100/60 dark:border-indigo-950 leading-relaxed max-h-48 overflow-y-auto">
                    {selectedEmail.reply}
                  </div>
                </div>
              </div>

              {/* Keywords, Entities, Action Items tags */}
              <div className="space-y-3 pt-2">
                {/* Action Items */}
                {parseList(selectedEmail.action_items).length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 dark:text-gray-500 uppercase font-semibold">Gold Action Items</span>
                    <div className="flex flex-wrap gap-1.5">
                      {parseList(selectedEmail.action_items).map((item: string, idx: number) => (
                        <span key={idx} className="bg-indigo-50/50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100/60 dark:border-indigo-950 px-2 py-0.5 rounded text-[10px] font-medium truncate max-w-full">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {parseList(selectedEmail.keywords).length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 dark:text-gray-500 uppercase font-semibold">Indexed Keywords</span>
                    <div className="flex flex-wrap gap-1.5">
                      {parseList(selectedEmail.keywords).map((kw: string, idx: number) => (
                        <span key={idx} className="bg-slate-200/60 dark:bg-gray-900 text-slate-600 dark:text-gray-400 px-2 py-0.5 rounded text-[10px]">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button: Run in Playground */}
              <Link
                href={`/playground?emailId=${selectedEmail.id}`}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl shadow-lg shadow-indigo-600/10 transition-colors"
              >
                <span>Run in Playground</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-center text-slate-400 dark:text-gray-500">
              <BookOpen className="w-10 h-10 mb-2 text-slate-300 dark:text-gray-600" />
              <p className="text-xs">Select an email from the explorer list to inspect details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
