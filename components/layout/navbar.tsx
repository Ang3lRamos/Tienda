'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { SearchBar } from './search-bar';
import { siteConfig, mainNav } from '@/config/site';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Menú móvil */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menú">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="text-2xl">{siteConfig.name}</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-4">
              {mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="font-serif text-2xl tracking-tight">
          {siteConfig.name}
        </Link>

        {/* Nav desktop */}
        <nav className="hidden flex-1 items-center justify-center gap-7 text-sm text-muted-foreground md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
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
          <Button variant="ghost" size="icon" asChild aria-label="Mi cuenta">
            <Link href="/account">
              <User className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild aria-label="Carrito">
            <Link href="/carrito">
              <ShoppingBag className="size-5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Buscador móvil desplegable */}
      <div
        className={cn(
          'overflow-hidden border-t border-border/60 px-4 transition-all lg:hidden',
          searchOpen ? 'max-h-20 py-3' : 'max-h-0 py-0',
        )}
      >
        <SearchBar autoFocus={searchOpen} onSubmitted={() => setSearchOpen(false)} />
      </div>
    </header>
  );
}
