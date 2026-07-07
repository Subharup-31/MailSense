'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Send, 
  Trash, 
  RefreshCw, 
  Power, 
  Loader2, 
  Paperclip, 
  Calendar, 
  User, 
  Clock, 
  Sparkles, 
  Check, 
  AlertCircle,
  FileText,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import EvaluationReport from '@/components/evaluation-report';
import { cn } from '@/lib/utils';

export default function GmailInbox() {
  // Authentication states
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [connectUrlLoading, setConnectUrlLoading] = useState(false);

  // Email listing states
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [isEmailsLoading, setIsEmailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // AI Generation & Action states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [aiResponseResult, setAiResponseResult] = useState<any | null>(null);
  const [editedResponse, setEditedResponse] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Initial authentication check
  const checkStatus = async () => {
    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/gmail/status');
      if (res.ok) {
        const data = await res.json();
        setIsConnected(data.connected);
        setConnectedEmail(data.email);
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

  // Fetch emails from inbox
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

  // Perform search
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

  // Initiate OAuth flow redirect
  const handleConnect = async () => {
    setConnectUrlLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/gmail/status?connect=true');
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setActionError('Gmail connector did not return an authorization URL.');
        }
      } else {
        const errData = await res.json();
        setActionError(errData.details || errData.error || 'Failed to start Gmail authentication');
      }
    } catch (err: any) {
      console.error('Failed to start Gmail authentication:', err);
      setActionError(err.message || 'Failed to start Gmail authentication');
    } finally {
      setConnectUrlLoading(false);
    }
  };

  // Disconnect Gmail connection
  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Gmail account?')) return;
    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/gmail/disconnect', { method: 'DELETE' });
      if (res.ok) {
        setIsConnected(false);
        setConnectedEmail(null);
        setEmails([]);
        setSelectedEmail(null);
        setAiResponseResult(null);
      }
    } catch (err) {
      console.error('Failed to disconnect Gmail:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Run AI Response & Evaluation Loop
  const handleGenerateReply = async () => {
    if (!selectedEmail) return;

    setIsGenerating(true);
    setAiResponseResult(null);
    setActionError(null);
    setActionSuccess(null);

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
    }, 1800);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: selectedEmail.subject,
          body: selectedEmail.body,
          category: selectedEmail.labels && selectedEmail.labels.length > 0 ? selectedEmail.labels[0] : 'Customer Support',
          tone: 'Professional',
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

  useEffect(() => {
    checkStatus();
  }, []);

  // Helper to format date strings
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

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center">
            <Mail className="w-8 h-8 mr-3 text-indigo-650 dark:text-indigo-400" />
            Gmail Command Center
          </h2>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            Securely authorize, list, and evaluate replies using Composio Managed OAuth.
          </p>
        </div>

        {isConnected && (
          <div className="flex items-center space-x-3 bg-slate-100 dark:bg-gray-900/50 p-2 rounded-xl border border-slate-200 dark:border-gray-800">
            <div className="flex items-center space-x-2 px-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-[200px]" title={connectedEmail || ''}>
                {connectedEmail || 'Gmail Active'}
              </span>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={isAuthLoading}
              className="flex items-center space-x-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-500/20 transition-all"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Loading state */}
      {isAuthLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-gray-400">Verifying security configurations & active connections...</p>
        </div>
      ) : !isConnected ? (
        // 3. Disconnected State (Landing Page)
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="glass-card max-w-xl w-full p-8 rounded-2xl border border-slate-250 dark:border-gray-800 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center mx-auto border border-indigo-500/20">
              <Mail className="w-8 h-8 text-indigo-650 dark:text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Gmail Integration Required</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                MailSense uses <strong>Composio Managed OAuth</strong> to connect directly to your Gmail account. This handles credentials, tokens, and scopes securely server-side.
              </p>
            </div>

            <div className="bg-slate-100/80 dark:bg-gray-900/60 border border-slate-200 dark:border-gray-850 p-4 rounded-xl text-left space-y-2">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider">Features included:</h4>
              <ul className="text-xs text-slate-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Read and search inbox threads</li>
                <li>Hydrate few-shot vector context (Pinecone)</li>
                <li>Run hybrid BLEU, ROUGE, and LLM Judge audits</li>
                <li>Draft and dispatch verified replies directly from UI</li>
              </ul>
            </div>

            <button
              onClick={handleConnect}
              disabled={connectUrlLoading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {connectUrlLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Secure Link...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Connect Gmail Account</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // 4. Connected Inbox Console
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-[500px]">
          
          {/* Left panel: list (4 cols) */}
          <div className="lg:col-span-4 flex flex-col bg-slate-100/50 dark:bg-gray-950/40 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden h-[70vh]">
            {/* Search email bar */}
            <form onSubmit={handleSearch} className="p-4 border-b border-slate-200 dark:border-gray-800 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search subject or body..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-850 text-xs rounded-xl pl-9 pr-4 py-2.5 text-slate-800 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isEmailsLoading || isSearching}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
              <button
                type="button"
                onClick={fetchEmails}
                disabled={isEmailsLoading}
                className="bg-slate-50 border border-slate-200 dark:bg-gray-900 dark:border-gray-850 hover:bg-slate-200 dark:hover:bg-gray-800 text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white p-2.5 rounded-xl transition-all"
                title="Refresh Inbox"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isEmailsLoading && "animate-spin")} />
              </button>
            </form>

            {/* Email list area */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200 dark:divide-gray-850">
              {isEmailsLoading ? (
                <div className="p-6 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-gray-500">Hydrating email index...</p>
                </div>
              ) : emails.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <FolderOpen className="w-8 h-8 text-slate-400 dark:text-gray-600 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-gray-400">Empty Folders</h4>
                  <p className="text-[11px] text-slate-500 dark:text-gray-500">No emails found matching your query.</p>
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
                          : "hover:bg-slate-200/30 dark:hover:bg-gray-900/30 border-l-transparent",
                        !email.isRead && "font-semibold"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-xs truncate max-w-[150px]",
                          email.isRead ? "text-slate-500 dark:text-gray-400" : "text-indigo-600 dark:text-indigo-400"
                        )}>
                          {email.sender.split('<')[0].trim() || email.sender}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500 whitespace-nowrap">
                          {formatDate(email.date)}
                        </span>
                      </div>
                      
                      <h4 className="text-xs text-slate-800 dark:text-gray-200 truncate">{email.subject}</h4>
                      
                      <p className="text-[11px] text-slate-500 dark:text-gray-500 line-clamp-2 leading-relaxed">
                        {email.snippet}
                      </p>

                      {/* Display badges */}
                      {email.labels && email.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {email.labels.slice(0, 2).map((label: string) => (
                            <span 
                              key={label} 
                              className="text-[9px] bg-slate-200/80 text-slate-600 dark:bg-gray-900 dark:text-gray-400 px-1.5 py-0.5 rounded border border-slate-300/60 dark:border-gray-800 uppercase"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel: Detail viewer & AI actions (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-slate-100/50 dark:bg-gray-950/40 border border-slate-200 dark:border-gray-800 rounded-2xl overflow-hidden h-[70vh]">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header details */}
                <div className="p-6 border-b border-slate-200 dark:border-gray-800 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{selectedEmail.subject}</h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedEmail.labels?.map((label: string) => (
                        <span 
                          key={label} 
                          className="text-[9px] bg-indigo-100 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-900/20"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-550 dark:text-gray-400">
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                      <span className="font-semibold text-slate-700 dark:text-gray-300">From:</span>
                      <span className="truncate">{selectedEmail.sender}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 md:justify-end">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                      <span className="font-semibold text-slate-700 dark:text-gray-300">Date:</span>
                      <span>{formatDate(selectedEmail.date)}</span>
                    </div>

                    {selectedEmail.recipients && selectedEmail.recipients.length > 0 && (
                      <div className="flex items-center space-x-1.5 col-span-1 md:col-span-2">
                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                        <span className="font-semibold text-slate-700 dark:text-gray-300">To:</span>
                        <span className="truncate">{selectedEmail.recipients.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {/* Attachment indicator if exists */}
                  {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedEmail.attachments.map((attach: any, idx: number) => (
                        <div 
                          key={idx}
                          className="flex items-center space-x-1.5 bg-slate-200/80 dark:bg-gray-900 px-2.5 py-1.5 rounded-lg border border-slate-300/60 dark:border-gray-800 text-[10px]"
                        >
                          <Paperclip className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span className="text-slate-700 dark:text-gray-300 font-medium truncate max-w-[120px]">{attach.filename}</span>
                          <span className="text-slate-500">({Math.round(attach.size / 1024)} KB)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Split pane: Content scroll & AI workspace */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                  
                  {/* Left inner pane: email body content */}
                  <div className="p-6 overflow-y-auto border-r border-slate-200 dark:border-gray-850 space-y-4">
                    <h4 className="text-[10px] text-slate-500 dark:text-gray-500 uppercase font-semibold tracking-wider">Email Body</h4>
                    <p className="text-xs text-slate-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {selectedEmail.body}
                    </p>
                  </div>

                  {/* Right inner pane: AI generation console */}
                  <div className="p-6 overflow-y-auto flex flex-col bg-slate-50/50 dark:bg-gray-950/20">
                    {/* Alerts success/errors */}
                    {actionSuccess && (
                      <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl flex items-center">
                        <Check className="w-4 h-4 mr-2 shrink-0" />
                        <span>{actionSuccess}</span>
                      </div>
                    )}

                    {actionError && (
                      <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl flex items-start">
                        <AlertCircle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                        <span>{actionError}</span>
                      </div>
                    )}

                    {isGenerating ? (
                      // Generation Loader
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center">
                        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white">Running Generation Pipeline</h4>
                        <p className="text-[11px] text-slate-500 dark:text-gray-500 max-w-xs">{generationStep}</p>
                      </div>
                    ) : aiResponseResult ? (
                      // AI response display & scoring
                      <div className="flex-1 flex flex-col space-y-4">
                        <div className="space-y-1.5 flex-1 flex flex-col">
                          <label className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-semibold tracking-wider flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600 dark:text-indigo-400" />
                            Drafted Agent Response
                          </label>
                          <textarea
                            value={editedResponse}
                            onChange={(e) => setEditedResponse(e.target.value)}
                            rows={8}
                            className="w-full flex-1 bg-white dark:bg-gray-950 border border-slate-250 dark:border-gray-850 text-xs rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-gray-300 resize-none leading-relaxed"
                          />
                        </div>

                        {/* Evaluation Report Scorecard */}
                        <div className="bg-slate-100/60 dark:bg-gray-950/80 p-4 rounded-xl border border-slate-200 dark:border-gray-850 space-y-2">
                          <h4 className="text-[10px] text-slate-400 dark:text-gray-500 uppercase font-semibold tracking-wider">Evaluation Scorecard</h4>
                          
                          <div className="flex items-center justify-between border-b border-slate-250 dark:border-gray-900 pb-2">
                            <span className="text-[11px] text-slate-650 dark:text-gray-400">Verdict Metric Alignment:</span>
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded border",
                              aiResponseResult.evaluationReport.overallScore >= 0.8 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-550/20 dark:border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-550/20 dark:border-amber-500/20'
                            )}>
                              {Math.round(aiResponseResult.evaluationReport.overallScore * 100)}% Match
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-gray-500 max-h-40 overflow-y-auto pr-1 space-y-2 leading-relaxed">
                            <p className="italic">"{aiResponseResult.evaluationReport.justification}"</p>
                            
                            {/* Critique display if self-corrected */}
                            {aiResponseResult.critique && (
                              <div className="bg-amber-500/5 p-2 rounded border border-amber-500/10 text-[10px]">
                                <span className="font-semibold text-amber-600 dark:text-amber-400">Self-Correction Feedback:</span>
                                <p className="text-slate-500 dark:text-gray-400 mt-1">{aiResponseResult.critique}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Send / Draft Actions */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={handleSaveDraft}
                            disabled={isReplying}
                            className="flex items-center justify-center space-x-2 bg-slate-200 hover:bg-slate-300 dark:bg-gray-900 dark:hover:bg-gray-800 text-slate-800 dark:text-white font-semibold text-xs py-3 rounded-xl border border-slate-300/40 dark:border-gray-855 transition-all disabled:opacity-50"
                          >
                            {isReplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" />}
                            <span>Save as Draft</span>
                          </button>
                          <button
                            onClick={handleSendEmail}
                            disabled={isReplying}
                            className="flex items-center justify-center space-x-2 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs py-3 rounded-xl transition-all disabled:opacity-50"
                          >
                            {isReplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            <span>Send Reply</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Launch View
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50/80 dark:bg-indigo-600/10 flex items-center justify-center border border-indigo-250 dark:border-indigo-500/20">
                          <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">AI Automation Sandbox</h4>
                          <p className="text-[11px] text-slate-500 dark:text-gray-500 max-w-xs mt-1 leading-relaxed">
                            Generate context-aware responses aligned with local dataset guidelines and Pinecone retrieval context.
                          </p>
                        </div>
                        <button
                          onClick={handleGenerateReply}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-3 rounded-xl transition-all flex items-center space-x-1.5 shadow-lg shadow-indigo-600/15"
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
              // Empty State
              <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-slate-200/60 dark:bg-gray-900 flex items-center justify-center border border-slate-300/40 dark:border-gray-800">
                  <Mail className="w-8 h-8 text-slate-400 dark:text-gray-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Email Selected</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-500 max-w-xs mt-1">
                    Select an email thread from the inbox listing to view contents and trigger response generation.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
