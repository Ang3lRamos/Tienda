import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { AdminMobileBar } from '@/features/admin/components/admin-mobile-bar';
import { SignOutButton } from '@/features/auth/components/sign-out-button';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s · Panel Átelier' },
  robots: { index: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Sidebar desktop */}
      <aside className="hidden bg-foreground text-background lg:flex lg:h-dvh lg:flex-col lg:sticky lg:top-0">
        <div className="border-b border-background/15 px-5 py-5">
          <Link href="/admin" className="font-display text-xl font-black uppercase">
            {siteConfig.name}
          </Link>
          <p className="text-[0.65rem] tracking-[0.2em] text-background/50 uppercase">
            Administración
          </p>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <AdminSidebar />
        </div>
        <div className="space-y-3 border-t border-background/15 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs tracking-wide text-background/60 uppercase hover:text-background"
          >
            Ver tienda <ArrowUpRight className="size-3.5" />
          </Link>
          <SignOutButton className="w-full border-background/40 text-background hover:bg-background hover:text-foreground" />
        </div>
      </aside>

      {/* Contenido */}
      <div className="min-w-0">
        <AdminMobileBar />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
