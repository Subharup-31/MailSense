'use client';

import { useState, useEffect } from 'react';
import { Mail, Power, Sparkles, Loader2, CheckCircle2, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConnectorsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [connectUrlLoading, setConnectUrlLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setIsAuthLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gmail/status');
      if (res.ok) {
        const data = await res.json();
        setIsConnected(data.connected);
        setConnectedEmail(data.email);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to check connector status');
      }
    } catch (err: any) {
      console.error('Failed to check Gmail connection status:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnectUrlLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gmail/status?connect=true');
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError('Gmail connector did not return an authorization URL.');
        }
      } else {
        const errData = await res.json();
        setError(errData.details || errData.error || 'Failed to start Gmail authentication');
      }
    } catch (err: any) {
      console.error('Failed to start Gmail authentication:', err);
      setError(err.message || 'Failed to start Gmail authentication');
    } finally {
      setConnectUrlLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Gmail account?')) return;
    setIsAuthLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gmail/disconnect', { method: 'DELETE' });
      if (res.ok) {
        setIsConnected(false);
        setConnectedEmail(null);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to disconnect Gmail');
      }
    } catch (err: any) {
      console.error('Failed to disconnect Gmail:', err);
      setError(err.message || 'Failed to disconnect Gmail');
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center">
          <Mail className="w-8 h-8 mr-3 text-indigo-600 dark:text-indigo-400" />
          Integration Connectors
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
          Link your professional mailboxes to auto-fetch messages, draft replies, and synchronize drafts.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs p-4 rounded-xl flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Connector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card: Gmail (Active Integration) */}
        <div className={cn(
          "relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 bg-white dark:bg-[#1f1f1f] shadow-sm",
          isConnected 
            ? "border-emerald-500/30 ring-1 ring-emerald-500/10 dark:border-emerald-500/20" 
            : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
        )}>
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#181818] flex items-center justify-center border border-slate-200 dark:border-slate-800">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H16.5V11L12 14.5L7.5 11V4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4Z" fill="#E0E0E0"/>
                  <path d="M20 4H17.5V11L12 15L6.5 11V4H4C2.9 4 2 4.9 2 6V7.5L12 14.5L22 7.5V6C22 4.9 21.1 4 20 4Z" fill="#C5221F"/>
                  <path d="M2 7.5V18C2 19.1 2.9 20 4 20H7.5V11L2 7.5Z" fill="#4285F4"/>
                  <path d="M22 7.5V18C22 19.1 21.1 20 20 20H16.5V11L22 7.5Z" fill="#34A853"/>
                  <path d="M12 14.5L7.5 11V4H16.5V11L12 14.5Z" fill="#FBBC05"/>
                </svg>
              </div>
              
              {isAuthLoading ? (
                <div className="flex h-6 items-center px-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                </div>
              ) : isConnected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-450 border border-slate-200 dark:border-slate-700">
                  Disconnected
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Google Gmail</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Connect to read incoming mail, run evaluate response pipelines, and draft replies directly from our workspace.
            </p>

            {isConnected && connectedEmail && (
              <div className="mt-4 p-2.5 bg-slate-50 dark:bg-[#181818] rounded-lg border border-slate-200/60 dark:border-slate-800/80">
                <span className="text-[10px] uppercase font-bold text-slate-405 dark:text-slate-500 tracking-wider">Linked Account</span>
                <p className="text-xs font-medium text-slate-700 dark:text-slate-350 truncate mt-0.5" title={connectedEmail}>
                  {connectedEmail}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            {isAuthLoading ? (
              <button disabled className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-2 border border-slate-200/50 dark:border-slate-800">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Checking...</span>
              </button>
            ) : isConnected ? (
              <button
                onClick={handleDisconnect}
                className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 hover:text-rose-700 dark:text-rose-450 dark:hover:text-rose-400 text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 border border-rose-500/20 transition-colors"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Disconnect Account</span>
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connectUrlLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
              >
                {connectUrlLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Connect Gmail</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Card: Microsoft Outlook (Coming Soon) */}
        <div className="relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-[#1f1f1f] shadow-sm opacity-60">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#181818] flex items-center justify-center border border-slate-200 dark:border-slate-800">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 5V19L12 22V2Z" fill="#0078D4"/>
                  <path d="M22 5.5V18.5C22 19.3 21.3 20 20.5 20H12V4H20.5C21.3 4 22 4.7 22 5.5Z" fill="#50D9FF"/>
                  <path d="M16.5 7.5H12V16.5H16.5C17.9 16.5 19 15.4 19 14V10C19 8.6 17.9 7.5 16.5 7.5Z" fill="#0078D4"/>
                </svg>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-500 border border-slate-200 dark:border-slate-700">
                Coming Soon
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Microsoft Outlook</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Connect your Outlook mailbox to sync conversations and evaluate AI-generated draft replies.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button disabled className="w-full bg-slate-50 dark:bg-[#181818] text-slate-400 text-xs font-semibold py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-850 cursor-not-allowed">
              Connect Outlook
            </button>
          </div>
        </div>

        {/* Card: IMAP/Other (Coming Soon) */}
        <div className="relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-[#1f1f1f] shadow-sm opacity-60">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#181818] flex items-center justify-center border border-slate-200 dark:border-slate-800">
                <Mail className="w-6 h-6 text-slate-400" />
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-500 border border-slate-200 dark:border-slate-700">
                Coming Soon
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">IMAP / Other Mail</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Connect via IMAP/SMTP server to integrate other custom or legacy email mailboxes.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button disabled className="w-full bg-slate-50 dark:bg-[#181818] text-slate-400 text-xs font-semibold py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-850 cursor-not-allowed">
              Connect IMAP
            </button>
          </div>
        </div>

      </div>

      {/* Security Info Card */}
      <div className="bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Secure OAuth Configuration</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            MailSense utilizes encrypted token management servers. We do not store your direct email credentials on our systems, keeping your Gmail workspace fully secure.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer">
          <span>Read Privacy Protocol</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>

    </div>
  );
}
