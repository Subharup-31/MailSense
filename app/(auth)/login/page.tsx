'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Mail, Loader2, ArrowRight } from 'lucide-react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#191919] dark:bg-white flex items-center justify-center">
            <Mail className="w-4.5 h-4.5 text-white dark:text-[#191919]" />
          </div>
          <span className="text-xl font-semibold text-[#191919] dark:text-white tracking-tight">MailSense</span>
        </Link>
        <h1 className="text-2xl font-semibold text-[#191919] dark:text-white tracking-tight">Welcome back</h1>
        <p className="text-sm text-[#787774] dark:text-[#9B9A97] mt-2">Sign in to your workspace</p>
      </div>

      <form onSubmit={handleLogin} className="bg-white dark:bg-[#252525] border border-[#E9E9E7] dark:border-[#373737] rounded-xl p-6 shadow-sm space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@company.com"
            className="w-full px-3 py-2.5 text-sm bg-[#FBFBFA] dark:bg-[#191919] border border-[#E9E9E7] dark:border-[#373737] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2383E2]/30 focus:border-[#2383E2] text-[#191919] dark:text-white placeholder:text-[#C4C4C2]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#787774] dark:text-[#9B9A97] mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-3 py-2.5 text-sm bg-[#FBFBFA] dark:bg-[#191919] border border-[#E9E9E7] dark:border-[#373737] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2383E2]/30 focus:border-[#2383E2] text-[#191919] dark:text-white placeholder:text-[#C4C4C2]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#2383E2] hover:bg-[#1a6fc4] text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      <p className="text-center text-sm text-[#787774] dark:text-[#9B9A97] mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#2383E2] hover:underline font-medium">Sign up</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md text-center py-12 bg-white dark:bg-[#252525] border border-[#E9E9E7] dark:border-[#373737] rounded-xl p-6 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#2383E2]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
