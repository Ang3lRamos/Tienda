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
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:gap-0">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 border-2 px-4 py-3 font-display text-xs font-bold tracking-[0.12em] whitespace-nowrap uppercase transition-colors md:border-0 md:border-l-2',
              active
                ? 'border-foreground bg-foreground text-background md:bg-transparent md:text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            <item.icon className="size-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
