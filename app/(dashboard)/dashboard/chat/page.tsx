'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Send, 
  RefreshCw, 
  Loader2, 
  Paperclip, 
  Calendar, 
  User, 
  Sparkles, 
  Check, 
  AlertCircle,
  FileText,
  FolderOpen,
  ClipboardCheck,
  Clipboard,
  Link2,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function ChatReplyWorkspace() {
  // Connection states
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Email listing states (for connected Gmail)
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [isEmailsLoading, setIsEmailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Manual copy-paste state (for disconnected mode)
  const [manualSubject, setManualSubject] = useState('');
  const [manualBody, setManualBody] = useState('');
  const [manualCategory, setManualCategory] = useState('Customer Support');
  const [manualTone, setManualTone] = useState('Professional');

  // AI Generation & Action states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [aiResponseResult, setAiResponseResult] = useState<any | null>(null);
  const [editedResponse, setEditedResponse] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Check Gmail connection status
  const checkStatus = async () => {
    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/gmail/status');
      if (res.ok) {
        const data = await res.json();
        setIsConnected(data.connected);
        if (data.connected) {
          fetchEmails();
        }
      }
    } catch (err) {
      console.error('Failed to check Gmail connection status:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Fetch emails from Gmail inbox
  const fetchEmails = async () => {
    setIsEmailsLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/gmail/emails');
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
        if (data.emails && data.emails.length > 0 && !selectedEmail) {
          setSelectedEmail(data.emails[0]);
          setAiResponseResult(null);
        }
      } else {
        const errData = await res.json();
        setActionError(errData.error || 'Failed to fetch emails');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to connect to backend server');
    } finally {
      setIsEmailsLoading(false);
    }
  };

  // Search emails in Gmail
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchEmails();
      return;
    }

    setIsEmailsLoading(true);
    setIsSearching(true);
    setActionError(null);
    try {
      const res = await fetch('/api/gmail/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      if (res.ok) {
        const data = await res.json();
        setEmails(data.emails || []);
        if (data.emails && data.emails.length > 0) {
          setSelectedEmail(data.emails[0]);
          setAiResponseResult(null);
        } else {
          setSelectedEmail(null);
        }
      } else {
        const errData = await res.json();
        setActionError(errData.error || 'Search failed');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to search emails');
    } finally {
      setIsEmailsLoading(false);
      setIsSearching(false);
    }
  };

  // Run AI Response & Evaluation Loop
  const handleGenerateReply = async (isManual: boolean) => {
    const subject = isManual ? manualSubject : selectedEmail?.subject;
    const body = isManual ? manualBody : selectedEmail?.body;
    const category = isManual ? manualCategory : (selectedEmail?.labels?.[0] || 'Customer Support');
    const tone = isManual ? manualTone : 'Professional';

    if (!subject || !body) {
      setActionError('Subject and Body cannot be empty.');
      return;
    }

    setIsGenerating(true);
    setAiResponseResult(null);
    setActionError(null);
    setActionSuccess(null);
    setCopied(false);

    const steps = [
      'Retrieving few-shot references from Pinecone...',
      'Synthesizing workspace business constraints...',
      'Requesting agent completion from OpenRouter...',
      'Analyzing lexical metrics (BLEU, ROUGE)...',
      'Running semantic similarity alignments...',
      'Parsing LLM Judge evaluations...',
      'Processing self-correction feedback loop...'
    ];

    let stepIdx = 0;
    setGenerationStep(steps[0]);
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setGenerationStep(steps[stepIdx]);
    }, 1200);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          category,
          tone,
        }),
      });

      if (!response.ok) {
        throw new Error('AI Reply generation pipeline failed');
      }

      const result = await response.json();
      setAiResponseResult(result);
      setEditedResponse(result.response || '');
    } catch (err: any) {
      setActionError(err.message || 'Failed to complete reply generation pipeline');
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Save the response draft to Gmail
  const handleSaveDraft = async () => {
    if (!selectedEmail || !editedResponse) return;
    setIsReplying(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch('/api/gmail/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedEmail.sender,
          subject: `Re: ${selectedEmail.subject}`,
          body: editedResponse,
          threadId: selectedEmail.threadId,
        }),
      });

      if (res.ok) {
        setActionSuccess('Draft created successfully in Gmail!');
      } else {
        const errData = await res.json();
        setActionError(errData.error || 'Failed to create Gmail draft');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to communicate with draft API');
    } finally {
      setIsReplying(false);
    }
  };

  // Send the reply directly
  const handleSendEmail = async () => {
    if (!selectedEmail || !editedResponse) return;
    if (!confirm('Are you sure you want to send this email reply immediately?')) return;

    setIsReplying(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const res = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedEmail.sender,
          subject: `Re: ${selectedEmail.subject}`,
          body: editedResponse,
          threadId: selectedEmail.threadId,
        }),
      });

      if (res.ok) {
        setActionSuccess('Email reply sent successfully!');
      } else {
        const errData = await res.json();
        setActionError(errData.error || 'Failed to send email');
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to communicate with send API');
    } finally {
      setIsReplying(false);
    }
  };

  const handleCopyClipboard = () => {
    if (!editedResponse) return;
    navigator.clipboard.writeText(editedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="h-[75vh] w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-505 dark:text-slate-400">Verifying connector configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
            <Sparkles className="w-8 h-8 mr-3 text-indigo-650 dark:text-indigo-400" />
            AI Reply Assistant
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isConnected 
              ? 'Read and generate replies for active inbox threads with vector alignment audits.' 
              : 'Paste email headers and bodies manually to generate verified, evaluated draft replies.'
            }
          </p>
        </div>

        {isConnected ? (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Gmail Sync Active
            </span>
          </div>
        ) : (
          <Link
            href="/dashboard/connectors"
            className="flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Connect Gmail</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Main Workspace split */}
      {isConnected ? (
        // Connected View (Inbox listing + AI Reply Sandbox)
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-[500px]">
          
          {/* Left Panel - Email List */}
          <div className="lg:col-span-4 flex flex-col bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden h-[70vh]">
            <form onSubmit={handleSearch} className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search subject/body..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-slate-800 text-xs rounded-xl pl-9 pr-4 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isEmailsLoading || isSearching}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
              <button
                type="button"
                onClick={fetchEmails}
                disabled={isEmailsLoading}
                className="bg-slate-50 border border-slate-200 dark:bg-[#181818] dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-white p-2 rounded-xl transition-all"
                title="Refresh Inbox"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isEmailsLoading && "animate-spin")} />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {isEmailsLoading ? (
                <div className="p-6 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-500">Hydrating email index...</p>
                </div>
              ) : emails.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <FolderOpen className="w-8 h-8 text-slate-400 dark:text-slate-650 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">Empty Folder</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-500">No emails found.</p>
                </div>
              ) : (
                emails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  return (
                    <div
                      key={email.id}
                      onClick={() => {
                        setSelectedEmail(email);
                        setAiResponseResult(null);
                      }}
                      className={cn(
                        "p-4 text-left cursor-pointer transition-colors space-y-1 relative border-l-2",
                        isSelected 
                          ? "bg-indigo-600/5 border-l-indigo-500" 
                          : "hover:bg-slate-50 dark:hover:bg-[#202020]/40 border-l-transparent",
                        !email.isRead && "font-semibold"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-xs truncate max-w-[150px]",
                          email.isRead ? "text-slate-500 dark:text-slate-400" : "text-indigo-600 dark:text-indigo-400"
                        )}>
                          {email.sender.split('<')[0].trim() || email.sender}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-550 whitespace-nowrap">
                          {formatDate(email.date)}
                        </span>
                      </div>
                      
                      <h4 className="text-xs text-slate-800 dark:text-slate-200 truncate">{email.subject}</h4>
                      
                      <p className="text-[11px] text-slate-500 dark:text-slate-500 line-clamp-2 leading-relaxed">
                        {email.body.substring(0, 100)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel - Selected Email Detail & AI Generation */}
          <div className="lg:col-span-8 flex flex-col bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden h-[70vh]">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header details */}
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-base font-bold text-slate-850 dark:text-white leading-tight">{selectedEmail.subject}</h3>
                    <div className="flex gap-1 shrink-0">
                      {selectedEmail.labels?.slice(0, 2).map((label: string) => (
                        <span key={label} className="text-[9px] bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded uppercase font-semibold">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-1.5">
                    <div className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-700 dark:text-slate-350">From:</span>
                      <span className="truncate">{selectedEmail.sender}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(selectedEmail.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Body split */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                  
                  {/* Left inner - Body content */}
                  <div className="p-5 overflow-y-auto border-r border-slate-150 dark:border-slate-800 space-y-3">
                    <h4 className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Email Body</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selectedEmail.body}
                    </p>
                  </div>

                  {/* Right inner - AI Console */}
                  <div className="p-5 overflow-y-auto flex flex-col bg-slate-50/50 dark:bg-slate-900/20">
                    
                    {actionSuccess && (
                      <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-xl flex items-center">
                        <Check className="w-4 h-4 mr-2 shrink-0 animate-bounce" />
                        <span>{actionSuccess}</span>
                      </div>
                    )}

                    {actionError && (
                      <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 text-xs p-3 rounded-xl flex items-start">
                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                        <span>{actionError}</span>
                      </div>
                    )}

                    {isGenerating ? (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center">
                        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Drafting Response...</h4>
                        <p className="text-[11px] text-slate-505 dark:text-slate-450 max-w-xs">{generationStep}</p>
                      </div>
                    ) : aiResponseResult ? (
                      <div className="flex-1 flex flex-col space-y-4">
                        <div className="space-y-1.5 flex-1 flex flex-col">
                          <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider flex items-center justify-between">
                            <div className="flex items-center">
                              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-650 dark:text-indigo-400" />
                              Drafted Reply
                            </div>
                            <button
                              onClick={handleCopyClipboard}
                              className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                            >
                              {copied ? <Check className="w-3 h-3" /> : <Clipboard className="w-3 h-3" />}
                              {copied ? 'Copied!' : 'Copy'}
                            </button>
                          </label>
                          <textarea
                            value={editedResponse}
                            onChange={(e) => setEditedResponse(e.target.value)}
                            className="w-full flex-1 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-300 resize-none leading-relaxed"
                          />
                        </div>

                        {/* Evaluation Scorecard */}
                        <div className="bg-slate-100/50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                          <h4 className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Evaluation Scorecard</h4>
                          
                          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                            <span className="text-[11px] text-slate-600 dark:text-slate-400">Verdict Match:</span>
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded border",
                              aiResponseResult.evaluationReport.overallScore >= 0.8 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                            )}>
                              {Math.round(aiResponseResult.evaluationReport.overallScore * 100)}% Match
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 max-h-32 overflow-y-auto pr-1 space-y-2 leading-relaxed">
                            <p className="italic">"{aiResponseResult.evaluationReport.justification}"</p>
                            
                            {aiResponseResult.critique && (
                              <div className="bg-amber-500/5 p-2 rounded border border-amber-500/10 text-[10px]">
                                <span className="font-semibold text-amber-600 dark:text-amber-450">Self-Correction Feedback:</span>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">{aiResponseResult.critique}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Send / Draft Actions */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={handleSaveDraft}
                            disabled={isReplying}
                            className="flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#1a1a1a] dark:hover:bg-[#222] text-slate-700 dark:text-white font-semibold text-xs py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors disabled:opacity-50"
                          >
                            {isReplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-slate-500" />}
                            <span>Save as Draft</span>
                          </button>
                          <button
                            onClick={handleSendEmail}
                            disabled={isReplying}
                            className="flex items-center justify-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors disabled:opacity-50"
                          >
                            {isReplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            <span>Send Reply</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-900/30">
                          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">AI Assistant Workspace</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-500 max-w-xs mt-1 leading-relaxed">
                            Generate context-aware responses aligned with local dataset guidelines and reference examples.
                          </p>
                        </div>
                        <button
                          onClick={() => handleGenerateReply(false)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm flex items-center space-x-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate AI Reply</span>
                        </button>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#181818] flex items-center justify-center border border-slate-205 dark:border-slate-800">
                  <Mail className="w-8 h-8 text-slate-400 dark:text-slate-650" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Email Selected</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500 max-w-xs mt-1">
                    Select an email thread from the inbox listing to view contents and trigger response generation.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      ) : (
        // Manual copy-paste view (No Gmail Connection fallback)
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[70vh]">
          
          {/* Left Panel - Manual Input Form (6 cols) */}
          <div className="lg:col-span-6 flex flex-col bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
              <FileText className="w-4 h-4 mr-2 text-indigo-600" />
              Manual Email Input
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Issue with billing subscription renewal"
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-4 py-2.5 text-slate-805 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Customer Support">Customer Support</option>
                    <option value="Billing & Invoicing">Billing & Invoicing</option>
                    <option value="Technical Bug">Technical Bug</option>
                    <option value="Refund Request">Refund Request</option>
                    <option value="Feedback">Feedback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Tone</label>
                  <select
                    value={manualTone}
                    onChange={(e) => setManualTone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-slate-800 text-xs rounded-xl px-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Casual & Friendly">Casual & Friendly</option>
                    <option value="Urgent & Action-Oriented">Urgent</option>
                    <option value="Empathetic & Soft">Empathetic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Incoming Email Body</label>
                <textarea
                  placeholder="Paste the incoming email contents here..."
                  value={manualBody}
                  onChange={(e) => setManualBody(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-slate-800 text-xs rounded-xl p-4 text-slate-805 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>

            <button
              onClick={() => handleGenerateReply(true)}
              disabled={isGenerating || !manualSubject.trim() || !manualBody.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate AI Response</span>
            </button>
          </div>

          {/* Right Panel - AI Response Output (6 cols) */}
          <div className="lg:col-span-6 flex flex-col bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-full min-h-[500px]">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center h-full">
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Drafting Response...</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-450 max-w-xs">{generationStep}</p>
              </div>
            ) : aiResponseResult ? (
              <div className="space-y-4 flex flex-col h-full flex-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-405" />
                    Drafted Reply Output
                  </label>
                  <button
                    onClick={handleCopyClipboard}
                    className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-semibold transition-colors"
                  >
                    {copied ? (
                      <>
                        <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3.5 h-3.5" />
                        <span>Copy Response</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  value={editedResponse}
                  onChange={(e) => setEditedResponse(e.target.value)}
                  rows={8}
                  className="w-full flex-1 bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800 text-xs rounded-xl py-3.5 px-4 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-300 resize-none leading-relaxed font-sans"
                />

                {/* Scorecard */}
                <div className="bg-slate-100/50 dark:bg-[#181818] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Evaluation Scorecard</h4>
                  
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">Verdict Match Accuracy:</span>
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded border",
                      aiResponseResult.evaluationReport.overallScore >= 0.8 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    )}>
                      {Math.round(aiResponseResult.evaluationReport.overallScore * 100)}% Match
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-450 max-h-36 overflow-y-auto pr-1 space-y-2 leading-relaxed">
                    <p className="italic">"{aiResponseResult.evaluationReport.justification}"</p>
                    
                    {aiResponseResult.critique && (
                      <div className="bg-amber-500/5 p-2.5 rounded border border-amber-500/10 text-[10px]">
                        <span className="font-semibold text-amber-600 dark:text-amber-400">Self-Correction Feedback:</span>
                        <p className="text-slate-505 dark:text-slate-450 mt-1">{aiResponseResult.critique}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-center">
                  <p className="text-[10px] text-slate-550 dark:text-indigo-300">
                    💡 Connect to Gmail in the Connectors tab to auto-save drafts or send emails directly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center h-full">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-900/30">
                  <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">AI Output Console</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-500 max-w-xs mt-1 leading-relaxed">
                    Once you trigger the generation, the drafted reply and alignment score card metrics will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
      
      {/* Action failure/success alert footer for manual pasting */}
      {actionError && !isConnected && !aiResponseResult && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 text-xs p-3.5 rounded-xl flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

    </div>
  );
}
