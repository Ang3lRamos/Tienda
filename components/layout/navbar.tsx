'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Heart, LogOut, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Marquee } from '@/components/shared/marquee';
import { SearchBar } from './search-bar';
import { signOutAction } from '@/features/auth/actions';
import { siteConfig, mainNav } from '@/config/site';
import { cn } from '@/lib/utils';

export function Navbar({ isAuthed = false }: { isAuthed?: boolean }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <header className="sticky top-0 z-50 bg-background">
      {/* Barra de anuncios en movimiento */}
      <div className="border-b border-foreground/15 bg-foreground py-2 text-background">
        <Marquee
          items={[
            'Envío gratis desde $200.000',
            'Nueva colección Otoño/Invierno 2026',
            'Devoluciones en 30 días',
            '−25% en selección',
          ]}
        />
      </div>

      <div className="border-b-2 border-foreground">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          {/* Menú móvil */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menú">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 border-r-2 border-foreground">
              <SheetHeader>
                <SheetTitle className="font-display text-3xl font-black">
                  {siteConfig.name}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col px-4">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="border-b border-border py-4 font-display text-lg font-bold tracking-tight uppercase transition-colors hover:text-muted-foreground"
                  >
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/"
            className="font-display text-2xl font-black tracking-[-0.04em] uppercase"
          >
            {siteConfig.name}
          </Link>

          {/* Nav desktop */}
          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-display text-xs font-bold tracking-[0.14em] uppercase transition-colors hover:text-muted-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Buscador desktop */}
          <div className="ml-auto hidden max-w-xs flex-1 lg:block">
            <SearchBar />
          </div>

          {/* Acciones */}
          <div className="ml-auto flex items-center gap-0.5 lg:ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Buscar"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search className="size-5" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" asChild aria-label="Favoritos">
              <Link href="/favoritos">
                <Heart className="size-5" />
              </Link>
            </Button>
            {isAuthed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Mi cuenta">
                    <User className="size-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 border-2 border-foreground">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/pedidos">Pedidos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/favoritos">Favoritos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => startTransition(() => void signOutAction())}
                  >
                    <LogOut className="size-4" /> Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="icon" asChild aria-label="Iniciar sesión">
                <Link href="/login">
                  <User className="size-5" />
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" asChild aria-label="Carrito">
              <Link href="/carrito" className="relative">
                <ShoppingBag className="size-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Buscador móvil desplegable */}
        <div
          className={cn(
            'overflow-hidden border-t border-border px-4 transition-all lg:hidden',
            searchOpen ? 'max-h-20 py-3' : 'max-h-0 py-0',
          )}
        >
          <SearchBar autoFocus={searchOpen} onSubmitted={() => setSearchOpen(false)} />
        </div>
      </div>
    </header>
  );
}
