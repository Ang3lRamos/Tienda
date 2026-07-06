'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShoppingBag, Heart, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { title: 'Perfil', href: '/account', icon: User },
  { title: 'Pedidos', href: '/account/pedidos', icon: ShoppingBag },
  { title: 'Favoritos', href: '/account/favoritos', icon: Heart },
  { title: 'Direcciones', href: '/account/direcciones', icon: MapPin },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="grid grid-cols-2 gap-1 md:flex md:flex-col md:gap-0">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-w-0 items-center gap-2 border-2 px-3 py-3 font-display text-xs font-bold tracking-[0.1em] uppercase transition-colors md:gap-3 md:border-0 md:border-l-2 md:px-4',
              active
                ? 'border-foreground bg-foreground text-background md:bg-transparent md:text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
