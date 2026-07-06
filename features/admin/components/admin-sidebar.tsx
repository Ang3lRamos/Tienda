'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  Tags,
  Award,
  Boxes,
  ShoppingBag,
  Users,
  ShieldCheck,
  Percent,
  Sparkles,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { adminNav } from '@/config/site';
import { cn } from '@/lib/utils';

const icons: Record<string, LucideIcon> = {
  LayoutDashboard,
  Shirt,
  Tags,
  Award,
  Boxes,
  ShoppingBag,
  Users,
  ShieldCheck,
  Percent,
  Sparkles,
  Settings,
};

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col">
      {adminNav.map((item) => {
        const Icon = icons[item.icon] ?? LayoutDashboard;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 border-l-4 px-5 py-3 font-display text-xs font-bold tracking-[0.12em] uppercase transition-colors',
              active
                ? 'border-background bg-background/10 text-background'
                : 'border-transparent text-background/60 hover:text-background',
            )}
          >
            <Icon className="size-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
