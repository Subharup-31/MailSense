'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Layers, 
  MessageSquare,
  LineChart,
  Sun,
  Moon,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from './theme-provider';

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Connectors', href: '/dashboard/connectors', icon: Layers },
    { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  ];

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-200 p-5 transition-colors duration-300 dark:border-slate-800 lg:flex lg:flex-col lg:justify-between glass-panel">
      <div>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <LineChart className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none text-slate-900 dark:text-white">MailSense</h1>
              <span className="mt-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Gmail workspace</span>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-center space-x-3 rounded-lg px-3 py-2.5 transition-colors duration-200",
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/60" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                )}
              >
                <Icon className={cn(
                  "h-[18px] w-[18px]",
                  isActive ? "text-indigo-600 dark:text-indigo-300" : "text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"
                )} />
                <span className="text-sm">{link.name}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4">
        <button
          onClick={toggleTheme}
          className="group flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 transition-colors duration-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-900"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <div className="flex items-center space-x-3">
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-medium">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-medium">Dark Mode</span>
              </>
            )}
          </div>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {theme}
          </span>
        </button>

        <button
          onClick={handleSignOut}
          className="group flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-700 transition-colors duration-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300 dark:hover:bg-slate-900"
        >
          <div className="flex items-center space-x-3">
            <LogOut className="h-4 w-4 text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200" />
            <span className="text-xs font-medium">Sign Out</span>
          </div>
        </button>

        <div className="flex items-center space-x-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            MS
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">Evaluation Console</p>
            <span className="block truncate text-[10px] text-slate-500 dark:text-slate-500">Gmail connector ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
