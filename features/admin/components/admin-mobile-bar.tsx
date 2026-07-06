'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from './admin-sidebar';
import { siteConfig } from '@/config/site';

export function AdminMobileBar() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between border-b-2 border-foreground bg-background px-4 py-3 lg:hidden">
      <Link href="/admin" className="font-display text-lg font-black uppercase">
        {siteConfig.name} · Admin
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Menú">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 bg-foreground p-0 text-background">
          <SheetHeader>
            <SheetTitle className="px-5 text-background">Panel</SheetTitle>
          </SheetHeader>
          <AdminSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
