import Sidebar from '@/components/sidebar';
import { ThemeProvider } from '@/components/theme-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      <ThemeProvider>
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50/60 p-5 sm:p-6 lg:p-8 dark:bg-slate-950">
          {children}
        </main>
      </ThemeProvider>
    </div>
  );
}
